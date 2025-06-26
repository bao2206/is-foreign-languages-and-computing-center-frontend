import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}attendance/`;

export const getAttendanceByClassIdAndDate = async (classId, date) => {
  try {
    const payload = {
      classId,
      date,
    };
    console.log("Fetching attendance for class ID:", classId, "on date:", date);

    const response = await axios.post(`${BASE_URL}class`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("Attendance data received:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance by class ID and date:", error);
    throw error;
  }
};

export const getAttendanceByClassId = async (classId) => {
  try {
    const response = await axios.get(`${BASE_URL}getByClassId/${classId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response;
  } catch (error) {
    console.error("Error fetching attendance by class ID:", error);
    throw error;
  }
};

export const getAttendanceByStudentId = async (studentId) => {
  try {
    console.log("Fetching attendance for student ID:", studentId);

    const response = await axios.get(`${BASE_URL}student/${studentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log(
      "Attendance data for student ID:",
      studentId,
      "received:",
      response
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching attendance by student ID:", error);
    throw error;
  }
};

export const createAttendanceRecord = async (attendanceData) => {
  try {
    const response = await axios.post(`${BASE_URL}create`, attendanceData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating attendance record:", error);
    throw error;
  }
};

export const updateAttendanceRecord = async (attendanceId, attendanceData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}update/${attendanceId}`,
      attendanceData,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating attendance record:", error);
    throw error;
  }
};
