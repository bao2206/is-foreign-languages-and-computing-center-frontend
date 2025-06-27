import axios from "axios";
// require("dotenv").config();
const API = process.env.REACT_APP_API_BASE_URL ;

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

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    await axios.post(
      `${API}users/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");

    console.log("User logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.get(`${API}users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.put(`${API}users/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
