// ManagementStaffService.js
import axios from "axios";

const BASE_URL =
  `${process.env.REACT_APP_API_BASE_URL}role/` ||
  "http://localhost:8080/api/role/";

export const fetchRoles = async () => {
  try {
    const url = `${BASE_URL}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("Roles fetched successfully:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch roles:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch roles");
  }
};
