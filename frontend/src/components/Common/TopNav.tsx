import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Icon,
  Text,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  Button,
  Tooltip,
  useDisclosure,
  Container,
  Portal,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink } from "@tanstack/react-router";
import { 
  FiLogOut, 
  FiMenu, 
  FiUsers, 
  FiSearch, 
  FiChevronDown, 
  FiUser,
  FiDatabase,
  FiCode,
  FiTool,
  FiPieChart,
  FiTarget,
  FiMonitor,
  FiGlobe,
  FiFileText,
  FiBook,
  FiHelpCircle,
  FiShield,
  FiTrendingUp,
  FiSettings
} from "react-icons/fi";

import Logo from "/assets/images/data-proxy-logo.png";
import type { UserPublic } from "../../client";
import useAuth from "../../hooks/useAuth";

interface NavItem {
  title: string;
  icon?: any;
  path?: string;
  subItems?: SubItem[];
  description?: string;
}

interface SubItem {
  title: string;
  path: string;
  description?: string;
  icon?: any;
}

interface NavItemsProps {
  onClose?: () => void;
  isMobile?: boolean;
}

const navStructure: NavItem[] = [
  {
    title: "Web Scraping Tools",
    icon: FiTool,
    description: "Professional web scraping tools and proxies for data collection",
    subItems: [
      { 
        title: "HTML Scraper", 
        path: "/tools/html-scraper",
        description: "Extract data from HTML websites with precision",
        icon: FiCode
      },
      { 
        title: "API Scraper", 
        path: "/tools/api-scraper",
        description: "Collect data from APIs with reliable proxies",
        icon: FiDatabase
      },
      { 
        title: "Proxy Dashboard", 
        path: "/tools/proxy-dashboard",
        description: "Monitor and manage your web scraping proxies",
        icon: FiMonitor
      },
      { 
        title: "Scheduler", 
        path: "/tools/scheduler",
        description: "Automate your web scraping jobs with scheduling",
        icon: FiTarget
      }
    ]
  },
  {
    title: "Data Solutions",
    icon: FiDatabase,
    description: "Data extraction and processing solutions for businesses",
    subItems: [
      { 
        title: "Market Research", 
        path: "/solutions/market-research",
        description: "Collect market data through web scraping",
        icon: FiPieChart
      },
      { 
        title: "Price Monitoring", 
        path: "/solutions/price-monitoring",
        description: "Track competitor pricing across websites",
        icon: FiTrendingUp
      },
      { 
        title: "AI Training Data", 
        path: "/solutions/training-ai",
        description: "Build machine learning datasets through web scraping",
        icon: FiDatabase
      },
      { 
        title: "Content Aggregation", 
        path: "/solutions/content-aggregation",
        description: "Gather content from multiple web sources",
        icon: FiFileText
      }
    ]
  },
  {
    title: "Global Proxy Network",
    icon: FiGlobe,
    description: "Worldwide proxy infrastructure for web scraping",
    subItems: [
      { 
        title: "Proxy Locations", 
        path: "/network/locations",
        description: "Browse our global proxy server locations",
        icon: FiGlobe
      },
      { 
        title: "Network Status", 
        path: "/network/status",
        description: "Check real-time proxy performance and availability",
        icon: FiMonitor
      },
      { 
        title: "Security Features", 
        path: "/network/security",
        description: "Learn about our proxy security protocols",
        icon: FiShield
      },
      { 
        title: "Proxy Types", 
        path: "/network/proxy-types",
        description: "Different proxy types for various scraping needs",
        icon: FiSettings
      }
    ]
  },
  {
    title: "Resources",
    icon: FiBook,
    description: "Documentation and learning resources for web scraping",
    subItems: [
      { 
        title: "API Documentation", 
        path: "https://apis.thedataproxy.com/redoc",
        description: "Technical documentation for our scraping APIs",
        icon: FiCode
      },
      { 
        title: "Web Scraping Guides", 
        path: "/resources/web-scraping-guides",
        description: "Learn how to use our web scraping tools effectively",
        icon: FiBook
      },
      { 
        title: "Code Examples", 
        path: "/resources/code-examples",
        description: "Sample code for web scraping in multiple languages",
        icon: FiCode
      },
      { 
        title: "Support Center", 
        path: "/resources/support-center",
        description: "Get help with your web scraping projects",
        icon: FiHelpCircle
      }
    ]
  }
];

