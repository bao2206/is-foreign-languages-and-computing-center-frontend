import axios from "axios";

export const loginUser = async (username, password) => {
  const response = await axios.post("http://localhost:8080/api/users/login", {
    username,
    password,
  });
  console.log(response.data);

  return response.data;
};
