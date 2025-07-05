import { Box, Flex, CircularProgress, Text } from "@chakra-ui/react";
import {
  Table,
  Pagination,
  Button,
  Input,
  message,
  Popconfirm,
  Modal,
  InputNumber,
  Avatar,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import {
  getAllBookings,
  changeStatusBooking,
  completeBooking,
} from "services/bookingService";
import { debounce } from "lodash";
import Card from "components/card/Card";
import { formatCurrency } from "utils/formatCurrency";
import BookingDetailModal from "./components/BookingDetailModal";

// Hàm render trạng thái
const generateStatus = (status) => {
  let color = "";
  let displayText = "";
  switch (status) {
    case "pending":
      color = "#FF9900";
      displayText = "Đang chờ";
      break;
    case "approved":
      color = "#4CAF50";
      displayText = "Đã xác nhận";
      break;
    case "completed":
      color = "#008000";
      displayText = "Hoàn tất";
      break;
    case "rejected":
      color = "#FF0000";
      displayText = "Đã từ chối";
      break;
    case "canceled":
      color = "#D9534F";
      displayText = "Đã hủy";
      break;
    default:
      color = "gray";
      displayText = "Trạng thái khác";
  }

  return (
    <span
      style={{
        color: color,
        padding: "3px 8px",
        border: `1px solid ${color}`,
        borderRadius: "5px",
        backgroundColor: `${color}20`,
        textAlign: "center",
        display: "inline-block",
      }}
    >
      {displayText}
    </span>
  );
};

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [currentDetailBooking, setCurrentDetailBooking] = useState(null);
  const [actualAmountReceived, setActualAmountReceived] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [sorterInfo, setSorterInfo] = useState({}); // state cho sorter

  const limit = 5;

  const fetchBookingsData = useCallback(
    async (search = searchTerm) => {
      try {
        setLoading(true);
        const data = await getAllBookings(currentPage, limit, search);
        setBookings(data.bookings);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error("Không tìm thấy lịch hẹn nào", error);
        setLoading(false);
        setBookings([]);
      }
    },
    [currentPage, limit]
  );

  const debouncedFetchBookings = useCallback(
    debounce((value) => {
      setCurrentPage(1);
      fetchBookingsData(value);
    }, 800),
    [fetchBookingsData]
  );

  useEffect(() => {
    fetchBookingsData(searchTerm);
  }, [fetchBookingsData, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      await changeStatusBooking(bookingId, status, rejectionReason);
      message.success(
        `Đã ${status === "approved" ? "xác nhận" : "từ chối"} lịch hẹn`
      );
      fetchBookingsData();
    } catch (error) {
      message.error("Thay đổi trạng thái lịch hẹn thất bại");
    }
  };

  const handleCompleteBooking = async () => {
    setActionLoading(true);
    const completionTime = new Date();
    try {
      await completeBooking(
        currentBookingId,
        actualAmountReceived,
        completionTime
      );
      message.success("Lịch hẹn đã được hoàn tất");
      fetchBookingsData();
      setIsCompleteModalVisible(false);
      setActualAmountReceived(0);
    } catch (error) {
      message.error("Hoàn tất lịch hẹn thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối.");
      return;
    }
    setActionLoading(true);
    await handleStatusChange(currentBookingId, "rejected");
    setIsRejectModalVisible(false);
    setRejectionReason("");
    setActionLoading(false);
  };

  const showRejectModal = (bookingId) => {
    setCurrentBookingId(bookingId);
    setIsRejectModalVisible(true);
  };

  const showCompleteModal = (bookingId) => {
    setCurrentBookingId(bookingId);
    setIsCompleteModalVisible(true);
  };

  const showDetailModal = (booking) => {
    setCurrentDetailBooking(booking);
    setIsDetailModalVisible(true);
  };

  const columns = [
    {
      title: "KHÁCH HÀNG",
      dataIndex: "customerId",
      key: "customerId",
      sorter: (a, b) =>
        a.customerId?.name.localeCompare(b.customerId?.name),
      sortOrder: sorterInfo.columnKey === "customerId" && sorterInfo.order,
      render: (customer) => customer?.name,
    },
      {
    title: "ĐỊA CHỈ",
    dataIndex: "customerAddress",
    key: "customerAddress",
    render: (address) => address || "Không có",
  },
    {
      title: "DỊCH VỤ",
      dataIndex: "serviceId",
      key: "serviceName",
      sorter: (a, b) =>
        a.serviceId?.serviceName.localeCompare(b.serviceId?.serviceName),
      sortOrder: sorterInfo.columnKey === "serviceName" && sorterInfo.order,
      render: (service) => (
        <Flex align="center">
          <Avatar
            src={service?.images[0] || "URL hình ảnh mặc định"}
            alt={service?.serviceName}
            size={40}
            style={{ marginRight: "8px" }}
          />
          <Text>{service?.serviceName}</Text>
        </Flex>
      ),
    },
    {
      title: "NHÂN VIÊN",
      dataIndex: "preferredStaffId",
      key: "preferredStaffId",
      sorter: (a, b) =>
        (a.preferredStaffId?.name || "").localeCompare(
          b.preferredStaffId?.name || ""
        ),
      sortOrder:
        sorterInfo.columnKey === "preferredStaffId" && sorterInfo.order,
      render: (staff) => staff?.name || "Chưa chỉ định",
    },
    {
      title: "THỜI GIAN ĐẶT LỊCH",
      dataIndex: "bookingTime",
      key: "bookingTime",
      sorter: (a, b) => new Date(a.bookingTime) - new Date(b.bookingTime),
      sortOrder: sorterInfo.columnKey === "bookingTime" && sorterInfo.order,
      render: (text) =>
        new Date(text).toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => generateStatus(status),
    },
    {
      title: "HÀNH ĐỘNG",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Flex align="center" gap="8px" wrap="nowrap" justify="center">
          {record.status === "pending" && (
            <>
              <Popconfirm
                title="Xác nhận lịch hẹn này?"
                onConfirm={() => handleStatusChange(record._id, "approved")}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button
                  size="small"
                  type="primary"
                  style={{
                    backgroundColor: "#2563EB",
                    borderColor: "#2563EB",
                    color: "white",
                  }}
                >
                  Xác nhận
                </Button>
              </Popconfirm>
              <Button
                size="small"
                type="primary"
                danger
                onClick={() => showRejectModal(record._id)}
              >
                Từ chối
              </Button>
            </>
          )}
          {record.status === "approved" && (
            <Button
              size="small"
              type="primary"
              style={{
                backgroundColor: "#2563EB",
                borderColor: "#2563EB",
                color: "white",
              }}
              onClick={() => showCompleteModal(record._id)}
            >
              Hoàn tất
            </Button>
          )}
          <Button
            size="small"
            type="default"
            onClick={() => showDetailModal(record)}
          >
            Xem chi tiết
          </Button>
        </Flex>
      ),
    },
  ];

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }} w="100%">
      <Card direction="column" w="100%" px="25px">
        <Flex justifyContent="space-between" mb="20px">
          <Input
            allowClear
            placeholder="Tìm kiếm theo tên khách hàng hoặc dịch vụ"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              debouncedFetchBookings(e.target.value);
            }}
            style={{ width: "48%", height: "40px" }}
          />
        </Flex>

        {loading ? (
          <Flex justifyContent="center" mt="20px">
            <CircularProgress isIndeterminate color="blue.300" />
          </Flex>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={bookings}
              pagination={false}
              onChange={(pagination, filters, sorter) => {
                setSorterInfo(sorter);
              }}
              rowKey={(record) => record._id}
              style={{ width: "100%", cursor: "pointer" }}
            />
            <Pagination
              current={currentPage}
              total={totalPages * limit}
              pageSize={limit}
              onChange={handlePageChange}
              style={{ marginTop: "20px", textAlign: "center" }}
            />
          </>
        )}
      </Card>

      {/* Modal từ chối */}
      <Modal
        title="Lý do từ chối lịch hẹn"
        open={isRejectModalVisible}
        onOk={handleReject}
        onCancel={() => setIsRejectModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={actionLoading}
      >
        <Input.TextArea
          rows={4}
          placeholder="Nhập lý do từ chối"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />
      </Modal>

      {/* Modal hoàn tất */}
      <Modal
        title="Hoàn tất lịch hẹn"
        open={isCompleteModalVisible}
        onCancel={() => setIsCompleteModalVisible(false)}
        onOk={handleCompleteBooking}
        okText="Hoàn tất"
        cancelText="Hủy"
        confirmLoading={actionLoading}
      >
        <Text>Số tiền thực tế nhận:</Text>
        <InputNumber
          min={0}
          value={actualAmountReceived}
          onChange={(value) => setActualAmountReceived(value)}
          style={{ width: "100%", marginTop: "10px" }}
        />
      </Modal>

      {/* Modal chi tiết */}
      <BookingDetailModal
        visible={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
        booking={currentDetailBooking}
        fetchBookingsData={fetchBookingsData}
      />
    </Box>
  );
}