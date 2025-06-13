// ManagementStaffService.js
import axios from "axios";

const BASE_URL =
  `${process.env.REACT_APP_API_BASE_URL}users/` ||
  "http://localhost:8080/api/users/";

export const fetchUsers = async ({
  role,
  search,
  status,
  sex,
  page,
  limit,
}) => {
  try {
    const url = `${BASE_URL}`;
    // console.log("URL:", url);
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
    if (error.response) {
      throw {
        message: error.response.data.message || 'Failed to fetch users',
        status: error.response.status
      };
    } else if (error.request) {
      throw {
        message: 'No response from server',
        status: 500
      };
    } else {
      throw {
        message: error.message || 'Error fetching users',
        status: 500
      };
    }
  }
};

export const createStaff = async (staffData) => {
  try {
    const url = `${BASE_URL}create`;
    const response = await axios.post(url, staffData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Handle specific validation errors
      if (error.response.status === 400) {
        const errorMessage = error.response.data.message;
        if (errorMessage === "Email already exists") {
          throw {
            message: "Email already exists",
            status: 400
          };
        } else if (errorMessage === "Phone already exists") {
          throw {
            message: "Phone number already exists",
            status: 400
          };
        } else if (errorMessage === "Citizen ID already exists") {
          throw {
            message: "Citizen ID already exists",
            status: 400
          };
        } else if (error.response.data.errors) {
          // Handle field validation errors
          throw {
            message: Object.values(error.response.data.errors).join(", "),
            status: 400
          };
        }
      }
      // Handle other server errors
      throw {
        message: error.response.data.message || 'Failed to create staff',
        status: error.response.status
      };
    } else if (error.request) {
      throw {
        message: 'No response from server',
        status: 500
      };
    } else {
      throw {
        message: error.message || 'Error creating staff',
        status: 500
      };
    }
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
    if (error.response) {
      throw {
        message: error.response.data.message || 'Failed to update user',
        status: error.response.status
      };
    } else if (error.request) {
      throw {
        message: 'No response from server',
        status: 500
      };
    } else {
      throw {
        message: error.message || 'Error updating user',
        status: 500
      };
    }
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
    if (error.response) {
      throw {
        message: error.response.data.message || 'Failed to fetch certificates',
        status: error.response.status
      };
    } else if (error.request) {
      throw {
        message: 'No response from server',
        status: 500
      };
    } else {
      throw {
        message: error.message || 'Error fetching certificates',
        status: 500
      };
    }
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
    if (error.response) {
      throw {
        message: error.response.data.message || 'Failed to add certificate',
        status: error.response.status
      };
    } else if (error.request) {
      throw {
        message: 'No response from server',
        status: 500
      };
    } else {
      throw {
        message: error.message || 'Error adding certificate',
        status: 500
      };
    }
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
    if (error.response) {
      throw {
        message: error.response.data.message || 'Failed to update certificate',
        status: error.response.status
      };
    } else if (error.request) {
      throw {
        message: 'No response from server',
        status: 500
      };
    } else {
      throw {
        message: error.message || 'Error updating certificate',
        status: 500
      };
    }
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
    if (error.response) {
      throw {
        message: error.response.data.message || 'Failed to delete certificate',
        status: error.response.status
      };
    } else if (error.request) {
      throw {
        message: 'No response from server',
        status: 500
      };
    } else {
      throw {
        message: error.message || 'Error deleting certificate',
        status: 500
      };
    }
  }
};
