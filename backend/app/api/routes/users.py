import uuid
from typing import Any
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import col, delete, func, select

from app import crud
from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models import (
    Item,
    Message,
    UpdatePassword,
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)
from app.utils import generate_new_account_email, send_email

router = APIRouter(prefix="/users", tags=["users"])

# Background task to check subscription expirations
def check_subscription_expirations(session: SessionDep):
    users = session.exec(select(User)).all()
    for user in users:
        if user.has_subscription and user.expiry_date:
            if datetime.utcnow() > user.expiry_date:
                user.has_subscription = False
                user.expiry_date = None
                session.add(user)
    session.commit()

@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve users.
    """
    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()
    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()
    return UsersPublic(data=users, count=count)

@router.post(
    "/", 
    dependencies=[Depends(get_current_active_superuser)], 
    response_model=UserPublic
)
def create_user(
    *, 
    session: SessionDep, 
    user_in: UserCreate,
    background_tasks: BackgroundTasks
) -> Any:
    """
    Create new user.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    # Set expiry date if trial is enabled
    if user_in.is_trial:
        user_in.expiry_date = datetime.utcnow() + timedelta(days=30)

    user = crud.create_user(session=session, user_create=user_in)
    if settings.emails_enabled and user_in.email:
        email_data = generate_new_account_email(
            email_to=user_in.email, 
            username=user_in.email, 
            password=user_in.password
        )
        send_email(
            email_to=user_in.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    
    background_tasks.add_task(check_subscription_expirations, session)
    return user

@router.patch("/me", response_model=UserPublic)
def update_user_me(
    *, 
    session: SessionDep, 
    user_in: UserUpdateMe, 
    current_user: CurrentUser
) -> Any:
    """
    Update own user.
    """
    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, 
                detail="User with this email already exists"
            )
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@router.patch("/me/password", response_model=Message)
def update_password_me(
    *, 
    session: SessionDep, 
    body: UpdatePassword, 
    current_user: CurrentUser
) -> Any:
    """
    Update own password.
    """
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, 
            detail="New password cannot be the same as the current one"
        )
    hashed_password = get_password_hash(body.new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    session.commit()
    return Message(message="Password updated successfully")

@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user

@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """
    if current_user.is_superuser:
        raise HTTPException(
            status_code=403, 
            detail="Super users are not allowed to delete themselves"
        )
    statement = delete(Item).where(col(Item.owner_id) == current_user.id)
    session.exec(statement)
    session.delete(current_user)
    session.commit()
    return Message(message="User deleted successfully")

@router.post("/signup", response_model=UserPublic)
def register_user(
    session: SessionDep, 
    user_in: UserRegister,
    background_tasks: BackgroundTasks
) -> Any:
    """
    Create new user without the need to be logged in.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user_create = UserCreate.model_validate(user_in)
    user_create.is_trial = True  # Default to trial for new signups
    user_create.expiry_date = datetime.utcnow() + timedelta(days=30)
    user = crud.create_user(session=session, user_create=user_create)
    background_tasks.add_task(check_subscription_expirations, session)
    return user

@router.get("/{user_id}", response_model=UserPublic)
def read_user_by_id(
    user_id: uuid.UUID, 
    session: SessionDep, 
    current_user: CurrentUser
) -> Any:
    """
    Get a specific user by id.
    """
    user = session.get(User, user_id)
    if user == current_user:
        return user
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )
    return user
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def update_user(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    user_in: UserUpdate,
    background_tasks: BackgroundTasks
) -> Any:
    logger.debug(f"Starting update_user for user_id: {user_id}, input: {user_in.dict()}")
    db_user = session.get(User, user_id)
    if not db_user:
        logger.info(f"User {user_id} not found")
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    logger.debug(f"Found user: {db_user.id}")
    
    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != user_id:
            logger.info(f"Email conflict: {user_in.email}")
            raise HTTPException(
                status_code=409, 
                detail="User with this email already exists"
            )

    # Handle subscription expiration logic on db_user
    if user_in.is_trial and not db_user.expiry_date:
        db_user.expiry_date = datetime.utcnow() + timedelta(days=30)
        logger.debug(f"Set trial expiry: {db_user.expiry_date}")
    if user_in.has_subscription is False:
        db_user.expiry_date = None
        logger.debug("Cleared expiry date due to no subscription")

    logger.debug("Calling crud.update_user")
    db_user = crud.update_user(session=session, db_user=db_user, user_in=user_in)
    logger.debug("crud.update_user completed")
    
    background_tasks.add_task(check_subscription_expirations, session)
    return db_user

@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(
    session: SessionDep, 
    current_user: CurrentUser, 
    user_id: uuid.UUID
) -> Message:
    """
    Delete a user.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=403, 
            detail="Super users are not allowed to delete themselves"
        )
    statement = delete(Item).where(col(Item.owner_id) == user_id)
    session.exec(statement)
    session.delete(user)
    session.commit()
    return Message(message="User deleted successfully")