import {
  Box,
  Flex,
  CircularProgress,
  useDisclosure,
  Button as ChakraButton,
  useColorModeValue,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Image,
  VStack,
  Heading,
} from "@chakra-ui/react";
import { Input, Table, Button, Select, Popconfirm,Switch } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import React, { useEffect, useState, useCallback } from "react";
import { getAllServices, deleteService } from "services/serviceService";
import { getAllCategories } from "services/categoryService";
import { debounce } from "lodash";
import { message } from "antd";
import { formatCurrency } from "utils/formatCurrency";
import Card from "components/card/Card";
import CreateServiceModal from "./components/CreateServiceModal";
import EditServiceModal from "./components/EditServiceModal";

const ServiceDetailsModal = ({ isOpen, onClose, service }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="600px">
        <ModalHeader fontSize="xl" fontWeight="bold" color="blue.700">
          Chi tiết Dịch vụ
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {service && (
            <Flex
              direction={{ base: "column", md: "row" }}
              gap="20px"
              alignItems={{ base: "center", md: "flex-start" }}
            >
              {/* Image Section */}
              <Box
                width="150px"
                height="150px"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="10px"
                overflow="hidden"
                flexShrink={0}
              >
                {service.images && service.images.length > 0 ? (
                  <Image
                    src={service.images[0]}
                    alt="Service"
                    width="100%"
                    height="100%"
                    objectFit="cover"
                  />
                ) : (
                  <Flex
                    width="100%"
                    height="100%"
                    bg="gray.100"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    p={2}
                  >
                    <Text fontSize="sm" color="gray.500">
                      Không có hình ảnh
                    </Text>
                  </Flex>
                )}
              </Box>

              {/* Details Section */}
              <Box
                flex="1"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="10px"
                p="16px"
                boxShadow="sm"
              >
                <VStack align="start" spacing="12px">
                  <Text fontSize="md" color="gray.700">
                    <strong style={{ fontWeight: "semibold" }}>Tên dịch vụ:</strong> {service.serviceName}
                  </Text>
                  <Text fontSize="md" color="gray.700">
                    <strong style={{ fontWeight: "semibold" }}>Giá cơ bản:</strong>{" "}
                    {service.basePrice ? formatCurrency(service.basePrice) : "Không có"}
                  </Text>
                  <Text fontSize="md" color="gray.700">
                    <strong style={{ fontWeight: "semibold" }}>Mô tả ngắn:</strong>{" "}
                    {service.shortDescription || "Không có"}
                  </Text>
                  <Text fontSize="md" color="gray.700">
                    <strong style={{ fontWeight: "semibold" }}>Địa chỉ:</strong>{" "}
                    {service.address || "Không có"}
                  </Text>
                  <Text fontSize="md" color="gray.700">
                    <strong style={{ fontWeight: "semibold" }}>Danh mục:</strong>{" "}
                    {service.categoryId?.categoryName || "Không có"}
                  </Text>
                </VStack>
              </Box>
            </Flex>
          )}
        </ModalBody>
        <ModalFooter>
          <ChakraButton
            colorScheme="blue"
            size="md"
            width="100px"
            mx="auto"
            onClick={onClose}
          >
            Đóng
          </ChakraButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [editServiceData, setEditServiceData] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const textColor = useColorModeValue("#1E40AF", "white");

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose,
  } = useDisclosure();

