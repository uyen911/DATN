import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  Text,
  FormLabel,
  Box,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import React from "react";

export default function ViewBranchModal({ isOpen, onClose, branch }) {
  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/200";

  if (!branch) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Chi tiết chi nhánh</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction={{ base: "column", md: "row" }} gap="24px">
            {/* Bên trái: Hình ảnh */}
            <Box flex="1" minW={{ base: "100%", md: "200px" }}>
              <FormLabel fontWeight="bold" color="gray.700" mb={2}>
                Hình ảnh:
              </FormLabel>
              <Image
                src={branch.imageUrl || PLACEHOLDER_IMAGE}
                alt="Branch"
                boxSize={{ base: "100%", md: "200px" }}
                objectFit="cover"
                borderRadius="12px"
                border="1px solid"
                borderColor="gray.200"
              />
            </Box>

            {/* Bên phải: Thông tin chi tiết */}
            <Box flex="2">
              <VStack align="start" spacing="16px">
                <Box w="100%">
                  <FormLabel fontWeight="bold" color="gray.700">
                    Tiêu đề:
                  </FormLabel>
                  <Text fontSize="md" color="gray.900">
                    {branch.title || "—"}
                  </Text>
                </Box>

                <Box w="100%">
                  <FormLabel fontWeight="bold" color="gray.700">
                    Địa chỉ:
                  </FormLabel>
                  <Text fontSize="md" color="gray.900">
                    {branch.address || "—"}
                  </Text>
                </Box>

                <Box w="100%">
                  <FormLabel fontWeight="bold" color="gray.700">
                    Số điện thoại:
                  </FormLabel>
                  <Text fontSize="md" color="gray.900">
                    {branch.phone || "—"}
                  </Text>
                </Box>

                <Box w="100%">
                  <FormLabel fontWeight="bold" color="gray.700">
                    Tên quản lý:
                  </FormLabel>
                  <Text fontSize="md" color="gray.900">
                    {branch.managerName || "—"}
                  </Text>
                </Box>

                <Box w="100%">
                  <FormLabel fontWeight="bold" color="gray.700">
                    Trạng thái:
                  </FormLabel>
                  <Flex alignItems="center">
                    {branch.status === "active" ? (
                      <CheckCircleTwoTone twoToneColor="#16A34A" style={{ fontSize: "20px" }} />
                    ) : (
                      <CloseCircleTwoTone twoToneColor="#DC2626" style={{ fontSize: "20px" }} />
                    )}
                    <Text fontSize="md" color="gray.900" ml={2}>
                      {branch.status === "active" ? "Kích hoạt" : "Tạm ngưng"}
                    </Text>
                  </Flex>
                </Box>
              </VStack>
            </Box>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Đóng
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}