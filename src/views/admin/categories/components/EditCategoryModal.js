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
import { Input, message } from "antd";
import React, { useState, useEffect } from "react";
import { updateCategory } from "services/categoryService";

export default function EditCategoryModal({ isOpen, onClose, category, fetchCategories }) {
  const [editCategory, setEditCategory] = useState({
    categoryName: "",
    description: "",
    image: null,
    isActive: true,
    status: "active",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    categoryName: "",
    description: "",
    image: "",
  });

useEffect(() => {
  if (category) {
    setEditCategory({
      categoryName: category.categoryName,
      description: category.description,
      image: null,
      isActive: category.isActive,
      status: category.status, 
    });
    setPreviewImage(category.images || "https://via.placeholder.com/150");
    setErrors({ categoryName: "", description: "", image: "" });
  }
}, [category]);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        setErrors({ ...errors, image: "Vui lòng chọn hình ảnh nhỏ hơn 5MB." });
      } else {
        setEditCategory({ ...editCategory, image: file });
        setPreviewImage(URL.createObjectURL(file));
        setErrors({ ...errors, image: "" });
      }
    }
  };

  const handleSubmit = async () => {
    const newErrors = { categoryName: "", description: "", image: "" };
    let isValid = true;

    if (!editCategory.categoryName) {
      newErrors.categoryName = "Vui lòng nhập tên danh mục.";
      isValid = false;
    }

    if (!editCategory.description) {
      newErrors.description = "Vui lòng nhập mô tả.";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("categoryName", editCategory.categoryName);
    formData.append("description", editCategory.description);
    formData.append("isActive", editCategory.isActive);
    formData.append("status", editCategory.status)
    if (editCategory.image) {
      formData.append("image", editCategory.image);
    }

    try {
      await updateCategory(category._id, formData);
      message.success("Cập nhật danh mục thành công");
      fetchCategories();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Cập nhật danh mục thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Chỉnh sửa danh mục</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
              Tên danh mục:
            </label>
            <Input
              value={editCategory.categoryName}
              onChange={(e) =>
                setEditCategory({ ...editCategory, categoryName: e.target.value })
              }
            />
            {errors.categoryName && <Text color="red.500">{errors.categoryName}</Text>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
              Mô tả:
            </label>
            <Input.TextArea
              rows={3}
              value={editCategory.description}
              onChange={(e) =>
                setEditCategory({ ...editCategory, description: e.target.value })
              }
            />
            {errors.description && <Text color="red.500">{errors.description}</Text>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Hình ảnh hiện tại:</label>
            <Image
              src={previewImage}
              boxSize="150px"
              objectFit="cover"
              borderRadius="8px"
              mt={2}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
              Tải ảnh mới (nếu muốn):
            </label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
              Trạng thái nổi bật:
            </label>
            <Select
              value={editCategory.isActive ? "true" : "false"}
              onChange={(e) =>
                setEditCategory({ ...editCategory, isActive: e.target.value === "true" })
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
  value={editCategory.status}
  onChange={(e) =>
    setEditCategory({ ...editCategory, status: e.target.value })
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
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}