const fetchServices = useCallback(
  async (
    page = 1,
    limit = 100,
    searchParam = searchTerm,
    categoryParam = categoryId
  ) => {
    setLoading(true);
    try {
      const data = await getAllServices(page, limit, searchParam, categoryParam);
      let allServices = data?.services || [];

      // Nếu muốn lọc theo giá → lọc phía client
      if ((minPrice || maxPrice) && allServices.length > 0) {
        const min = minPrice ? parseFloat(minPrice) : -Infinity;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;

        allServices = allServices.filter(service => {
          const price = parseFloat(service.basePrice) || 0;
          return price >= min && price <= max;
        });
      }

      setServices(allServices);
    } catch (error) {
      console.error("Lỗi lấy dịch vụ:", error);
      message.error("Không thể lấy danh sách dịch vụ.");
      setServices([]);
    } finally {
      setLoading(false);
    }
  },
  [searchTerm, categoryId, minPrice, maxPrice]
);


  const fetchCategories = useCallback(async () => {
    const data = await getAllCategories();
    setCategories(data.categories || []);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

const debouncedFetchServices = useCallback(
  debounce((search, min, max) => {
    setSearchTerm(search);
    setMinPrice(min);
    setMaxPrice(max);
  }, 800),
  []
);
useEffect(() => {
  fetchServices(1, 100, searchTerm, categoryId);
}, [fetchServices, searchTerm, categoryId, minPrice, maxPrice]);

  const handleCategoryChange = (value) => {
    setCategoryId(value);
    fetchServices(searchTerm, value, minPrice, maxPrice);
  };

  const handleDeleteService = async (id) => {
    try {
      const response = await deleteService(id);
      if (response) {
        message.success("Dịch vụ đã được xóa thành công.");
        fetchServices();
      } else {
        message.error("Không thể xóa dịch vụ.");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa dịch vụ.");
    }
  };

  const handleEditClick = (record) => {
    setEditServiceData(record);
    onEditOpen();
  };

  const handleDetailsClick = (record) => {
    setSelectedService(record);
    onDetailsOpen();
  };

  const columns = [
    {
      title: "TÊN DỊCH VỤ",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "HÌNH ẢNH",
      dataIndex: "images",
      key: "images",
      render: (images) => (
        <img
          src={images && images.length ? images[0] : ""}
          alt="Service"
          style={{ borderRadius: "25%", width: "60px", height: "60px" }}
        />
      ),
    },
    {
      title: "GIÁ CƠ BẢN",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (price) => (
        <span>{price ? `${formatCurrency(price)}` : "Không có"}</span>
      ),
    },
    {
      title: "MÔ TẢ NGẮN",
      dataIndex: "shortDescription",
      key: "shortDescription",
      ellipsis: true,
    },
    {
      title: "ĐỊA CHỈ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "DANH MỤC",
      dataIndex: ["categoryId", "categoryName"],
      key: "category",
    },
    {
  title: "NỔI BẬT",
  dataIndex: "isActive",
  key: "isActive",
  align: "center",
  render: (isActive) => (
    <Switch checked={isActive} disabled />
  ),
},
{
  title: "TRẠNG THÁI",
  dataIndex: "status",
  key: "status",
  align: "center",
  render: (status) => (
    <Switch checked={status} disabled />
  ),
},

    {
      title: "HÀNH ĐỘNG",
      key: "actions",
      align: "center",
      render: (text, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <Button
            type="link"
            icon={<EditOutlined style={{ color: "#2563EB", fontSize: "18px" }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(record);
            }}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa dịch vụ này không?"
            onConfirm={(e) => {
              e.stopPropagation();
              handleDeleteService(record._id);
            }}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              icon={<DeleteOutlined style={{ color: "#FF4D4F", fontSize: "18px" }} />}
              onClick={(e) => e.stopPropagation()}
              title="Xóa"
            />
          </Popconfirm>
          <Button
            type="link"
            icon={<EyeOutlined style={{ color: "#2563EB", fontSize: "18px" }} />}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              transition: "all 0.2s ease",
              color: "#2563EB",
            }}
            className="details-button"
            onClick={(e) => {
              e.stopPropagation();
              handleDetailsClick(record);
            }}
            title="Chi tiết"
          />
        </div>
      ),
    },
  ];

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }} w="100%">
      <style>
        {`
          .details-button:hover {
            background-color: #E6F0FA !important;
          }
        `}
      </style>
      <Card
        direction="column"
        w="100%"
        px="25px"
        overflowX="hidden"
      >
        <Flex justify="space-between" mb="15px" align="center">
        </Flex>

        <Flex justifyContent="space-between" mb="20px" alignItems="center">
          <Input
            placeholder="Tìm kiếm dịch vụ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              debouncedFetchServices(e.target.value, minPrice, maxPrice);
            }}
            style={{ width: "30%", height: "40px" }}
          />

          <Select
            placeholder="Lọc theo danh mục"
            value={categoryId}
            onChange={(value) => {
              handleCategoryChange(value);
            }}
            style={{ width: "20%", height: "40px" }}
          >
            <Select.Option value="">Tất cả Danh mục</Select.Option>
            {categories.map((category) => (
              <Select.Option key={category._id} value={category._id}>
                {category.categoryName}
              </Select.Option>
            ))}
          </Select>

          <Input
            placeholder="Giá từ"
            value={minPrice}
            type="number"
            onChange={(e) => {
              setMinPrice(e.target.value);
              debouncedFetchServices(searchTerm, e.target.value, maxPrice);
            }}
            style={{ width: "15%", height: "40px", marginLeft: "8px" }}
          />

          <Input
            placeholder="Giá đến"
            value={maxPrice}
            type="number"
            onChange={(e) => {
              setMaxPrice(e.target.value);
              debouncedFetchServices(searchTerm, minPrice, e.target.value);
            }}
            style={{ width: "15%", height: "40px", marginLeft: "8px" }}
          />

          <ChakraButton colorScheme="blue" onClick={onCreateOpen}>
            Thêm mới
          </ChakraButton>
        </Flex>

        {loading ? (
          <Flex justifyContent="center" mt="20px">
            <CircularProgress isIndeterminate color="blue.300" />
          </Flex>
        ) : (
          <>
            <Box overflowX="auto" maxWidth="100%">
              <Table
                columns={columns}
                dataSource={services}
                pagination={false}
                rowKey={(record) => record._id}
                style={{ width: "100%", cursor: "pointer" }}
                scroll={{ y: 500 }}
              />
            </Box>
          </>
        )}

        <CreateServiceModal
          isOpen={isCreateOpen}
          onClose={onCreateClose}
          fetchServices={fetchServices}
        />

        <EditServiceModal
          isOpen={isEditOpen}
          onClose={() => {
            onEditClose();
            setEditServiceData(null);
          }}
          serviceData={editServiceData}
          fetchServices={fetchServices}
        />

        <ServiceDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => {
            onDetailsClose();
            setSelectedService(null);
          }}
          service={selectedService}
        />
      </Card>
    </Box>
  );
}