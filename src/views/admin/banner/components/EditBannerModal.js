import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Image,
  Text,
  Select,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { Input, message } from "antd";
import { updateBanner } from "services/bannerService";

export default function EditBannerModal({ isOpen, onClose, banner, fetchBanners }) {
  const [formData, setFormData] = useState({
    title: "",
    image: null,
    imagePreview: null,
    startDate: "",
    endDate: "",
    priority: 0,
    status: "inactive",
  });

  const [errors, setErrors] = useState({
    title: "",
    startDate: "",
    endDate: "",
    priority: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x150";

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        image: null,
        imagePreview: banner.imageUrl || null,
        startDate: banner.startDate ? banner.startDate.slice(0, 10) : "",
        endDate: banner.endDate ? banner.endDate.slice(0, 10) : "",
        priority: banner.priority || 0,
        status: banner.status || "inactive",
      });
      setErrors({});
    }
  }, [banner]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        setErrors({ ...errors, image: "Vui lòng chọn hình nhỏ hơn 5MB." });
        return;
      }
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
      setErrors({ ...errors, image: "" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    let valid = true;
    const newErrors = {
      title: "",
      startDate: "",
      endDate: "",
      priority: "",
      image: "",
    };

    if (!formData.title) {
      newErrors.title = "Vui lòng nhập tiêu đề.";
      valid = false;
    }

    if (!formData.startDate) {
      newErrors.startDate = "Vui lòng chọn ngày bắt đầu.";
      valid = false;
    }

    if (!formData.endDate) {
      newErrors.endDate = "Vui lòng chọn ngày kết thúc.";
      valid = false;
    }

    if (formData.priority < 0) {
      newErrors.priority = "Độ ưu tiên phải lớn hơn hoặc bằng 0.";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    setLoading(true);

    const updateData = new FormData();
    updateData.append("title", formData.title);
    updateData.append("startDate", formData.startDate);
    updateData.append("endDate", formData.endDate);
    updateData.append("priority", formData.priority.toString());
    updateData.append("status", formData.status);
    if (formData.image) {
      updateData.append("image", formData.image);
    }

    try {
      const res = await updateBanner(banner._id, updateData);
      if (res.success) {
        message.success("Cập nhật bản tin thành công.");
        fetchBanners();
        onClose();
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Cập nhật bản tin thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (!banner) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Cập nhật bản tin</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Tiêu đề:</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề"
            />
            {errors.title && (
              <Text color="red.500" fontSize="sm">
                {errors.title}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Xem trước ảnh:</label>
            <Image
              src={formData.imagePreview || PLACEHOLDER_IMAGE}
              alt="Preview"
              boxSize="300px"
              objectFit="cover"
              borderRadius="8px"
              mb={2}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Đổi ảnh (nếu cần):</label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {errors.image && (
              <Text color="red.500" fontSize="sm">
                {errors.image}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Ngày bắt đầu:</label>
            <Input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
            {errors.startDate && (
              <Text color="red.500" fontSize="sm">
                {errors.startDate}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Ngày kết thúc:</label>
            <Input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
            {errors.endDate && (
              <Text color="red.500" fontSize="sm">
                {errors.endDate}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Ưu tiên:</label>
            <Input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            />
            {errors.priority && (
              <Text color="red.500" fontSize="sm">
                {errors.priority}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Trạng thái:</label>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Ẩn</option>
            </Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleSubmit}
            isLoading={loading}
          >
            Lưu
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}