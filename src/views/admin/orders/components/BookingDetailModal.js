import React, { useEffect, useState } from "react";
import { Modal, Descriptions, Select, message, Button } from "antd";
import { formatCurrency } from "utils/formatCurrency";
import { getAllStaff } from "services/userService";
import { changeBookingStaff } from "services/bookingService";
import { PrinterOutlined } from "@ant-design/icons";
import logo from "../../../../assets/img/logo.png"; // Giữ import để tránh lỗi build, nhưng không sử dụng trực tiếp

const getCurrentUserRole = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.user?.role || null;
  } catch (error) {
    console.error("Failed to fetch user role:", error);
    return null;
  }
};

const { Option } = Select;

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

const BookingDetailModal = ({
  booking,
  visible,
  onClose,
  fetchBookingsData,
}) => {
  const [staffOptions, setStaffOptions] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const getStaffId = (preferredStaffId) => {
    if (!preferredStaffId) return "none";
    return typeof preferredStaffId === "object"
      ? preferredStaffId._id
      : preferredStaffId;
  };

  const [currentStaffId, setCurrentStaffId] = useState(
    getStaffId(booking?.preferredStaffId)
  );

  useEffect(() => {
    if (visible) {
      const fetchUserRole = async () => {
        const role = await getCurrentUserRole();
        setUserRole(role);
      };
      fetchUserRole();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      const fetchStaff = async () => {
        try {
          const staffList = await getAllStaff();
          setStaffOptions(staffList);
          setCurrentStaffId(getStaffId(booking?.preferredStaffId));
        } catch (error) {
          message.error("Không thể tải danh sách nhân viên.");
        }
      };
      fetchStaff();
    }
  }, [visible, booking]);

  if (!booking) return null;

  const isStaffChangeAllowed =
    booking.status === "pending" || booking.status === "approved";

  const handleStaffSelect = (staffId) => {
    setSelectedStaff(staffId === "none" ? null : staffId);
    setIsConfirmVisible(true);
  };

  const handleConfirmChange = async () => {
    try {
      await changeBookingStaff(booking._id, {
        preferredStaffId: selectedStaff,
      });
      message.success("Nhân viên đã được thay đổi thành công.");
      setCurrentStaffId(selectedStaff || "none");
      setIsConfirmVisible(false);
      fetchBookingsData();
    } catch (error) {
      message.error("Lỗi khi thay đổi nhân viên.");
      console.error(error);
    }
  };

  const canChangeStaff = isStaffChangeAllowed && userRole === "admin";

  const getStaffName = (staffId) => {
    if (staffId === "none" || !staffId) return "Chưa chỉ định";
    const staff = staffOptions.find((s) => s._id === staffId);
    return staff?.name || "Không tìm thấy";
  };

  // Hàm in hóa đơn
  const handlePrint = () => {
    if (!booking) {
      return message.warning("Không có thông tin để in hóa đơn.");
    }

    const totalAmount = booking.actualAmountReceived || booking.totalCost || 0;
    const qrCodeUrl = `https://img.vietqr.io/image/ICB-106880284828-compact.png?amount=${totalAmount}&addInfo=Thanh toan hoa don ${booking._id}`;
    const staffName = booking.preferredStaffId?.name || "Chưa chỉ định";
    // const logoUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."; // Thay bằng base64 của logo.png
    // <img src="${logoUrl}" alt="Uvenla Home Logo" style="width: 150px; height: auto; margin-bottom: 10px;" />
    const invoiceContent = `
      <div style="font-family: Arial, sans-serif; width: 100%; max-width: 700px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 30px;">
        
          <h1 style="font-size: 60px; font-weight: bold; font-family: 'Comic Sans MS', 'Segoe UI', cursive, sans-serif; background: linear-gradient(to right, #00C9FF, #92FE9D); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px;">
            Uvenla Home
          </h1>
          <p style="margin: 4px 0; font-size: 20px; font-style: italic; color: #666;">Chất lượng tạo niềm tin</p>
        </div>

        <h3 style="text-align: center; margin-bottom: 20px;">HÓA ĐƠN DỊCH VỤ</h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Mã đơn:</td>
            <td style="padding: 8px;">${booking._id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Khách hàng:</td>
            <td style="padding: 8px;">${
              booking.customerId?.name || "Không có"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Dịch vụ:</td>
            <td style="padding: 8px;">${
              booking.serviceId?.serviceName || "Không có"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Nhân viên:</td>
            <td style="padding: 8px;">${staffName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Địa chỉ:</td>
            <td style="padding: 8px;">${
              booking.customerAddress || "Không có"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Thời gian đặt:</td>
            <td style="padding: 8px;">${new Date(
              booking.bookingTime
            ).toLocaleString("vi-VN")}</td>
          </tr>
        </table>

        <h3 style="text-align: center;">Thông tin thanh toán</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Chi phí dự kiến:</td>
            <td style="padding: 8px; text-align: right;">${formatCurrency(
              booking.totalCost
            )}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Số tiền thực tế nhận:</td>
            <td style="padding: 8px; text-align: right;">${
              booking.actualAmountReceived
                ? formatCurrency(booking.actualAmountReceived)
                : "Chưa cập nhật"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Trạng thái:</td>
            <td style="padding: 8px; text-align: right;">${booking.status}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 30px;">
          <h4>Quét mã QR để thanh toán</h4>
          <img src="${qrCodeUrl}" alt="QR Code thanh toán" style="width: 250px; height: auto; margin-top: 10px;" />
        </div>

        <p style="margin-top: 30px; text-align: center; font-size: 14px; font-style: italic;">Cảm ơn Quý khách đã sử dụng dịch vụ của Uvenla Home!</p>
      </div>
    `;

    const printWindow = window.open("", "_blank", "width=700,height=900");
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Modal
      title="Chi tiết lịch hẹn"
      open={visible}
      onCancel={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              style={{ marginRight: 8 }}
            >
              In hóa đơn
            </Button>
          </div>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      }
      centered
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Khách hàng">
          {booking.customerId?.name || "Không có"}
        </Descriptions.Item>
        <Descriptions.Item label="Dịch vụ">
          {booking.serviceId?.serviceName || "Không có"}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ dịch vụ">
          {booking.customerAddress || "Không có"}
        </Descriptions.Item>
        <Descriptions.Item label="Nhân viên">
          <Select
            value={currentStaffId}
            style={{ width: "100%" }}
            onChange={handleStaffSelect}
            disabled={!canChangeStaff}
          >
            <Option value="none">Chưa chỉ định</Option>
            {staffOptions.map((staff) => (
              <Option key={staff._id} value={staff._id}>
                {staff.name}
              </Option>
            ))}
          </Select>
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian">
          {new Date(booking.bookingTime).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </Descriptions.Item>
        <Descriptions.Item label="Chi phí dự kiến">
          {formatCurrency(booking.totalCost)}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {generateStatus(booking.status)}
        </Descriptions.Item>
        <Descriptions.Item label="Số tiền thực tế nhận">
          {booking.actualAmountReceived
            ? formatCurrency(booking.actualAmountReceived)
            : "Chưa cập nhật"}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian hoàn thành">
          {booking.completionTime
            ? new Date(booking.completionTime).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "Chưa hoàn thành"}
        </Descriptions.Item>
        <Descriptions.Item label="Lý do từ chối">
          {booking.rejectionReason || "Không có"}
        </Descriptions.Item>
      </Descriptions>

      {/* Modal Xác Nhận */}
      <Modal
        title="Xác nhận thay đổi nhân viên"
        open={isConfirmVisible}
        onOk={handleConfirmChange}
        onCancel={() => setIsConfirmVisible(false)}
      >
        <p>Bạn có chắc chắn muốn thay đổi nhân viên cho lịch hẹn này không?</p>
      </Modal>
    </Modal>
  );
};

export default BookingDetailModal;
