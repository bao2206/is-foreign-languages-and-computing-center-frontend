// services/staffService.js
import axios from 'axios';

const URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const BASE_URL = `http://localhost:8080/api/users`;


export const fetchStaffs = async () => {
  console.log("Fetching staff data...", BASE_URL);
  
  try {
    const response = await axios.get(`${BASE_URL}/staff`);
    return response.data.data; // vì response có dạng { data: [...] }
  } catch (error) {
    console.error('Failed to fetch staff data:', error);
    return [];
  }
};


export const fetchCertificatesByTeacherId = async (teacherId) => {
  try {
    const response = await axios.get(`${BASE_URL}/teachers/certificate/${teacherId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch certificates for teacher ${teacherId}:`, error);
    return [];
  }
};
