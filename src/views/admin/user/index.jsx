import {
  Box,
  Flex,
  CircularProgress,
  useDisclosure,
  Button as ChakraButton,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Image,
  VStack,
  Divider,
} from "@chakra-ui/react";
import {
  Table,
  Button,
  Popconfirm,
  Input,
  message,
  Tag,
  Select,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { getAllUsers, lockUser } from "services/userService";
import { debounce } from "lodash";
import Card from "components/card/Card";
import EditUserModal from "./components/EditUserModal";
import CreateUserModal from "./components/CreateUserModal";
import { EditOutlined, LockOutlined, UnlockOutlined, SortAscendingOutlined, SortDescendingOutlined, EyeOutlined } from "@ant-design/icons";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUserData, setEditUserData] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);
  const textColor = useColorModeValue("#1E40AF", "white");
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("#93C5FD", "gray.600");

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
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();

  const fetchUsers = useCallback(
    async (search = searchTerm, sort = sortField, order = sortOrder, role = roleFilter) => {
      setLoading(true);
      try {
        const data = await getAllUsers(null, null, search, sort, order, role);
        let allUsers = data.users || [];

        if (data.totalPages && data.totalPages > 1) {
          allUsers = [];
          for (let page = 1; page <= data.totalPages; page++) {
            const pageData = await getAllUsers(page, 100, search, sort, order, role);
            allUsers = allUsers.concat(pageData.users || []);
          }
        }

        if (sort && order && allUsers) {
          allUsers = [...allUsers].sort((a, b) => {
            const valueA = a[sort]?.toString().toLowerCase() || "";
            const valueB = b[sort]?.toString().toLowerCase() || "";
            if (order === "ascend") {
              return valueA.localeCompare(valueB);
            } else {
              return valueB.localeCompare(valueA);
            }
          });
        }

        setUsers(allUsers);
      } catch (error) {
        message.error("Error fetching users.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, sortField, sortOrder, roleFilter]
  );

  const debouncedFetchUsers = useCallback(
    debounce((search, role) => {
      fetchUsers(search, sortField, sortOrder, role);
    }, 800),
    [fetchUsers]
  );

  useEffect(() => {
    fetchUsers(searchTerm, sortField, sortOrder, roleFilter);
  }, [fetchUsers, sortField, sortOrder, roleFilter]);

  const handleSort = () => {
    let order = "ascend";
    if (sortField === "name" && sortOrder === "ascend") {
      order = "descend";
    } else if (sortField === "name" && sortOrder === "descend") {
      setSortField(null);
      setSortOrder(null);
    } else {
      setSortField("name");
      setSortOrder("ascend");
    }
    setSortField("name");
    setSortOrder(order);
  };

  const handleEditClick = (record) => {
    setEditUserData(record);
    onEditOpen();
  };

  const handleViewDetails = (record) => {
    setSelectedUser(record);
    onDetailOpen();
  };

  const confirmLockUser = async (userId) => {
    try {
      await lockUser(userId);
      message.success("Thành công");
      fetchUsers();
    } catch (error) {
      message.error("Error locking user.");
    }
  };

  const renderRoleTag = (role) => {
    let color = "";
    let label = "";

    switch (role) {
      case "admin":
        color = "blue";
        label = "Admin";
        break;
      case "staff":
        color = "green";
        label = "Staff";
        break;
      case "customer":
        color = "orange";
        label = "Customer";
        break;
      case "manager":
        color = "purple";
        label = "Manager";
        break;
      default:
        color = "gray";
        label = "Unknown";
    }

    return <Tag color={color}>{label}</Tag>;
  };

  const columns = [
    {
      title: "NGƯỜI DÙNG",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "EMAIL",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "SỐ ĐIỆN THOẠI ",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "ĐỊA CHỈ ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "TUỔI TÁC",
      dataIndex: "age",
      key: "age",
      render: (age) => <span>{age || "Chưa cập nhật"}</span>,
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      key: "role",
      render: (role) => renderRoleTag(role),
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Staff", value: "staff" },
        { text: "Customer", value: "customer" },
        { text: "Manager", value: "manager" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "TRẠNG THÁI ",
      dataIndex: "active",
      key: "active",
      render: (active) => (
        <span style={{ color: active ? "green" : "red", fontWeight: "bold" }}>
          {active ? "Hoạt Động" : "Đã Khóa"}
        </span>
      ),
    },
    {
      title: "CHIẾC KHẤU (%)",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      render: (discountPercentage) => (
        <span>
          {discountPercentage ? `${discountPercentage}%` : "Chưa cập nhật"}
        </span>
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
            icon={<EyeOutlined style={{ color: "#2563EB", fontSize: "18px" }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(record);
            }}
            title="Xem Chi Tiết"
            style={{ transition: "color 0.2s" }}
            className="hover:text-blue-600"
          />
          <Button
            type="link"
            icon={<EditOutlined style={{ color: "#2563EB", fontSize: "18px" }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(record);
            }}
            title="Chỉnh sửa"
            style={{ transition: "color 0.2s" }}
            className="hover:text-blue-600"
          />
          <Popconfirm
            title={
              record.active
                ? "Bạn có chắc muốn khóa người dùng này không?"
                : "Bạn có chắc muốn mở tài khoản người dùng này không?"
            }
            onConfirm={(e) => {
              e.stopPropagation();
              confirmLockUser(record._id);
            }}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="link"
              icon={
                record.active ? (
                  <LockOutlined style={{ color: "#EF4444", fontSize: "18px" }} />
                ) : (
                  <UnlockOutlined style={{ color: "#10B981", fontSize: "18px" }} />
                )
              }
              style={{ transition: "color 0.2s" }}
              onClick={(e) => e.stopPropagation()}
              title={record.active ? "Khóa Tài Khoản" : "Mở Tài Khoản"}
              className={record.active ? "hover:text-red-600" : "hover:text-green-600"}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }} w="100%" bg={bgColor}>
      <style>
        {`
          .custom-role-filter .ant-select-selector {
            border-color: #93C5FD !important;
            border-radius: 8px !important;
            padding: 8px 12px !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
            background-color: ${bgColor} !important;
          }
          .custom-role-filter .ant-select-selector:hover {
            border-color: #2563EB !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
            transform: translateY(-2px) !important;
          }
          .custom-role-filter .ant-select-selector:focus {
            border-color: #1E40AF !important;
            box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.2) !important;
          }
          .custom-role-filter .ant-select-clear {
            background: ${bgColor} !important;
            color: #EF4444 !important;
          }
          .custom-role-filter .ant-select-clear:hover {
            color: #B91C1C !important;
          }
          .custom-role-filter .ant-select-arrow {
            color: ${textColor} !important;
          }
        `}
      </style>
      <Card
        direction="column"
        w="100%"
        px="30px"
        py="20px"
        overflowX="hidden"
        boxShadow="lg"
        borderRadius="lg"
      >
        <Flex justify="space-between" mb="20px" align="center">
          <Text
            color={textColor}
            fontSize="2xl"
            fontWeight="bold"
            lineHeight="100%"
          >
            Quản Lý Người Dùng
          </Text>
        </Flex>
        <Flex justifyContent="space-between" mb="25px" align="center">
          <Flex align="center" style={{ width: "85%", gap: "15px" }}>
            <Input
              placeholder="Tìm kiếm người dùng..."
              allowClear
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                debouncedFetchUsers(e.target.value, roleFilter);
              }}
              style={{
                width: "50%",
                borderColor: "#93C5FD",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
            />
            <Button
              type="primary"
              icon={
                sortOrder === "ascend" ? (
                  <SortAscendingOutlined />
                ) : sortOrder === "descend" ? (
                  <SortDescendingOutlined />
                ) : (
                  <SortAscendingOutlined />
                )
              }
              onClick={handleSort}
              style={{
                borderRadius: "8px",
                padding: "8px 16px",
                transition: "background-color 0.2s",
              }}
              className="hover:bg-blue-600"
            >
              Sắp Xếp Tên {sortOrder === "ascend" ? "↑" : sortOrder === "descend" ? "↓" : ""}
            </Button>
            {/* <Select
              placeholder="Lọc theo vai trò"
              value={roleFilter}
              onChange={(value) => {
                setRoleFilter(value);
                debouncedFetchUsers(searchTerm, value);
              }}
              allowClear
              className="custom-role-filter"
              style={{
                width: "30%",
              }}
            >
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="staff">Staff</Select.Option>
              <Select.Option value="customer">Customer</Select.Option>
              <Select.Option value="manager">Manager</Select.Option>
            </Select> */}
          </Flex>
          <ChakraButton
            colorScheme="blue"
            onClick={onCreateOpen}
            borderRadius="8px"
            px="20px"
            py="8px"
            fontWeight="semibold"
            _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
            transition="all 0.2s"
          >
            Thêm Mới
          </ChakraButton>
        </Flex>

        {loading ? (
          <Flex justifyContent="center" mt="40px">
            <CircularProgress isIndeterminate color="blue.300" size="60px" />
          </Flex>
        ) : (
          <>
            <Box overflowX="auto" maxWidth="100%" minWidth="100%" borderRadius="lg">
              <Table
                columns={columns}
                dataSource={users}
                pagination={false}
                rowKey={(record) => record._id}
                style={{
                  width: "100%",
                  cursor: "pointer",
                  background: bgColor,
                  borderRadius: "8px",
                }}
                scroll={{ y: 400 }}
                rowClassName="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              />
            </Box>
            <CreateUserModal
              isOpen={isCreateOpen}
              onClose={onCreateClose}
              fetchUsers={fetchUsers}
            />
            {editUserData && (
              <EditUserModal
                isOpen={isEditOpen}
                onClose={onEditClose}
                user={editUserData}
                fetchUsers={fetchUsers}
              />
            )}
            {selectedUser && (
              <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg">
                <ModalOverlay />
                <ModalContent
                  borderRadius="lg"
                  boxShadow="xl"
                  p="20px"
                  border="2px solid"
                  borderColor={borderColor}
                >
                  <ModalHeader fontSize="xl" fontWeight="bold" color={textColor}>
                    Chi Tiết Người Dùng
                  </ModalHeader>
                  <ModalBody>
                    <VStack align="start" spacing="15px">
                      <Image
                        src={`https://picsum.photos/seed/${selectedUser._id}/200/200`}
                        alt="User Avatar"
                        borderRadius="full"
                        boxSize="120px"
                        objectFit="cover"
                        mb="10px"
                        alignSelf="center"
                        boxShadow="md"
                        border="3px solid"
                        borderColor={borderColor}
                        _hover={{ transform: "scale(1.05)" }}
                        transition="transform 0.2s"
                      />
                      <Divider borderColor={borderColor} borderWidth="2px" />
                      <Box
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        p="10px"
                        w="100%"
                      >
                        <Text fontSize="md"><strong>Tên:</strong> {selectedUser.name}</Text>
                      </Box>
                      <Box
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        p="10px"
                        w="100%"
                      >
                        <Text fontSize="md"><strong>Email:</strong> {selectedUser.email}</Text>
                      </Box>
                      <Box
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        p="10px"
                        w="100%"
                      >
                        <Text fontSize="md"><strong>Số Điện Thoại:</strong> {selectedUser.phone || "Chưa cập nhật"}</Text>
                      </Box>
                      <Box
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        p="10px"
                        w="100%"
                      >
                        <Text fontSize="md"><strong>Địa Chỉ:</strong> {selectedUser.address || "Chưa cập nhật"}</Text>
                      </Box>
                      <Box
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        p="10px"
                        w="100%"
                      >
                        <Text fontSize="md"><strong>Tuổi:</strong> {selectedUser.age || "Chưa cập nhật"}</Text>
                      </Box>
                      <Box
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        p="10px"
                        w="100%"
                      >
                        <Text fontSize="md"><strong>Vai Trò:</strong> {renderRoleTag(selectedUser.role)}</Text>
                      </Box>
                      <Box
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        p="10px"
                        w="100%"
                      >
                        <Text fontSize="md"><strong>Trạng Thái:</strong> <span style={{ color: selectedUser.active ? "green" : "red", fontWeight: "bold" }}>{selectedUser.active ? "Hoạt Động" : "Đã Khóa"}</span></Text>
                      </Box>
                      <Box
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        p="10px"
                        w="100%"
                      >
                        <Text fontSize="md"><strong>Chiết Khấu:</strong> {selectedUser.discountPercentage ? `${selectedUser.discountPercentage}%` : "Chưa cập nhật"}</Text>
                      </Box>
                    </VStack>
                  </ModalBody>
                  <ModalFooter>
                    <ChakraButton
                      colorScheme="blue"
                      onClick={onDetailClose}
                      borderRadius="8px"
                      px="20px"
                      py="8px"
                      fontWeight="semibold"
                      border="2px solid"
                      borderColor={borderColor}
                      _hover={{ transform: "translateY(-2px)", boxShadow: "md", borderColor: "blue.600" }}
                      transition="all 0.2s"
                    >
                      Đóng
                    </ChakraButton>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            )}
          </>
        )}
      </Card>
    </Box>
  );
}