const NavItems = ({ onClose, isMobile = false }: NavItemsProps) => {
  const queryClient = useQueryClient();
  const textColor = "gray.800";
  const hoverColor = "blue.600";
  const bgActive = "blue.100";
  const activeTextColor = "blue.800";
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  const finalNavStructure = [...navStructure];
  if (currentUser?.is_superuser && !finalNavStructure.some(item => item.title === "Admin")) {
    finalNavStructure.push({ title: "Admin", icon: FiUsers, path: "/admin" });
  }

  const handleMenuToggle = (index: number) => {
    setActiveMenuIndex(activeMenuIndex === index ? null : index);
  };

  const renderNavItems = (items: NavItem[]) =>
    items.map(({ icon, title, path, subItems, description }, index) => {
      const isActive = activeMenuIndex === index;

      if (subItems) {
        return (
          <Box key={title} position="relative">
            <Flex
              as="button"
              px={4}
              py={2}
              color={textColor}
              _hover={{ color: hoverColor }}
              _active={{ bg: bgActive, color: activeTextColor }}
              align="center"
              onClick={() => handleMenuToggle(index)}
            >
              {icon && <Icon as={icon} mr={2} />}
              <Text>{title}</Text>
              <Icon as={FiChevronDown} ml={1} />
            </Flex>
            {isActive && (
              <Box
                zIndex={20}
                w="100vw"
                maxW="1200px"
                bg="white"
                borderRadius="md"
                boxShadow="md"
                position="fixed"
                left="50%"
                transform="translateX(-50%)"
                top={{ base: "94px", md: "90px" }}
              >
                {description && (
                  <Box px={3} py={2} borderBottom="1px" borderColor="gray.200">
                    <Text fontSize="sm" color="gray.600">{description}</Text>
                  </Box>
                )}
                <Flex wrap="wrap" direction={{ base: "column", md: "row" }} p={2}>
                {subItems.map((subItem) => (
  <Box
    key={subItem.title}
    as={RouterLink}
    to={subItem.path}
    color={textColor}
    _hover={{ color: hoverColor, bg: "gray.100" }}
    onClick={() => {
      onClose?.();
      setActiveMenuIndex(null);
    }}
    flex={{ base: "1 0 100%", md: "1 0 25%" }}
    minW={0}
    p={2}
  >
    <Flex align="flex-start">
      {subItem.icon && (
        <Icon 
          as={subItem.icon} 
          mr={2} 
          boxSize={5} 
          mt="2px" // Small top margin to align with the title text
        />
      )}
      <Box>
        <Text fontWeight="medium">{subItem.title}</Text>
        {subItem.description && (
          <Text fontSize="xs" color="gray.500" mt={1}>{subItem.description}</Text>
        )}
      </Box>
    </Flex>
  </Box>
))}
                </Flex>
              </Box>
            )}
          </Box>
        );
      }

      return (
        <Flex
          key={title}
          as={RouterLink}
          to={path}
          px={4}
          py={2}
          color={textColor}
          _hover={{ color: hoverColor }}
          activeProps={{
            style: { background: bgActive, color: activeTextColor },
          }}
          align="center"
          onClick={onClose}
        >
          {icon && <Icon as={icon} mr={2} />}
          <Text>{title}</Text>
        </Flex>
      );
    });

  return (
    <Flex 
      align="center" 
      gap={2} 
      flexDir={isMobile ? "column" : "row"}
      justify="center"
    >
      {renderNavItems(finalNavStructure)}
    </Flex>
  );
};

