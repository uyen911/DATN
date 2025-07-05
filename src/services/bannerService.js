import axios from "axios";
//import axiosInstance from "./axiosInstance";
const API_URL = `${process.env.REACT_APP_API_URL}`;
console.log("API_URL", API_URL);

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user ? user.accessToken : null;
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getAllBanners = async () => {
  try {
    const response = await axios.get(`${API_URL}/banner`, {
      headers: getAuthHeaders(),
    });
    return response.data.payload;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
};

export const createBanner = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/banner`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating banner:", error);
    throw error;
  }
};

export const updateBanner = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/banner/${id}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating banner:", error);
    throw error;
  }
};
// export const updateBanner = (id, data) => {
//   return axiosInstance.put(`/banners/${id}`, data).then((res) => res.data.data);
// };
export const deleteBanner = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/banner/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error;
  }
};
