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
import React, { useState, useCallback } from "react";
import { createBranch } from "services/branchService";

export default  function CreateBranchModal({ isOpen, onClose, onSuccess }) {
  const [newBranch, setNewBranch] = useState({
    title: "",
    image: null,
    imagePreview: null,
    address: "",
    phone: "",
    managerName: "",
    status: "active",
  });

  const [errors, setErrors] = useState({
    title: "",
    image: "",
    address: "",
    phone: "",
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
      setNewBranch({
        ...newBranch,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
      setErrors({ ...errors, image: "" });
    }
  };

  const handleSubmit = useCallback(async () => {
    let valid = true;
    const newErrors = {
      title: "",
      image: "",
      address: "",
      phone: "",
    };

    if (!newBranch.title) {
      newErrors.title = "Vui lòng nhập tiêu đề.";
      valid = false;
    }

    if (!newBranch.image) {
      newErrors.image = "Vui lòng tải lên hình ảnh.";
      valid = false;
    }

    if (!newBranch.address) {
      newErrors.address = "Vui lòng nhập địa chỉ.";
      valid = false;
    }

    if (!newBranch.phone) {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("title", newBranch.title);
    formData.append("address", newBranch.address);
    formData.append("phone", newBranch.phone);
    formData.append("managerName", newBranch.managerName);
    formData.append("status", newBranch.status);
    formData.append("image", newBranch.image);

    try {
      const response = await createBranch(formData);
      if (response.success) {
        message.success("Tạo chi nhánh thành công.");
        onClose();
        onSuccess();
        setNewBranch({
          title: "",
          image: null,
          imagePreview: null,
          address: "",
          phone: "",
          managerName: "",
          status: "active",
        });
      } else {
        throw new Error(response.message || "Tạo chi nhánh thất bại.");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Tạo chi nhánh thất bại.");
    } finally {
      setLoading(false);
    }
  }, [newBranch, onClose, onSuccess]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Thêm chi nhánh</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div style={{ marginBottom: 16 }}>
            <FormLabel>Tiêu đề</FormLabel>
            <Input
              allowClear
              placeholder="Nhập tiêu đề chi nhánh"
              value={newBranch.title}
              onChange={(e) =>
                setNewBranch({ ...newBranch, title: e.target.value })
              }
            />
            {errors.title && (
              <Text color="red.500" fontSize="sm">
                {errors.title}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Địa chỉ</FormLabel>
            <Input
              allowClear
              placeholder="Nhập địa chỉ"
              value={newBranch.address}
              onChange={(e) =>
                setNewBranch({ ...newBranch, address: e.target.value })
              }
            />
            {errors.address && (
              <Text color="red.500" fontSize="sm">
                {errors.address}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Số điện thoại</FormLabel>
            <Input
              allowClear
              placeholder="Nhập số điện thoại"
              value={newBranch.phone}
              onChange={(e) =>
                setNewBranch({ ...newBranch, phone: e.target.value })
              }
            />
            {errors.phone && (
              <Text color="red.500" fontSize="sm">
                {errors.phone}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Tên quản lý</FormLabel>
            <Input
              allowClear
              placeholder="Nhập tên quản lý"
              value={newBranch.managerName}
              onChange={(e) =>
                setNewBranch({ ...newBranch, managerName: e.target.value })
              }
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Trạng thái</FormLabel>
            <Select
              value={newBranch.status}
              onChange={(e) =>
                setNewBranch({ ...newBranch, status: e.target.value })
              }
            >
              <option value="active">Kích hoạt</option>
              <option value="inactive">Tạm ngưng</option>
            </Select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormLabel>Xem trước ảnh</FormLabel>
            <Image
              src={newBranch.imagePreview || PLACEHOLDER_IMAGE}
              alt="Branch"
              boxSize="150px"
              objectFit="cover"
              mb={4}
              borderRadius="8px"
            />
          </div>

          <div>
            <FormLabel>Tải lên ảnh chi nhánh</FormLabel>
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
            disabled={loading}
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