    // import axios from 'axios';

    // const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}auth/` || 'http://localhost:8080/api/auth/';

    // // Create axios instance with default config
    // const axiosInstance = axios.create({
    //   baseURL: BASE_URL,
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });

    // // Add request interceptor to add auth token
    // axiosInstance.interceptors.request.use(
    //   (config) => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //       config.headers.Authorization = `Bearer ${token}`;
    //     }
    //     return config;
    //   },
    //   (error) => {
    //     return Promise.reject(error);
    //   }
    // );

    // // Validate token
    // export const validateToken = async () => {
    //   try {
    //     const token = localStorage.getItem('token');
    //     if (!token) {
    //       return { isValid: false };
    //     }

    //     const response = await axiosInstance.get('validate-token');
    //     return { isValid: true, data: response.data };
    //   } catch (error) {
    //     // If token is invalid or expired, clear it
    //     localStorage.removeItem('token');
    //     localStorage.removeItem('username');
    //     return { isValid: false };
    //   }
    // };

    // // Login
    // export const login = async (credentials) => {
    //   try {
    //     const response = await axiosInstance.post('login', credentials);
    //     if (response.data.token) {
    //       localStorage.setItem('token', response.data.token);
    //       localStorage.setItem('username', response.data.username);
    //     }
    //     return response.data;
    //   } catch (error) {
    //     throw error;
    //   }
    // };

    // // Logout
    // export const logout = () => {
    //   localStorage.removeItem('token');
    //   localStorage.removeItem('username');
    // }; 