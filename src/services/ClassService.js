import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}classes/`;

// Lấy danh sách lớp theo giáo viên
async function getClassForTeacher(query = {}) {
  const id = localStorage.getItem("userId");

  if (!id) {
    throw new Error("Teacher ID is required");
  }
  const payload = {
    id: id,
    query: query,
  };

  const response = await axios.post(`${BASE_URL}getClassForTeacher/`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch classes for teacher");
  }
  return response.data.data;
}

// Lấy danh sách lớp theo học sinh
async function getClassForStudent(query = {}) {
  const id = localStorage.getItem("userId");
  if (!id) {
    throw new Error("Teacher ID is required");
  }
  const payload = {
    id: id,
    query: query,
  };

  const response = await axios.post(`${BASE_URL}getClassForStudent/`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch classes for teacher");
  }
  return response.data.data;
}

const fetchClassById = async (classId) => {
  try {
    const payload = {
      action: "getByClassesId",
      classId,
      populates: ["students", "teachers", "course"],
    };
    const url = `${BASE_URL}classManager/`;
    const response = await axios.post(
      url,
      { query: payload },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    // Nếu backend trả về object, trả về luôn, nếu trả về mảng thì lấy phần tử đầu
    return Array.isArray(response.data) ? response.data[0] : response.data;
  } catch (error) {
    throw new Error("Failed to fetch class by id");
  }
};

export { getClassForTeacher, getClassForStudent, fetchClassById };
