import axios from "axios";
// require("dotenv").config();
const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

// export const registerUser = async (username, email, password, confirmPassword) => {
//   try {
//     const response = await axios.post(`${API}/users/register`, {
//       username,
//       email,
//       password,
//       confirmPassword,
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Registration error:", error);
//     throw error;
//   }
//};

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API}users/login`, {
      username,
      password,
    });

    // Ensure the response includes the role ObjectId
    if (!response.data.user || !response.data.user.role) {
      throw new Error("Invalid user data received from server");
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
