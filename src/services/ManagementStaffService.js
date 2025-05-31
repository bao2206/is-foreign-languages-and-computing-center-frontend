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
      citizenID: user.citizenID,
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

export const updateUser = async (userId, userData) => {
  // Remove 'role' from userData if it exists
  const { role, ...dataWithoutRole } = userData;

  try {
    const url = `${BASE_URL}info/${userId}`;
    const response = await axios.put(url, dataWithoutRole, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    return response.data.data;
  } catch (error) {
    console.error(
      "Failed to update user:",
      error.response?.data || error.message
    );
    throw new Error("Failed to update user");
  }
};

export const updateRole = async (userId, roleData) => {
  // try {
  //   const url = `${BASE_URL}role/${userId}`;
  //   const response = await axios.put(url, roleData, {
  //     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //   });
  //   return response.data;
  // } catch (error) {
  //   console.error(
  //     "Failed to update user role:",
  //     error.response?.data || error.message
  //   );
  //   throw new Error("Failed to update user role");
  // }
};

export const fetchCertificatesById = async (id) => {
  try {
    const url = `${BASE_URL}certificate/`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      params: { id }, // truyền teacherId vào param
    });

    return response.data.data;
  } catch (error) {
    console.error(
      "Failed to fetch certificates by teacher ID:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch certificates");
  }
};

export const addCertificate = async (id, certificateData) => {
  try {
    const url = `${BASE_URL}certificate/`;
    const response = await axios.post(url, certificateData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      params: { id }, // truyền teacherId vào param
    });
    return response.data;
  } catch (error) {
    console.error(
      "Failed to add certificate:",
      error.response?.data || error.message
    );
    throw new Error("Failed to add certificate");
  }
};

export const updateCertificate = async (certificateData) => {
  try {
    const url = `${BASE_URL}certificate/`;

    const response = await axios.put(url, certificateData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Failed to update certificate:",
      error.response?.data || error.message
    );
    throw new Error("Failed to update certificate");
  }
};

export const deleteCertificate = async (id) => {
  try {
    const url = `${BASE_URL}certificate/`;
    const response = await axios.delete(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      params: { id }, // truyền certificateId vào param
    });
    return response.data;
  } catch (error) {
    console.error(
      "Failed to delete certificate:",
      error.response?.data || error.message
    );
    throw new Error("Failed to delete certificate");
  }
};
