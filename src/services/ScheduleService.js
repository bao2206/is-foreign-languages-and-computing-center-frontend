import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}schedules`;

export const fetchClasses = async (userId, role) => {
  const response = await axios.get(`${API_URL}/classes/${role}/${userId}`);
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

    return response.data;
  } catch (error) {
    console.error("Error fetching schedule by class:", error);
    if (error.response && error.response.status === 404) {
      return [];
    }
  }

  return [];
};

export const getScheduleByTeacherId = async () => {
  try {
    const payload = {
      action: "getByTeacherId",
      authId: localStorage.getItem("userId"),
    };

    const response = await axios.post(`${API_URL}/get`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching schedule by teacher ID:", error);
    if (error.response && error.response.status === 404) {
      return [];
    }
  }
};

export const getScheduleByStudentId = async () => {
  try {
    const payload = {
      action: "getByStudentId",
      authId: localStorage.getItem("userId"),
    };
    const response = await axios.post(`${API_URL}/get`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching schedule by student ID:", error);
    if (error.response && error.response.status === 404) {
      return [];
    }
  }
};

export const createSchedule = async (query) => {
  const response = await axios.post(`${API_URL}/create`, query, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};
