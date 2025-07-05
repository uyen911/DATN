import {
  Box,
  Flex,
  CircularProgress,
  useDisclosure,
  Button as ChakraButton,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import { Table, Button, Popconfirm, Input } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { getAllBanners, deleteBanner,updateBanner  } from "services/bannerService";
import { debounce } from "lodash";
import { message } from "antd";
import Card from "components/card/Card";
import EditBannerModal from "./components/EditBannerModal";
import CreateBannerModal from "./components/CreateBannerModal";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editBannerData, setEditBannerData] = useState(null);
  const textColor = useColorModeValue("#1E40AF", "white");

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

  const fetchBanners = useCallback(
  async (search = searchTerm) => {
    setLoading(true);
    try {
      const data = await getAllBanners();
      const now = new Date();

      const updatedBanners = await Promise.all(
        data.map(async (banner) => {
          const isExpired = banner.endDate && new Date(banner.endDate) < now;
          const isActive = banner.status === "active";

          if (isExpired && isActive) {
            const formData = new FormData();
            formData.append("title", banner.title);
            formData.append("status", "inactive");

            // Nếu bạn cần giữ lại các trường khác như imageUrl, startDate, priority
            // thì phải append hết vào formData
            if (banner.startDate) formData.append("startDate", banner.startDate);
            if (banner.endDate) formData.append("endDate", banner.endDate);
            if (banner.priority) formData.append("priority", banner.priority);
            if (banner.imageUrl) {
              formData.append("imageUrl", banner.imageUrl); // nếu backend cho phép cập nhật bằng URL
              // Nếu yêu cầu ảnh dạng file, cần chuyển URL về File — nâng cao hơn
            }

            try {
              await updateBanner(banner._id, formData);
              return { ...banner, status: "inactive" };
            } catch (err) {
              console.error("Lỗi cập nhật trạng thái banner:", err);
              return banner;
            }
          }

          return banner;
        })
      );

      const filtered = updatedBanners.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase())
      );

      setBanners(filtered);
    } catch (error) {
      message.error("Không thể tải banner.");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  },
  [searchTerm]
);


  const debouncedFetchBanners = useCallback(
    debounce((value) => {
      fetchBanners(value);
    }, 800),
    [fetchBanners]
  );

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const confirmDeleteBanner = async (id) => {
    try {
      await deleteBanner(id);
      message.success("Đã xóa banner.");
      fetchBanners();
    } catch (error) {
      message.error("Lỗi xóa banner.");
    }
  };

  const handleEditClick = (record) => {
    setEditBannerData(record);
    onEditOpen();
  };

  const columns = [
    {
      title: "TIÊU ĐỀ BANNER",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "HÌNH ẢNH",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (text) => (
        <img
          src={text}
          alt="Banner"
          width={80}
          height={60}
          style={{ borderRadius: "12px", objectFit: "cover" }}
        />
      ),
    },
    {
      title: "NGÀY BẮT ĐẦU",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "—"),
    },
    {
      title: "NGÀY KẾT THÚC",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "—"),
    },
    {
  title: "TRẠNG THÁI",
  dataIndex: "status",
  key: "status",
  align: "center",
  render: (status) =>
    status === "active" ? (
      <CheckCircleTwoTone twoToneColor="#16A34A" style={{ fontSize: "20px" }} />
    ) : (
      <CloseCircleTwoTone twoToneColor="#DC2626" style={{ fontSize: "20px" }} />
    ),
},
    {
      title: "ĐỘ ƯU TIÊN",
      dataIndex: "priority",
      key: "priority",
    },
    {
      title: "THAO TÁC",
      key: "actions",
      align: "center",
      render: (text, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            type="link"
            icon={<EditOutlined style={{ color: "#2563EB", fontSize: "18px" }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(record);
            }}
          />
          <Popconfirm
            title="Bạn chắc chắn xóa banner này?"
            onConfirm={(e) => {
              e.stopPropagation();
              confirmDeleteBanner(record._id);
            }}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="link"
              icon={<DeleteOutlined style={{ color: "#FF4D4F", fontSize: "18px" }} />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }} w="100%">
      <Card direction="column" w="100%" px="25px" overflowX={{ sm: "scroll", lg: "hidden" }}>
        <Flex justify="space-between" mb="20px">
          <Input
            placeholder="Tìm banner..."
            allowClear
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              debouncedFetchBanners(e.target.value);
            }}
            style={{ width: "70%", borderColor: "#93C5FD" }}
          />
          <ChakraButton colorScheme="blue" onClick={onCreateOpen}>
           Thêm mới
          </ChakraButton>
        </Flex>

        {loading ? (
          <Flex justifyContent="center" mt="20px">
            <CircularProgress isIndeterminate color="#2563EB" />
          </Flex>
        ) : (
          <>
            <Box overflowX="auto" maxWidth="100%">
              <Table
                columns={columns}
                dataSource={banners}
                pagination={false}
                rowKey={(record) => record._id}
                style={{ width: "100%", cursor: "pointer" }}
                scroll={{ y: 400 }}
              />
            </Box>
<CreateBannerModal
  isOpen={isCreateOpen}
  onClose={onCreateClose}
  onSuccess={fetchBanners} 
/>            {editBannerData && (
              <EditBannerModal
                isOpen={isEditOpen}
                onClose={onEditClose}
                banner={editBannerData}
                fetchBanners={fetchBanners}
              />
            )}
          </>
        )}
      </Card>
    </Box>
  );
}
