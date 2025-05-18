import axios from "axios";
import uploadImages from "./UploadFile";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api/users";

// Hàm lấy token từ localStorage
const getAuthToken = () => {
  return localStorage.getItem("token") || "";
};

export const fetchStaffs = async ({ role, name, page = 1, limit = 10 }) => {
  console.log("Fetching staff data...", { BASE_URL, role, name, page, limit });

  try {
    const token = getAuthToken();
    if (!token) {
      console.warn("No auth token found");
      return { users: [], total: 0, currentPage: 1, totalPages: 1 };
    }

    const query = new URLSearchParams({
      role: role || "academic,consultant,teacher",
      ...(name && { name }),
      page,
      limit,
    }).toString();

    const response = await axios.get(`${BASE_URL}?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      users: response.data.data,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
    };
  } catch (error) {
    console.error("Failed to fetch staff data:", error);
    return { users: [], total: 0, currentPage: 1, totalPages: 1 };
  }
};

export const fetchCertificatesByTeacherId = async (teacherId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn("No auth token found");
      return [];
    }

    const response = await axios.get(
      `${BASE_URL}/teachers/certificate/${teacherId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error(
      `Failed to fetch certificates for teacher ${teacherId}:`,
      error
    );
    return [];
  }
};

export const createStaff = async (newStaff) => {
  try {
    console.log("Creating staff:", newStaff);

    const token = getAuthToken();
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axios.post(`${BASE_URL}/create`, newStaff, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating staff:", error);
    throw error;
  }
};
