import axios from 'axios';
// import { API_URL } from "../config";

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}contact/` || 'http://localhost:8080/api/contact/';

// Get token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : null;
};

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
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

// Create a new consultation (admin)
export const createAdminConsultation = async (consultationData) => {
  try {
    const response = await axiosInstance.post('admin', consultationData);
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw {
        message: error.response.data.message || 'Failed to create consultation',
        status: error.response.status
      };
    } else if (error.request) {
      // The request was made but no response was received
      throw {
        message: 'No response from server',
        status: 500
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      throw {
        message: error.message || 'Error creating consultation',
        status: 500
      };
    }
  }
};

// Get all consultations with filtering and pagination
export const getAllConsultations = async ({ status, search, sort, page = 1, limit = 10 }) => {
  try {
    const response = await axiosInstance.get('', {
      params: {
        status,
        search,
        sort,
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching consultations:", error);
    throw error;
  }
};

// Get single consultation by ID
export const getConsultation = async (id) => {
  try {
    const response = await axiosInstance.get(`${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching consultation:", error);
    throw error;
  }
};

// Update consultation
export const updateConsultation = async (id, consultationData) => {
  try {
    const response = await axiosInstance.patch(`${id}`, consultationData);
    return response.data;
  } catch (error) {
    console.error("Error updating consultation:", error);
    throw error;
  }
};

// Update consultation status
export const updateConsultationStatus = async (id, { status, notes, assignedClass }) => {
  try {
    const response = await axiosInstance.patch(`${id}/status`, {
      status,
      notes,
      assignedClass
    });
    return response.data;
  } catch (error) {
    console.error("Error updating consultation status:", error);
    throw error;
  }
};

// Delete consultation
export const deleteConsultation = async (id) => {
  try {
    const response = await axiosInstance.delete(`${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting consultation:", error);
    throw error;
  }
};

// Submit public contact form
export const submitContactForm = async (formData) => {
  try {
    const response = await axiosInstance.post('public', formData);
    return response.data;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};

export const getConsultationProcessed = async ({ page = 1, limit = 10, search = '' }) => {
  try {
    const response = await axiosInstance.get('processed', {
      params: {
        page,
        limit,
        search
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching processed consultations:', error);
    throw error;
  }
};
