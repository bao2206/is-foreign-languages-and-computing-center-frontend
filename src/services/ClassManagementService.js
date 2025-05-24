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
    console.log("Fetching classes with parameters:", {
      name,
      courseId,
      teacherId,
      status,
      startDate,
      endDate,
      page,
      limit,
    });

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
    console.log("Payload for fetching classes:", payload);
    const url = `${BASE_URL}classManager`;
    console.log("Fetch classes payload:", payload);
    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    console.log("Classes fetched successfully:", response.data);

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

export const fetchCourses = async () => {
  try {
    const response = await axios.get(`${BASE_URL}courses`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("Fetch courses response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error(
      "Failed to fetch courses:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch courses");
  }
};

export const fetchTeachers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}users?role=teacher`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("Fetch teachers response:", response.data);
    return response.data.data;
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
    const response = await axios.post(`${BASE_URL}classes`, classData, {
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
