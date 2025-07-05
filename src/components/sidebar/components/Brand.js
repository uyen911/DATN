import React from "react";
import { Flex, useColorModeValue, Text } from "@chakra-ui/react";
import { HSeparator } from "components/separator/Separator";

export function SidebarBrand() {
  // Chakra color mode
  let logoColor = useColorModeValue("navy.700", "white");

  return (
    <Flex align="center" direction="column">
      <Text
  fontSize="3xl"
  fontWeight="bold"
  bgGradient="linear(to-r, teal.400, blue.500)"
  bgClip="text"
  fontFamily="'Pacifico', cursive"
  textShadow="1px 1px 2px rgba(0, 0, 0, 0.3)"
  my="32px"
>
  Uvenla  Home
</Text>

      <HSeparator mb="20px" />
    </Flex>
  );
}

export default SidebarBrand;
