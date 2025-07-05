import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/branchStaff`;

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user ? user.accessToken : null;
  return { Authorization: `Bearer ${token}` };
};

// Thêm nhân viên vào chi nhánh
export const createBranchStaff = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/staffbranch`, data, {
      headers: getAuthHeaders(),
    });
    return response.data.payload;
  } catch (error) {
    console.error("Error creating branch-staff:", error);
    throw error;
  }
};

// Lấy toàn bộ danh sách staffBranch
export const getAllBranchStaff = async () => {
  try {
    const response = await axios.get(`${API_URL}/staffbranch`, {
      headers: getAuthHeaders(),
    });
    return response.data.payload;
  } catch (error) {
    console.error("Error fetching branch staff:", error);
    return [];
  }
};
// Lấy danh sách nhân viên theo chi nhánh
export const getStaffByBranch = async (branchId) => {
  try {
    const response = await axios.get(`${API_URL}/staffbranch/${branchId}`, {
      headers: getAuthHeaders(),
    });
    return response.data.payload;
  } catch (error) {
    console.error("Error fetching staff by branch:", error);
    return [];
  }
};

// Xóa staffBranch theo id
export const deleteBranchStaff = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/staffbranch/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting branch staff:", error);
    throw error;
  }
};
