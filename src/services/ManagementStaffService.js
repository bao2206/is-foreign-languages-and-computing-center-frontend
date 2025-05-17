import axios from "axios";
import uploadImages from "./UploadFile";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api/users";

// Hàm lấy token từ localStorage
const getAuthToken = () => {
  return localStorage.getItem("token") || "";
};

export const fetchStaffs = async () => {
  console.log("Fetching staff data...", BASE_URL);

  try {
    const token = getAuthToken();
    if (!token) {
      console.warn("No auth token found");
      return [];
    }

    const response = await axios.get(`${BASE_URL}/staff`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data; // vì response có dạng { data: [...] }
  } catch (error) {
    console.error("Failed to fetch staff data:", error);
    return [];
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

const isValidBase64Image = async (file) => {
  const validTypes = ["png", "jpeg", "gif", "webp", "bmp"];
  const type = file ? file[1].toLowerCase() : "";
  if (!validTypes.includes(type)) {
    console.warn(`Unsupported image type: ${type}`);
    return false;
  }
};

export const createStaff = async (newStaff) => {
  try {
    console.log(newStaff);

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
