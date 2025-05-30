import axios from "axios";

const API_URL = "http://localhost:5000/api/schedule";

export const fetchSchedule = async (userId, role) => {
  const response = await axios.get(`${API_URL}/${role}/${userId}`);
  return response.data;
};

export const fetchClasses = async (userId, role) => {
  const response = await axios.get(`${API_URL}/classes/${role}/${userId}`);
  return response.data;
};