const TopNav = () => {
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { logout } = useAuth();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const textColor = "gray.800";
  const hoverColor = "blue.600";

  const handleLogout = async () => {
    logout();
    onClose();
  };

  return (
    <Box
      bg="blue.50"
      px={4}
      py={2}
      position="sticky"
      top="0"
      zIndex="sticky"
      boxShadow="sm"
      w="100%"
    >
      <Container maxW="1200px" px={0} position="relative">
        <Flex 
          align="center" 
          justify="space-between" 
          w="100%"
        >
          <Link href="/" as={RouterLink}>
            <Image src={Logo} alt="Web Scraping Proxy Network" h="40px" />
          </Link>

          <IconButton
            onClick={onOpen}
            display={{ base: "flex", md: "none" }}
            aria-label="Open Menu"
            fontSize="20px"
            color="blue.600"
            icon={<FiMenu />}
            variant="ghost"
          />

          <Flex 
            align="center" 
            gap={4} 
            display={{ base: "none", md: "flex" }}
            flex={1}
            justify="center"
          >
            <NavItems />
          </Flex>

          <Flex 
            align="center" 
            display={{ base: "none", md: "flex" }}
          >
            {currentUser ? (
              <Box position="relative">
                <Flex
                  as="button"
                  px={4}
                  py={2}
                  color={textColor}
                  _hover={{ color: hoverColor }}
                  onClick={onOpen}
                >
                  <Icon as={FiUser} mr={2} />
                  <Text maxW="200px" isTruncated>{currentUser.email}</Text>
                  <Icon as={FiChevronDown} ml={1} />
                </Flex>
                {isOpen && (
                  <Box
                    position="absolute"
                    right={0}
                    top="100%"
                    bg="white"
                    boxShadow="md"
                    borderRadius="md"
                    zIndex={20}
                  >
                    <Box as={RouterLink} to="/settings" p={2} display="block" _hover={{ bg: "gray.100" }}>
                      Settings
                    </Box>
                    <Box as="button" p={2} display="block" _hover={{ bg: "gray.100" }} onClick={handleLogout}>
                      Log out
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Flex gap={2}>
                <Button as={RouterLink} to="https://dashboard.thedataproxy.com/signup" colorScheme="blue" variant="solid" size="sm">
                  Start Free Trial
                </Button>
                <Button as={RouterLink} to="https://dashboard.thedataproxy.com/login" variant="outline" colorScheme="blue" size="sm">
                  Login
                </Button>
              </Flex>
            )}
          </Flex>
        </Flex>

        <Box
          display={{ base: isOpen ? "block" : "none", md: "none" }}
          position="absolute"
          top="100%"
          left={0}
          right={0}
          bg="white"
          boxShadow="md"
          p={4}
          zIndex={20}
        >
          <Flex flexDir="column" gap={4}>
            <NavItems onClose={onClose} isMobile={true} />
            {currentUser ? (
              <>
                <Text color={textColor} fontSize="sm">
                  Logged in as: {currentUser.email}
                </Text>
                <Flex flexDir="column" gap={2}>
                  <Box
                    as={RouterLink}
                    to="/settings"
                    p={2}
                    color={textColor}
                    _hover={{ color: hoverColor }}
                    onClick={onClose}
                  >
                    Settings
                  </Box>
                  <Flex
                    as="button"
                    onClick={handleLogout}
                    color={hoverColor}
                    fontWeight="bold"
                    alignItems="center"
                    gap={2}
                  >
                    <FiLogOut />
                    <Text>Log out</Text>
                  </Flex>
                </Flex>
              </>
            ) : (
              <Flex flexDir="column" gap={2}>
                <Button
                  as={RouterLink}
                  to="https://dashboard.thedataproxy.com/signup"
                  colorScheme="blue"
                  variant="solid"
                  size="sm"
                  onClick={onClose}
                >
                  Start Free Trial
                </Button>
                <Button
                  as={RouterLink}
                  to="https://dashboard.thedataproxy.com/login"
                  variant="outline"
                  colorScheme="blue"
                  size="sm"
                  onClick={onClose}
                >
                  Login
                </Button>
              </Flex>
            )}
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default TopNav;