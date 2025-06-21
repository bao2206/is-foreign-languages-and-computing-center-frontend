import axios from "axios";

const BASE_URL =
  `${process.env.REACT_APP_API_BASE_URL}users/` ||
  "http://localhost:8080/api/users/";

// Get token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  return token ? `Bearer ${token}` : null;
};

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all students with filtering and pagination
export const fetchStudents = async ({
  search,
  status,
  courseId,
  page = 1,
  limit = 10,
}) => {
  try {
    const url = `${BASE_URL}students`;
    const response = await axiosInstance.get(url, {
      params: {
        search,
        status,
        courseId,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

// Get single student by ID
export const getStudent = async (id) => {
  try {
    const response = await axiosInstance.get(`${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
};

// Create new student
export const createStudent = async (studentData) => {
  try {
    const response = await axiosInstance.post("", studentData);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Handle specific validation errors
      if (error.response.status === 400) {
        const errorMessage = error.response.data.message;
        if (errorMessage === "Email already exists") {
          throw {
            message: "Email already exists",
            status: 400,
          };
        } else if (errorMessage === "Phone already exists") {
          throw {
            message: "Phone number already exists",
            status: 400,
          };
        } else if (error.response.data.errors) {
          // Handle field validation errors
          throw {
            message: Object.values(error.response.data.errors).join(", "),
            status: 400,
          };
        }
      }
      throw {
        message: error.response.data.message || "Failed to create student",
        status: error.response.status,
      };
    } else if (error.request) {
      throw {
        message: "No response from server",
        status: 500,
      };
    } else {
      throw {
        message: error.message || "Error creating student",
        status: 500,
      };
    }
  }
};

// Update student
export const updateStudent = async (id, studentData) => {
  try {
    const response = await axiosInstance.patch(`${id}`, studentData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw {
        message: error.response.data.message || "Failed to update student",
        status: error.response.status,
      };
    } else if (error.request) {
      throw {
        message: "No response from server",
        status: 500,
      };
    } else {
      throw {
        message: error.message || "Error updating student",
        status: 500,
      };
    }
  }
};

// Delete student
export const deleteStudent = async (id) => {
  try {
    const response = await axiosInstance.delete(`${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
};

// Get student's enrolled classes
export const getStudentClasses = async (studentId) => {
  try {
    const response = await axiosInstance.get(`${studentId}/classes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student's classes:", error);
    throw error;
  }
};

// Get student's payment history
export const getStudentPayments = async (studentId) => {
  try {
    const response = await axiosInstance.get(`${studentId}/payments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student's payments:", error);
    throw error;
  }
};

// Update student's status
export const updateStudentStatus = async (studentId, { status, notes }) => {
  try {
    const response = await axiosInstance.patch(`${studentId}/status`, {
      status,
      notes,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating student status:", error);
    throw error;
  }
};
