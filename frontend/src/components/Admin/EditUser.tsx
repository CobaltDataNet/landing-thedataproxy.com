import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { UsersService, type ApiError, type UserPublic as BaseUserPublic, type UserUpdate as BaseUserUpdate } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { emailPattern, handleError } from "../../utils";

// Extend UserPublic to include missing fields until client is regenerated
interface UserPublic extends BaseUserPublic {
  has_subscription: boolean;
  is_trial: boolean;
  is_deactivated: boolean;
  expiry_date?: string | null;
}

interface UserUpdate extends BaseUserUpdate {
  has_subscription?: boolean;
  is_trial?: boolean;
  is_deactivated?: boolean;
  expiry_date?: string;
}

interface EditUserProps {
  user: UserPublic;
  isOpen: boolean;
  onClose: () => void;
}

interface UserUpdateForm extends UserUpdate {
  confirm_password: string;
}

const EditUser = ({ user, isOpen, onClose }: EditUserProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();

  const isExpired = user.expiry_date ? new Date(user.expiry_date) < new Date() : false;

  const defaultValues = {
    ...user,
    has_subscription: user.has_subscription || false,
    is_trial: user.is_trial || false,
    is_deactivated: user.is_deactivated || false,
    expiry_date: user.expiry_date || "",
    confirm_password: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: (data: UserUpdateForm) => {
      const requestData: UserUpdate = { ...data };
      delete (requestData as any).confirm_password;
      return UsersService.updateUser({
        userId: user.id,
        requestBody: requestData,
      });
    },
    onSuccess: () => {
      showToast("Success!", "User updated successfully.", "success");
      onClose();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const onSubmit: SubmitHandler<UserUpdateForm> = async (data) => {
    if (data.password === "") {
      data.password = undefined;
    }
    mutation.mutate(data);
  };

  const onCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "sm", md: "md" }} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Edit User</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isInvalid={!!errors.email}>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: emailPattern,
              })}
              placeholder="Email"
              type="email"
            />
            {errors.email && <FormErrorMessage>{errors.email.message}</FormErrorMessage>}
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="name">Full Name</FormLabel>
            <Input id="name" {...register("full_name")} type="text" />
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.password}>
            <FormLabel htmlFor="password">Set Password</FormLabel>
            <Input
              id="password"
              {...register("password", {
                minLength: { value: 8, message: "Password must be at least 8 characters" },
              })}
              placeholder="Password"
              type="password"
            />
            {errors.password && <FormErrorMessage>{errors.password.message}</FormErrorMessage>}
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.confirm_password}>
            <FormLabel htmlFor="confirm_password">Confirm Password</FormLabel>
            <Input
              id="confirm_password"
              {...register("confirm_password", {
                validate: (value) => value === getValues().password || "The passwords do not match",
              })}
              placeholder="Password"
              type="password"
            />
            {errors.confirm_password && (
              <FormErrorMessage>{errors.confirm_password.message}</FormErrorMessage>
            )}
          </FormControl>
          <Flex gap={4} mt={4}>
            <FormControl>
              <Checkbox {...register("is_superuser")} colorScheme="teal">
                Is Superuser?
              </Checkbox>
            </FormControl>
            <FormControl>
              <Checkbox {...register("is_active")} colorScheme="teal">
                Is Active?
              </Checkbox>
            </FormControl>
          </Flex>
          <Flex direction="column" mt={4} gap={2}>
            <FormControl>
              <Checkbox {...register("has_subscription")} colorScheme="teal">
                Has Subscription
              </Checkbox>
            </FormControl>
            <FormControl>
              <Checkbox {...register("is_trial")} colorScheme="teal">
                Is Trial
              </Checkbox>
            </FormControl>
            <FormControl>
              <Checkbox {...register("is_deactivated")} colorScheme="teal">
                Is Deactivated
              </Checkbox>
            </FormControl>
            {user.expiry_date && (
              <Text fontSize="sm" color={isExpired ? "red.500" : "gray.500"}>
                Subscription {isExpired ? "Expired" : "Expires"}:{" "}
                {new Date(user.expiry_date).toLocaleDateString()}
              </Text>
            )}
          </Flex>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="primary" type="submit" isLoading={isSubmitting} isDisabled={!isDirty}>
            Save
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditUser;