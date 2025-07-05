import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Flex,
  CircularProgress,
  Button as ChakraButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Table, Button, Popconfirm, Input, message } from "antd";
import { getAllBranchStaff, deleteBranchStaff } from "services/branchStaffService";
import { getAllBranches } from "services/branchService";
import { getAllUser } from "services/userService";
import { debounce } from "lodash";
import Card from "components/card/Card";
import CreateBranchStaffModal from "./components/CreateBranchStaffModal";
import { DeleteOutlined } from "@ant-design/icons";

export default function BranchStaffPage() {
  const [staffBranches, setStaffBranches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchData = useCallback(async (search = searchTerm) => {
    setLoading(true);
    try {
      const [staffBranchData, branchData, staffData] = await Promise.all([
        getAllBranchStaff(),
        getAllBranches(),
        getAllUser(),
      ]);

      const filteredData = staffBranchData.filter((item) => {
        const staff = staffData.find((s) => s._id === item.staffId);
        const branch = branchData.find((b) => b._id === item.branchId);
        return (
          (staff?.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (branch?.title?.toLowerCase() || "").includes(search.toLowerCase())
        );
      });

      setStaffBranches(filteredData);
      setBranches(branchData);
      setStaffs(staffData);
    } catch (error) {
      message.error("Không thể tải danh sách phân công.");
      console.error(error);
      setStaffBranches([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const debouncedFetchData = useCallback(
    debounce((value) => {
      fetchData(value);
    }, 800),
    [fetchData]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    try {
      await deleteBranchStaff(id);
      message.success("Xóa thành công");
      fetchData();
    } catch (error) {
      message.error("Xóa thất bại");
      console.error(error);
    }
  };

  const columns = [
  {
  title: "TÊN NHÂN VIÊN",
  dataIndex: "staffId",
  key: "staffId",
  render: (staff) => staff?.name || "Chưa có",
},
{
  title: "CHI NHÁNH",
  dataIndex: "branchId",
  key: "branchId",
  render: (branch) => branch?.title || "Chưa có",
},

    {
      title: "THAO TÁC",
      key: "actions",
      align: "center",
      render: (text, record) => (
        <Popconfirm
          title="Bạn chắc chắn muốn xóa?"
          onConfirm={(e) => {
            e.stopPropagation();
            handleDelete(record._id);
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
      ),
    },
  ];

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }} w="100%">
      <Card direction="column" w="100%" px="25px" overflowX={{ sm: "scroll", lg: "hidden" }}>
        <Flex justify="space-between" mb="20px">
          <Input
            placeholder="Tìm nhân viên hoặc chi nhánh..."
            allowClear
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              debouncedFetchData(e.target.value);
            }}
            style={{ width: "70%", borderColor: "#93C5FD" }}
          />
          <ChakraButton colorScheme="blue" onClick={onOpen}>
            Thêm mới
          </ChakraButton>
        </Flex>

        {loading ? (
          <Flex justifyContent="center" mt="20px">
            <CircularProgress isIndeterminate color="#2563EB" />
          </Flex>
        ) : (
          <Box overflowX="auto" maxWidth="100%">
            <Table
              dataSource={staffBranches}
              columns={columns}
              rowKey="_id"
              pagination={{ pageSize: 8 }}
              scroll={{ y: 400 }}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </Box>
        )}

        <CreateBranchStaffModal
          visible={isOpen}
          onCancel={onClose}
          onCreateSuccess={() => {
            fetchData();
            onClose();
          }}
        />
      </Card>
    </Box>
  );
}
