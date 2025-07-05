import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}`;

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user ? user.accessToken : null;
  return { Authorization: `Bearer ${token}` };
};

export const getAllBranches = async () => {
  try {
    const response = await axios.get(`${API_URL}/branch`, {
      headers: getAuthHeaders(),
    });
    return response.data.payload;
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
};

export const createBranch = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/branch`, data, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating branch:", error);
    throw error;
  }
};

export const updateBranch = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/branch/${id}`, data, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating branch:", error);
    throw error;
  }
};

export const deleteBranch = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/branch/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting branch:", error);
    throw error;
  }
};