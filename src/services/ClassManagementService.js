import axios from "axios";

const BASE_URL =
  `${process.env.REACT_APP_API_BASE_URL}classes/` 

export const fetchClasses = async ({
  name,
  courseId,
  teacherId,
  status,
  startDate,
  endDate,
  page,
  limit,
}) => {
  try {
    const payload = {
      query: {
        action: "getAll",
        populates: ["course", "teachers"],
        filters: {
          ...(name && { name }),
          ...(courseId && { courseId }),
          ...(teacherId && { teacherId }),
          ...(status && { status }),
          ...(startDate && endDate && { startDate, endDate }),
        },
        pagination: {
          page,
          limit,
        },
      },
    };

    const url = `${BASE_URL}classManager/`;
    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    return {
      classes: response.data.data,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
    };
  } catch (error) {
    console.error(
      "Failed to fetch classes:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch classes");
  }
};

export const fetchTeachers = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}users/teachers`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch teachers:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch teachers");
  }
};

export const createClass = async (classData) => {
  try {
    const response = await axios.post(`${BASE_URL}create`, classData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.data;
  } catch (error) {
    console.error(
      "Failed to create class:",
      error.response?.data || error.message
    );
    throw new Error("Failed to create class");
  }
};

export const fetchStudents = async () => {
  // const response = await axios.get(`${BASE_URL}/students`);
  return [];
};

export const updateClass = async (updatedData) => {
  try {
    const query = {
      action: "updateClass",
      classId: updatedData._id,
      data: updatedData,
    };
    const response = await axios.put(`${BASE_URL}update/`, query, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    console.log("Update class response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Failed to update class:",
      error.response?.data || error.message
    );
    throw new Error("Failed to update class");
  }
};

export const getStudentRegister = async (courseId) => {
  return {};
};

// Add students to class
export const addStudentsToClass = async (students) => {
  try {
    const response = await axios.post(
      `${BASE_URL}addStudent`,
      { students },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Failed to add students to class:",
      error.response?.data || error.message
    );
    throw new Error("Failed to add students to class");
  }
};

// Get open classes by course ID
export const getOpenClassesByCourseId = async (courseId) => {
  try {
    const response = await axios.get(`${BASE_URL}open/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching open classes by course ID:", error);
    throw new Error("Failed to fetch open classes");
  }
};

export const addNewStudentToClass = async ({ classId, contactId }) => {
  try {
    const response = await axios.post(
      `${BASE_URL}addStudent`,
      { classId, contactId },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Failed to add new student to class:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to add new student to class"
    );
  }
};

export const completeCashPayment = async (paymentId) => {
  try {
    const response = await fetch(`/api/payments/${paymentId}/complete-cash`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to complete payment");
    return data;
  } catch (err) {
    throw err;
  }
};
