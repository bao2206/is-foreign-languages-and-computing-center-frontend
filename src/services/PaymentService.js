import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}payment/`;

export const createPayment = async (paymentData) => {
  const response = await axios.post(BASE_URL, paymentData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

export const getAllPayments = async (params = {}) => {
  const response = await axios.get(BASE_URL, {
    params,
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await axios.get(`${BASE_URL}${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

export const updatePayment = async (id, paymentData) => {
  const response = await axios.put(`${BASE_URL}${id}`, paymentData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

export const deletePayment = async (id) => {
  const response = await axios.delete(`${BASE_URL}${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

export const updatePaymentStatus = async (id, status) => {
  const response = await axios.patch(`${BASE_URL}${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
}; 