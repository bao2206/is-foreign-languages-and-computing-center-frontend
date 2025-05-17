import axios from "axios";

const BASE_URL = `http://localhost:8080/api/courses`;

export const fetchCourses = async () => {
  try {
    const response = await axios.post("http://localhost:8080/api/courses/get", {
      config: {
        action: "getAll",
      },
    });

    console.log(response.data);

    return response.data; // vì response có dạng { data: [...] }
  } catch (error) {
    console.error("Failed to fetch course data:", error);
    return [];
  }
};

export const fetchCourseById = async (courseId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${courseId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch course ${courseId}:`, error);
    return null;
  }
};

export const updateCourse = async (courseId, updatedCourse) => {
  try {
    console.log("upload", updatedCourse);
    const updatedData = {
      ...updatedCourse,
      status: updatedCourse.status
        ? updatedCourse.status.toLowerCase()
        : updatedCourse.status,
    };

    const body = {
      _id: courseId,
      data: updatedData,
    };

    const response = await fetch(`http://localhost:8080/api/courses/update/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Failed to update course");
    return await response.json();
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

export const createCourse = async (courseData) => {
  try {
    const response = await axios.post(`${BASE_URL}/create`, courseData);

    return response;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};
