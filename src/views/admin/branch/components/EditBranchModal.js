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
  Select,
  FormLabel,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { Input, message } from "antd";
import { updateBranch } from "services/branchService";

export default function EditBranchModal({ isOpen, onClose, branch, fetchBranches }) {
  const [formData, setFormData] = useState({
    title: "",
    image: null,
    imagePreview: null,
    address: "",
    phone: "",
    managerName: "",
    status: "inactive",
  });

  const [errors, setErrors] = useState({
    title: "",
    address: "",
    phone: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";

  useEffect(() => {
    if (branch) {
      setFormData({
        title: branch.title || "",
        image: null,
        imagePreview: branch.imageUrl || null,
        address: branch.address || "",
        phone: branch.phone || "",
        managerName: branch.managerName || "",
        status: branch.status || "inactive",
      });
      setErrors({});
    }
  }, [branch]);

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
      address: "",
      phone: "",
      image: "",
    };

    if (!formData.title) {
      newErrors.title = "Vui lòng nhập tiêu đề.";
      valid = false;
    }

    if (!formData.address) {
      newErrors.address = "Vui lòng nhập địa chỉ.";
      valid = false;
    }

    if (!formData.phone) {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    setLoading(true);

    const updateData = new FormData();
    updateData.append("title", formData.title);
    updateData.append("address", formData.address);
    updateData.append("phone", formData.phone);
    updateData.append("managerName", formData.managerName);
    updateData.append("status", formData.status);
    if (formData.image) {
      updateData.append("image", formData.image);
    }

    try {
      const res = await updateBranch(branch._id, updateData);
      if (res.success) {
        message.success("Cập nhật chi nhánh thành công.");
        fetchBranches();
        onClose();
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Cập nhật chi nhánh thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (!branch) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Cập nhật chi nhánh</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div style={{ marginBottom: 16 }}>
            <FormLabel>Tiêu đề:</FormLabel>
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
            <FormLabel>Địa chỉ:</FormLabel>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
            />
            {errors.address && (
              <Text color="red.500" fontSize="sm">
                {errors.address}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Số điện thoại:</FormLabel>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
            {errors.phone && (
              <Text color="red.500" fontSize="sm">
                {errors.phone}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Tên quản lý:</FormLabel>
            <Input
              name="managerName"
              value={formData.managerName}
              onChange={handleChange}
              placeholder="Nhập tên quản lý"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Xem trước ảnh:</FormLabel>
            <Image
              src={formData.imagePreview || PLACEHOLDER_IMAGE}
              alt="Preview"
              boxSize="150px"
              objectFit="cover"
              borderRadius="8px"
              mb={2}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Đổi ảnh (nếu cần):</FormLabel>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {errors.image && (
              <Text color="red.500" fontSize="sm">
                {errors.image}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Trạng thái:</FormLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Kích hoạt</option>
              <option value="inactive">Tạm ngưng</option>
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