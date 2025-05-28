import axios from "axios";

const BASE_URL =
  `${process.env.REACT_APP_API_BASE_URL}classes/` ||
  "http://localhost:8080/api/";

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
    console.log("Fetching classes with payload:", payload);

    const url = `${BASE_URL}classManager`;
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
    console.log("Fetch teachers response:", response.data);
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
    console.log("Creating class with data:", classData);

    const response = await axios.post(`${BASE_URL}create`, classData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("Create class response:", response.data);
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
  const response = await axios.get(`${BASE_URL}/students`);
  return response.data;
};

export const updateClass = async (classId, updatedData) => {};
