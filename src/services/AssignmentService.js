import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}assignment`;

export const getAssignments = async (config) => {
  try {
    const response = await axios.post(`${BASE_URL}/get`, config, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data; // Trả về { data, pagination }
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch assignments"
    );
  }
};

// Lấy danh sách assignments theo classId
export const getAssignmentsByClassId = async (classId) => {
  try {
    const config = {
      action: "getByClassId",
      classId: classId,
      populates: ["teacherId", "classId"], // Populate teacherId và classId
    };
    const response = await axios.post(`${BASE_URL}/get`, config, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data; // Trả về data từ response
  } catch (error) {
    console.log(error);

    throw new Error(
      error.response?.data?.message || "Failed to fetch assignments by class ID"
    );
  }
};

// Lấy assignment theo ID
export const getAssignmentById = async (id) => {
  try {
    const config = {
      action: "getByAssignmentId",
      assignmentId: id,
      populates: ["teacherId", "classId"], // Populate teacherId và classId
      authId: localStorage.getItem("userId"),
    };
    const response = await axios.post(`${BASE_URL}/get`, config, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.data[0]; // Lấy assignment đầu tiên (nếu có)
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch assignment by ID"
    );
  }
};

// Lấy danh sách assignments theo teacherId
export const getAssignmentsByTeacherId = async (teacherId) => {
  try {
    const config = {
      action: "getByTeacherId",
      authId: teacherId, // Sử dụng authId để tìm teacher
      populates: ["teacherId", "classId"], // Populate teacherId và classId
    };
    const response = await axios.post(`${BASE_URL}/get`, config, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.data; // Trả về data từ response
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch assignments by teacher ID"
    );
  }
};

// Lấy danh sách assignments theo studentId
export const getAssignmentsByStudentId = async (studentId) => {
  try {
    const config = {
      action: "getByStudentId",
      authId: studentId, // Sử dụng authId để tìm student
      populates: ["teacherId", "classId"], // Populate teacherId và classId
      authId: localStorage.getItem("userId"),
    };
    const response = await axios.post(`${BASE_URL}/get`, config, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.data; // Trả về data từ response
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch assignments by student ID"
    );
  }
};

// Tạo mới assignment
export const createAssignment = async (id, assignmentData) => {
  try {
    const payload = {
      id: id,
      data: assignmentData,
    };
    const response = await axios.post(`${BASE_URL}/create`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.data; // Trả về data từ response
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create assignment"
    );
  }
};

// Cập nhật assignment
export const updateAssignment = async (id, updateData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, updateData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.data; // Trả về data từ response
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update assignment"
    );
  }
};

// Xóa assignment
export const deleteAssignment = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data; // Trả về response (thường là message)
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete assignment"
    );
  }
};

// Submit assignment
export const submitAssignment = async (assignmentId, submissionData) => {
  try {
    console.log("submit");

    const response = await axios.post(
      `${BASE_URL}/${assignmentId}/submit`, // Cần thêm endpoint submit trong backend
      submissionData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data.data; // Trả về data từ response
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to submit assignment"
    );
  }
};
