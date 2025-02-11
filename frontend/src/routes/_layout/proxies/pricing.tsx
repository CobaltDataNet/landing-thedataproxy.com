import {
  Container,
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Divider,
  Flex,
  Tabs,
  Tr,
  Tbody,
  Th,
  Td,
  TabList,
  TabPanels,
  Tab,
  Table,
  Thead,
  TabPanel,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FaNetworkWired, FaCloud, FaMobileAlt } from "react-icons/fa";

const proxyPricing = {
  Residential: [
    { tier: "Starter", pricePerGB: "$2.00", trafficLimit: "Up to 500GB" },
    { tier: "Business", pricePerGB: "$1.50", trafficLimit: "Up to 2TB", badge: "Most Popular" },
    { tier: "Business Plus+", pricePerGB: "$1.25", trafficLimit: "Up to 10TB" },
    { tier: "Ultra Enterprise", pricePerGB: "Custom Pricing", trafficLimit: "Unlimited" },
  ],
  "Residential Mobile": [
    { tier: "Starter", pricePerGB: "$2.50", trafficLimit: "Up to 500GB" },
    { tier: "Business", pricePerGB: "$1.80", trafficLimit: "Up to 2TB" },
    { tier: "Business Plus+", pricePerGB: "$1.50", trafficLimit: "Up to 10TB" },
    { tier: "Ultra Enterprise", pricePerGB: "Custom Pricing", trafficLimit: "Unlimited" },
  ],
  Datacenter: [
    { tier: "Starter", pricePerGB: "$1.00", trafficLimit: "Up to 5TB" },
    { tier: "Business", pricePerGB: "$0.75", trafficLimit: "Up to 20TB" },
    { tier: "Business Plus+", pricePerGB: "$0.50", trafficLimit: "Up to 50TB" },
    { tier: "Ultra Enterprise", pricePerGB: "Custom Pricing", trafficLimit: "Unlimited" },
  ],
};

const PricingPage = () => {
  const [selectedProduct, setSelectedProduct] = useState("Residential");
  const tabBg = useColorModeValue("gray.700", "gray.800");
  const tabColor = "white";
  const tabHoverBg = useColorModeValue("gray.600", "gray.700");

  const productIcons = {
    Residential: <FaCloud size={18} />, 
    "Residential Mobile": <FaMobileAlt size={18} />, 
    Datacenter: <FaNetworkWired size={18} />,
  };
  return (
    <Container maxW="full" py={10}>
      <Flex align="center" justify="space-between" py={6} flexWrap="wrap" gap={4}>
        <Box textAlign="left" flex="1">
          <Text fontSize="xl" fontWeight="bold">Proxy Pricing Plans</Text>
          <Text fontSize="sm">Compare our flexible and scalable pricing options.</Text>
        </Box>
      </Flex>
      <Divider my={4} />
      <VStack spacing={6} align="stretch" mb={6}>
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontSize="lg" fontWeight="bold">Better Rates Over Time</Text>
          <Text fontSize="sm">As you use more bandwidth, you unlock lower pricing tiers, ensuring the best rates for high-volume users.</Text>
        </Box>
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontSize="lg" fontWeight="bold">Scalable Plans</Text>
          <Text fontSize="sm">Upgrade seamlessly as your needs grow. Flexible pricing ensures cost efficiency for all user levels.</Text>
        </Box>
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontSize="lg" fontWeight="bold">Enterprise Discounts</Text>
          <Text fontSize="sm">Custom pricing is available for high-volume clients with special requirements. Contact our sales team for exclusive offers.</Text>
        </Box>
      </VStack>
      <Tabs variant="soft-rounded" colorScheme="blue" onChange={(index) => setSelectedProduct(Object.keys(proxyPricing)[index])}>
        <TabList>
          {Object.keys(proxyPricing).map((product) => (
            <Tab key={product} bg={tabBg} color={tabColor} px={4} py={2} borderRadius="md" _selected={{ color: "white" }} _hover={{ bg: tabHoverBg }}>
              {product.replace(" ", " \u2022 ")}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {Object.keys(proxyPricing).map((product) => (
            <TabPanel key={product}>
              <Table variant="simple" size="lg" mt={6}>
                <Thead>
                  <Tr>
                    <Th>Plan</Th>
                    <Th>Price per GB</Th>
                    <Th>Traffic Limit</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {proxyPricing[product].map((tier) => (
                    <Tr key={tier.tier}>
                      <Td>
                        <Text fontWeight="bold">{tier.tier}</Text>
                        {tier.badge && <Badge colorScheme="blue" ml={2}>{tier.badge}</Badge>}
                      </Td>
                      <Td color="teal.500" fontWeight="bold">{tier.pricePerGB}</Td>
                      <Td>{tier.trafficLimit}</Td>
                      <Td>
                        {tier.pricePerGB === "Custom Pricing" ? (
                          <Button colorScheme="blue" variant="outline" size="sm">Contact Sales</Button>
                        ) : (
                          <Button colorScheme="blue" size="sm">Choose Plan</Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export const Route = createFileRoute("/_layout/proxies/pricing")({
  component: PricingPage,
});

export default PricingPage;
