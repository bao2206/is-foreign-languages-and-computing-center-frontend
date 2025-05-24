import axios from "axios";
// require("dotenv").config();
const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";
export const loginUser = async (username, password) => {
  const response = await axios.post(`${API}/users/login`, {
    username,
    password,
  });
  console.log(response.data);

  return response.data;
};
