import React, { useEffect, useState } from "react";
import { Modal, Form, Select, Button, message } from "antd";
import { getAllBranches } from "services/branchService";
import { getAllStaff, getStaffByBranch } from "services/userService";
import { createBranchStaff, getStaffByBranch as getStaffInBranch } from "services/branchStaffService";

const { Option } = Select;

const CreateBranchStaffModal = ({ visible, onCancel, onCreateSuccess }) => {
  const [form] = Form.useForm();
  const [branches, setBranches] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [existingStaffIds, setExistingStaffIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchData();
      setExistingStaffIds([]); // reset khi mở modal
    }
  }, [visible]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchData, staffData] = await Promise.all([
        getAllBranches(),
        getAllStaff(),
      ]);

      setBranches(branchData || []);
      const filteredStaff = (staffData || []).filter(
        (staff) => staff.role !== "customer"
      );
      setStaffs(filteredStaff);

      if (branchData.length === 0) {
        message.warning("Không có chi nhánh nào trong hệ thống.");
      }
    } catch (error) {
      message.error("Lấy dữ liệu thất bại.");
      console.error(error);
      setBranches([]);
      setStaffs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = async (branchId) => {
    form.setFieldsValue({ staffIds: [] }); // reset staff chọn
    try {
      const response = await getStaffInBranch(branchId);
      const staffIds = (response || []).map(item => item.staffId._id);
      setExistingStaffIds(staffIds);
    } catch (error) {
      console.error("Lỗi khi load nhân viên theo chi nhánh", error);
      setExistingStaffIds([]);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await Promise.all(
        values.staffIds.map((staffId) =>
          createBranchStaff({ branchId: values.branchId, staffId })
        )
      );
      message.success("Thêm thành công");
      form.resetFields();
      onCreateSuccess();
    } catch (error) {
      message.error("Thêm thất bại.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Thêm nhân viên vào chi nhánh"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
        >
          Thêm
        </Button>,
      ]}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="branchId"
          label="Chi nhánh"
          rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
        >
          <Select
            showSearch
            placeholder="Chọn chi nhánh"
            optionFilterProp="children"
            onChange={handleBranchChange}
            loading={loading}
            disabled={loading}
          >
            {branches.map((branch) => (
              <Option key={branch._id} value={branch._id}>
                {branch.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="staffIds"
          label="Nhân viên"
          rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 nhân viên" }]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn nhân viên"
            optionFilterProp="children"
            showSearch
            loading={loading}
            disabled={loading || !form.getFieldValue("branchId")}
          >
            {staffs.map((staff) => (
              <Option
                key={staff._id}
                value={staff._id}
                disabled={existingStaffIds.includes(staff._id)}
              >
                {staff.name} ({staff.role}){" "}
                {existingStaffIds.includes(staff._id) ? "✅" : ""}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateBranchStaffModal;
