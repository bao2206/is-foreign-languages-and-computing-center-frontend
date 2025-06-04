import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}schedules`;

export const fetchClasses = async (userId, role) => {
  const response = await axios.get(`${API_URL}/classes/${role}/${userId}`);
  return response.data;
};

export const fetchSchedule = async (userId, role) => {
  const response = await axios.get(`${API_URL}/${role}/${userId}`);
  return response.data;
};

export const fetchScheduleByClass = async (classId) => {
  try {
    const data = {
      action: "getByClassId",
      classId: classId,
    };
    const response = await axios.post(`${API_URL}/get`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("Fetch schedule by class response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error fetching schedule by class:", error);
    if (error.response && error.response.status === 404) {
      return [];
    }
  }

  return [];
};

export const createSchedule = async (query) => {
  const response = await axios.post(`${API_URL}/create`, query, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};
