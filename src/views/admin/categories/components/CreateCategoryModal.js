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
import { createCategory } from "services/categoryService";

export default function CreateCategoryModal({ isOpen, onClose, fetchCategories }) {
  const [newCategory, setNewCategory] = useState({
    categoryName: "",
    description: "",
    image: null,
    imagePreview: null,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    categoryName: "",
    description: "",
    image: "",
  });

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";

  useEffect(() => {
    if (isOpen) {
      setNewCategory({
        categoryName: "",
        description: "",
        image: null,
        imagePreview: null,
        isActive: true,
        status: "active",
      });
      setErrors({
        categoryName: "",
        description: "",
        image: "",
      });
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        setErrors({ ...errors, image: "Vui lòng chọn hình ảnh nhỏ hơn 5MB." });
        return;
      }
      setNewCategory({
        ...newCategory,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
      setErrors({ ...errors, image: "" });
    }
  };

  const handleSubmit = async () => {
    let valid = true;
    const newErrors = { categoryName: "", description: "", image: "" };

    if (!newCategory.categoryName) {
      newErrors.categoryName = "Vui lòng nhập tên danh mục.";
      valid = false;
    }

    if (!newCategory.description) {
      newErrors.description = "Vui lòng nhập mô tả.";
      valid = false;
    }

    if (!newCategory.image) {
      newErrors.image = "Vui lòng tải lên hình ảnh.";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("categoryName", newCategory.categoryName);
    formData.append("description", newCategory.description);
    formData.append("image", newCategory.image);
    formData.append("isActive", newCategory.isActive);
    formData.append("status", newCategory.status);

    try {
      const response = await createCategory(formData);
      if (response.success) {
        message.success("Tạo danh mục thành công.");
        onClose();
        fetchCategories();
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Tạo danh mục thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Tạo danh mục mới</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
              Tên danh mục:
            </label>
            <Input
              placeholder="Nhập tên danh mục"
              value={newCategory.categoryName}
              onChange={(e) =>
                setNewCategory({ ...newCategory, categoryName: e.target.value })
              }
            />
            {errors.categoryName && <Text color="red.500">{errors.categoryName}</Text>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
              Mô tả:
            </label>
            <Input.TextArea
              placeholder="Nhập mô tả"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              rows={3}
            />
            {errors.description && <Text color="red.500">{errors.description}</Text>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Xem trước hình ảnh:</label>
            <Image
              src={newCategory.imagePreview || PLACEHOLDER_IMAGE}
              boxSize="150px"
              objectFit="cover"
              borderRadius="8px"
              mt={2}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
              Tải lên hình ảnh:
            </label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {errors.image && <Text color="red.500">{errors.image}</Text>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
              Trạng thái nổi bật:
            </label>
            <Select
              value={newCategory.isActive ? "true" : "false"}
              onChange={(e) =>
                setNewCategory({ ...newCategory, isActive: e.target.value === "true" })
              }
            >
              <option value="true">Hoạt động</option>
              <option value="false">Không hoạt động</option>
            </Select>
          </div>
        <div style={{ marginBottom: 16 }}>
  <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
    Trạng thái sử dụng:
  </label>
  <Select
    value={newCategory.status}
    onChange={(e) =>
      setNewCategory({ ...newCategory, status: e.target.value })
    }
  >
    <option value="active">Hoạt động</option>
    <option value="inactive">Ngừng hoạt động</option>
  </Select>
</div>


        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit} isLoading={loading}>
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