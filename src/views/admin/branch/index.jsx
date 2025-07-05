import {
  Box,
  Flex,
  CircularProgress,
  useDisclosure,
  Button as ChakraButton,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import { Table, Button, Popconfirm, Input } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { getAllBranches, deleteBranch } from "services/branchService";
import { debounce } from "lodash";
import { message } from "antd";
import Card from "components/card/Card";
import EditBranchModal from "./components/EditBranchModal";
import CreateBranchModal from "./components/CreateBranchModal";
import ViewBranchModal from "./components/ViewBranchModal"; // Thêm import
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"; // Thêm EyeOutlined
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";

export default function BranchPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editBranchData, setEditBranchData] = useState(null);
  const [viewBranchData, setViewBranchData] = useState(null); // State cho modal xem chi tiết
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
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure(); // Hook cho modal xem chi tiết

  const fetchBranches = useCallback(
    async (search = searchTerm) => {
      setLoading(true);
      try {
        const data = await getAllBranches();
        const filteredBranches = data.filter((branch) =>
          branch.title.toLowerCase().includes(search.toLowerCase())
        );
        setBranches(filteredBranches);
      } catch (error) {
        message.error("Không thể tải danh sách chi nhánh.");
        setBranches([]);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm]
  );

  const debouncedFetchBranches = useCallback(
    debounce((value) => {
      fetchBranches(value);
    }, 800),
    [fetchBranches]
  );

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const confirmDeleteBranch = async (id) => {
    try {
      await deleteBranch(id);
      message.success("Đã xóa chi nhánh.");
      fetchBranches();
    } catch (error) {
      message.error("Lỗi xóa chi nhánh.");
    }
  };

  const handleEditClick = (record) => {
    setEditBranchData(record);
    onEditOpen();
  };

  const handleViewClick = (record) => {
    setViewBranchData(record);
    onViewOpen();
  };

  const columns = [
    {
      title: "TIÊU ĐỀ CHI NHÁNH",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "HÌNH ẢNH",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (text) => (
        <img
          src={text || "https://via.placeholder.com/150"}
          alt="Branch"
          width={80}
          height={60}
          style={{ borderRadius: "12px", objectFit: "cover" }}
        />
      ),
    },
    {
      title: "ĐỊA CHỈ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "SỐ ĐIỆN THOẠI",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "QUẢN LÝ",
      dataIndex: "managerName",
      key: "managerName",
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) =>
        status === "active" ? (
          <CheckCircleTwoTone twoToneColor="#16A34A" style={{ fontSize: "20px" }} />
        ) : (
          <CloseCircleTwoTone twoToneColor="#DC2626" style={{ fontSize: "20px" }} />
        ),
    },
    {
      title: "THAO TÁC",
      key: "actions",
      align: "center",
      render: (text, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <Button
            type="link"
            icon={<EyeOutlined style={{ color: "#1890FF", fontSize: "18px" }} />}
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
            title="Bạn chắc chắn xóa chi nhánh này?"
            onConfirm={(e) => {
              e.stopPropagation();
              confirmDeleteBranch(record._id);
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
        <Flex justify="space-between" mb="20px">
          <Input
            placeholder="Tìm chi nhánh..."
            allowClear
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              debouncedFetchBranches(e.target.value);
            }}
            style={{ width: "70%", borderColor: "#93C5FD" }}
          />
          <ChakraButton colorScheme="blue" onClick={onCreateOpen}>
            Thêm mới
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
                dataSource={branches}
                pagination={false}
                rowKey={(record) => record._id}
                style={{ width: "100%", cursor: "pointer" }}
                scroll={{ y: 400 }}
              />
            </Box>
            <CreateBranchModal
              isOpen={isCreateOpen}
              onClose={onCreateClose}
              onSuccess={fetchBranches}
            />
            {editBranchData && (
              <EditBranchModal
                isOpen={isEditOpen}
                onClose={onEditClose}
                branch={editBranchData}
                fetchBranches={fetchBranches}
              />
            )}
            {viewBranchData && (
              <ViewBranchModal
                isOpen={isViewOpen}
                onClose={onViewClose}
                branch={viewBranchData}
              />
            )}
          </>
        )}
      </Card>
    </Box>
  );
}