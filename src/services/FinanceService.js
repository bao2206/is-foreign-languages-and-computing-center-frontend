import axios from 'axios';

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}payment/` || 'http://localhost:8080/api/payment/';

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

// Get financial summary (for dashboard cards)
export const getFinancialSummary = async () => {
  try {
    const response = await axiosInstance.get('summary');
    return response.data;
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    throw error;
  }
};

// Get all financial records with filtering and pagination
export const getFinancialRecords = async ({ 
  search, 
  status, 
  startDate, 
  endDate, 
  page = 1, 
  limit = 10 
}) => {
  try {
    const response = await axiosInstance.get('', {
      params: {
        search,
        status,
        startDate,
        endDate,
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching financial records:", error);
    throw error;
  }
};

// Get single financial record by ID
export const getFinancialRecord = async (id) => {
  try {
    const response = await axiosInstance.get(`${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching financial record:", error);
    throw error;
  }
};
export const completeCashPayment = async (paymentId) => {
  try {
    const response = await axios.post(`${BASE_URL}${paymentId}/complete-cash`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    
    return response.data;
  } catch (error) {
    // If the error response is HTML, this will help you debug
    if (error.response && error.response.data && typeof error.response.data === 'string') {
      console.error('Server returned HTML:', error.response.data);
    }
    throw error;
  }
};
// Create new payment record
export const createPayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post('', paymentData);
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

// Update payment record
export const updatePayment = async (id, paymentData) => {
  try {
    const response = await axiosInstance.patch(`${id}`, paymentData);
    return response.data;
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
};

// Delete payment record
export const deletePayment = async (id) => {
  try {
    const response = await axiosInstance.delete(`${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw error;
  }
};

// Download invoice
export const downloadInvoice = async (id) => {
  try {
    const response = await axiosInstance.get(`${id}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading invoice:", error);
    throw error;
  }
}; 