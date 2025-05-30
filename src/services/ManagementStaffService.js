// ManagementStaffService.js
import axios from "axios";

const BASE_URL =
  `${process.env.REACT_APP_API_BASE_URL}users/` ||
  "http://localhost:8080/api/users/";

export const fetchStaffs = async ({
  role,
  search,
  status,
  sex,
  page,
  limit,
}) => {
  try {
    const url = `${BASE_URL}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      params: {
        role, // role có thể là "academic", "consultant", "teacher"
        page,
        limit,
        search, // Sử dụng searchTerm làm name
        status,
        sex,
      },
    });

    const users = response.data.data.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "N/A",
      citizenId: user.citizenId,
      sex: user.sex,
      status: user.status,
      role: user.authId?.role?.name || "N/A", // Lấy role từ authId
      avatar: user.avatar || "https://via.placeholder.com/100", // Giả định có trường avatar
    }));

    return {
      users,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
      limit: response.data.limit,
    };
  } catch (error) {
    console.error(
      "Failed to fetch staffs:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch staffs");
  }
};

export const createStaff = async (staffData) => {
  try {
    const url = `${BASE_URL}`;
    const response = await axios.post(url, staffData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Failed to create staff:",
      error.response?.data || error.message
    );
    throw new Error("Failed to create staff");
  }
};

// Các hàm khác (uploadImages, v.v.) giữ nguyên như cũ
export const uploadImages = async (file, multiple = false) => {
  // Logic upload ảnh giữ nguyên
};

export const fetchCertificatesByTeacherId = async (teacherId) => {
  try {
    const url = `${BASE_URL}certificates/${teacherId}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch certificates by teacher ID:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch certificates");
  }
};
