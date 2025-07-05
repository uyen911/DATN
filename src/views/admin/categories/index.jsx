// React & hooks
import React, { useEffect, useState, useCallback } from "react";

// Chakra UI
import {
  Box,
  Flex,
  CircularProgress,
  useDisclosure,
  Button as ChakraButton,
  useColorModeValue,
} from "@chakra-ui/react";

// Ant Design
import { Table, Button, Popconfirm, Input, message, Modal, Descriptions } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UpOutlined,
  DownOutlined,
  EyeOutlined,
} from "@ant-design/icons";

// Lodash
import { debounce } from "lodash";

// Services
import { getAllCategories, deleteCategory } from "services/categoryService";

// Components
import Card from "components/card/Card";
import EditCategoryModal from "./components/EditCategoryModal";
import CreateCategoryModal from "./components/CreateCategoryModal";

export default function Settings() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editCategoryData, setEditCategoryData] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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

const fetchCategories = useCallback(
  async (search = searchTerm, sort = sortField, order = sortOrder) => {
    setLoading(true);
    try {
      const data = await getAllCategories(1, 100, search, true); 
      let allCategories = data.categories || [];

      if (data.totalPages && data.totalPages > 1) {
        allCategories = [];
        for (let page = 1; page <= data.totalPages; page++) {
          const pageData = await getAllCategories(page, 100, search, true); 
          allCategories = allCategories.concat(pageData.categories || []);
        }
      }

      if (sort && order && allCategories) {
        allCategories = [...allCategories].sort((a, b) => {
          const valueA = a[sort]?.toString().toLowerCase() || "";
          const valueB = b[sort]?.toString().toLowerCase() || "";
          return order === "ascend"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        });
      }

      setCategories(allCategories);
    } catch (error) {
      message.error("Error fetching categories.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  },
  [sortField, sortOrder, searchTerm]
);

  const debouncedFetchCategories = useCallback(
    debounce((value) => {
      fetchCategories(value);
    }, 800),
    [fetchCategories]
  );

  useEffect(() => {
    fetchCategories(searchTerm, sortField, sortOrder);
  }, [fetchCategories, sortField, sortOrder]);

  const confirmDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      message.success("Category deleted.");
      fetchCategories();
    } catch (error) {
      message.error("Error deleting category.");
    }
  };

  const handleEditClick = (record) => {
    setEditCategoryData(record);
    onEditOpen();
  };

  const handleViewClick = (record) => {
    setSelectedCategory(record);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSort = (field) => {
    let order = "ascend";
    if (sortField === field && sortOrder === "ascend") {
      order = "descend";
    } else if (sortField === field && sortOrder === "descend") {
      setSortField(null);
      setSortOrder(null);
      return;
    }
    setSortField(field);
    setSortOrder(order);
  };

  const columns = [
    {
      title: "TÊN DANH MỤC",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "HÌNH ẢNH",
      dataIndex: "images",
      key: "images",
      render: (text) => (
        <img
          src={text}
          alt="Category"
          width={70}
          height={80}
          style={{ borderRadius: "25%" }}
        />
      ),
    },
    {
  title: "TRẠNG THÁI HIỂN THỊ",
  dataIndex: "isActive",
  key: "isActive",
  render: (status) => (
    <span style={{ color: status ? "#16A34A" : "#DC2626", fontWeight: "bold" }}>
      {status ? "Nổi bật" : "Ẩn nổi bật"}
    </span>
  ),
},
{
  title: "TRẠNG THÁI SỬ DỤNG",
  dataIndex: "status",
  key: "status",
  render: (status) => (
    <span style={{ color: status === "active" ? "#16A34A" : "#DC2626", fontWeight: "bold" }}>
      {status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
    </span>
  ),
},

   
    {
      title: "THAO TÁC",
      key: "actions",
      align: "center",
      render: (text, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            type="link"
            icon={<EyeOutlined style={{ color: "#4B5563", fontSize: "18px" }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewClick(record);
            }}
            title="Xem chi tiết"
          />
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
            title="Bạn có chắc muốn xóa danh mục này không?"
            onConfirm={(e) => {
              e.stopPropagation();
              confirmDeleteCategory(record._id);
            }}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="link"
              icon={<DeleteOutlined style={{ color: "#FF4D4F", fontSize: "18px" }} />}
              onClick={(e) => e.stopPropagation()}
              title="Xóa"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }} w="100%">
      <Card direction="column" w="100%" px="25px" overflowX={{ sm: "scroll", lg: "hidden" }}>
        <Flex justifyContent="space-between" mb="20px">
          <Input
            placeholder="Tìm kiếm danh mục..."
            allowClear
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              debouncedFetchCategories(e.target.value);
            }}
            style={{ width: "70%", borderColor: "#93C5FD" }}
          />
          <ChakraButton
            colorScheme="blue"
            onClick={() => handleSort("categoryName")}
            ml={2}
            leftIcon={
              sortField === "categoryName" ? (
                sortOrder === "ascend" ? (
                  <UpOutlined />
                ) : sortOrder === "descend" ? (
                  <DownOutlined />
                ) : null
              ) : null
            }
          >
            Sắp Xếp Tên
          </ChakraButton>
          <ChakraButton colorScheme="blue" onClick={onCreateOpen}>
            Thêm Mới
          </ChakraButton>
        </Flex>

        {loading ? (
          <Flex justifyContent="center" mt="20px">
            <CircularProgress isIndeterminate color="#2563EB" />
          </Flex>
        ) : (
          <>
            <Box overflowX="auto" maxWidth="100%">
              <Table
                columns={columns}
                dataSource={categories}
                pagination={false}
                rowKey={(record) => record._id}
                style={{ width: "100%", cursor: "pointer" }}
                scroll={{ y: 400 }}
              />
            </Box>
            <CreateCategoryModal
              isOpen={isCreateOpen}
              onClose={onCreateClose}
              fetchCategories={fetchCategories}
            />
            {editCategoryData && (
              <EditCategoryModal
                isOpen={isEditOpen}
                onClose={onEditClose}
                category={editCategoryData}
                fetchCategories={fetchCategories}
              />
            )}

          <Modal
  title="Chi tiết danh mục"
  open={isViewModalOpen}
  onCancel={handleCloseViewModal}
  footer={null}
  centered
>
  {selectedCategory && (
    <Descriptions bordered column={1}>
      <Descriptions.Item label="Tên danh mục">
        {selectedCategory.categoryName}
      </Descriptions.Item>
      <Descriptions.Item label="Mô tả">
        {selectedCategory.description || "Không có mô tả"}
      </Descriptions.Item>
      <Descriptions.Item label="Hình ảnh">
        <img
          src={selectedCategory.images}
          alt="Category"
          width={100}
          height={100}
          style={{ borderRadius: "15px" }}
        />
      </Descriptions.Item>
      <Descriptions.Item label="Trạng thái">
        <span
          style={{
            color: selectedCategory.isDelete ? "#DC2626" : "#16A34A",
            fontWeight: "bold",
          }}
        >
          {selectedCategory.isDelete ? "Đã Xóa" : "Hoạt Động"}
        </span>
      </Descriptions.Item>
    
    </Descriptions>
  )}
</Modal>

          </>
        )}
      </Card>
    </Box>
  );
}
