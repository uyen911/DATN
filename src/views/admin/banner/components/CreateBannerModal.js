import React, { useState, useCallback } from "react";
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
  Select,
} from "@chakra-ui/react";
import { Input, message } from "antd";
import { createBanner } from "services/bannerService";

export default function CreateBannerModal({ isOpen, onClose, onSuccess }) {
  const [newBanner, setNewBanner] = useState({
    title: "",
    image: null,
    imagePreview: null,
    startDate: "",
    endDate: "",
    status: "active",
    priority: 0,
  });

  const [errors, setErrors] = useState({
    title: "",
    image: "",
    startDate: "",
    endDate: "",
    priority: "",
  });

  const [loading, setLoading] = useState(false);
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        setErrors({ ...errors, image: "Vui lòng chọn ảnh nhỏ hơn 5MB." });
        return;
      }
      setNewBanner({
        ...newBanner,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
      setErrors({ ...errors, image: "" });
    }
  };

  const handleSubmit = useCallback(async () => {
    let valid = true;
    const newErrors = { title: "", image: "", startDate: "", endDate: "", priority: "" };

    if (!newBanner.title) {
      newErrors.title = "Vui lòng nhập tiêu đề.";
      valid = false;
    }

    if (!newBanner.image) {
      newErrors.image = "Vui lòng tải lên hình ảnh.";
      valid = false;
    }

    if (!newBanner.startDate) {
      newErrors.startDate = "Vui lòng chọn ngày bắt đầu.";
      valid = false;
    }

    if (!newBanner.endDate) {
      newErrors.endDate = "Vui lòng chọn ngày kết thúc.";
      valid = false;
    }

    if (newBanner.priority < 0) {
      newErrors.priority = "Độ ưu tiên phải lớn hơn hoặc bằng 0.";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("title", newBanner.title);
    formData.append("startDate", newBanner.startDate);
    formData.append("endDate", newBanner.endDate);
    formData.append("status", newBanner.status);
    formData.append("priority", newBanner.priority.toString());
    formData.append("image", newBanner.image);

    try {
      console.log("Sending create banner request...");
      const response = await createBanner(formData);
      console.log("Response:", response);
      if (response.success) {
        message.success("Tạo banner thành công.");
        onClose();
        onSuccess();
        setNewBanner({
          title: "",
          image: null,
          imagePreview: null,
          startDate: "",
          endDate: "",
          status: "active",
          priority: 0,
        });
      } else {
        throw new Error(response.message || "Tạo banner thất bại.");
      }
    } catch (error) {
      console.error("Error creating banner:", error);
      message.error(error.response?.data?.message || "Tạo banner thất bại.");
    } finally {
      setLoading(false);
    }
  }, [newBanner, onClose, onSuccess]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Thêm bản tin mới</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div style={{ marginBottom: 16 }}>
            <FormLabel>Tiêu đề</FormLabel>
            <Input
              allowClear
              placeholder="Nhập tiêu đề banner"
              value={newBanner.title}
              onChange={(e) =>
                setNewBanner({ ...newBanner, title: e.target.value })
              }
            />
            {errors.title && (
              <Text color="red.500" fontSize="sm">
                {errors.title}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Ngày bắt đầu</FormLabel>
            <Input
              type="date"
              value={newBanner.startDate}
              onChange={(e) =>
                setNewBanner({ ...newBanner, startDate: e.target.value })
              }
            />
            {errors.startDate && (
              <Text color="red.500" fontSize="sm">
                {errors.startDate}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Ngày kết thúc</FormLabel>
            <Input
              type="date"
              value={newBanner.endDate}
              onChange={(e) =>
                setNewBanner({ ...newBanner, endDate: e.target.value })
              }
            />
            {errors.endDate && (
              <Text color="red.500" fontSize="sm">
                {errors.endDate}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Trạng thái</FormLabel>
            <Select
              value={newBanner.status}
              onChange={(e) =>
                setNewBanner({ ...newBanner, status: e.target.value })
              }
            >
              <option value="active">Kích hoạt</option>
              <option value="inactive">Tạm ngưng</option>
            </Select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Độ ưu tiên</FormLabel>
            <Input
              type="number"
              value={newBanner.priority}
              onChange={(e) =>
                setNewBanner({ ...newBanner, priority: parseInt(e.target.value) || 0 })
              }
            />
            {errors.priority && (
              <Text color="red.500" fontSize="sm">
                {errors.priority}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Xem trước ảnh</FormLabel>
            <Image
              src={newBanner.imagePreview || PLACEHOLDER_IMAGE}
              alt="Banner"
              boxSize="150px"
              objectFit="cover"
              mb={4}
              borderRadius="8px"
            />
          </div>

          <div>
            <FormLabel>Tải lên ảnh bản tin</FormLabel>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {errors.image && (
              <Text color="red.500" fontSize="sm">
                {errors.image}
              </Text>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="teal"
            mr={3}
            onClick={handleSubmit}
            isLoading={loading}
            disabled={loading} // Prevent double clicks
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