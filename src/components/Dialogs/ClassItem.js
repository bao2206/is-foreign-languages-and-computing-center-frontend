import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../Button";
import { useTranslation } from "react-i18next";
import {
  updateClass,
  fetchTeachers,
  fetchStudents,
  getStudentRegister,
} from "../../services/ClassManagementService";

const ClassItem = (props) => {
  const { t } = useTranslation();
  const [classItem, setClassItem] = useState({
    _id: "",
    classname: "",
    courseId: {},
    teachers: [],
    students: [],
    quantity: 0,
    status: "",
    createdAt: "",
  });
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedClass, setEditedClass] = useState(null);
  const [errors, setErrors] = useState({});

  // Dialog chọn thêm giáo viên/học viên
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [addType, setAddType] = useState(""); // "student" hoặc "teacher"

  // Regex cho tên lớp
  const classNameRegex = /^[\w\s&-]+$/;

  useEffect(() => {
    if (props.classItem) {
      setClassItem(props.classItem);
    }
  }, [props.classItem]);

  // Fetch all teachers and students khi mở dialog thêm
  useEffect(() => {
    if (isAddDialogOpen) {
      if (addType === "teacher") fetchTeachers().then(setAllTeachers);
      if (addType === "student") fetchStudents().then(setAllStudents);
    }
  }, [isAddDialogOpen, addType]);

  const handleEditClassChange = (e) => {
    const { name, value } = e.target;
    setEditedClass((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateEditForm = () => {
    const newErrors = {};
    if (
      !editedClass.classname.trim() ||
      !classNameRegex.test(editedClass.classname)
    )
      newErrors.classname = t("invalidClassName");
    if (editedClass.quantity < 0 || isNaN(editedClass.quantity))
      newErrors.quantity = t("invalidQuantity");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateEditForm()) {
      return;
    }

    try {
      const updatedClass = await updateClass(editedClass);
      setClassItem(updatedClass);
      setIsEditDialogOpen(false);
      setErrors({});
    } catch (error) {
      alert(t("failedToUpdateClass"));
    }
  };

  // Thêm nhiều học viên vào lớp
  const handleAddStudents = async () => {
    if (!selectedStudents.length) return;
    const newStudents = allStudents.filter((s) =>
      selectedStudents.includes(s._id)
    );
    const updated = {
      ...classItem,
      students: [...classItem.students, ...newStudents],
      quantity: classItem.quantity + newStudents.length,
    };
    try {
      const updatedClass = await updateClass(updated);
      setClassItem(updatedClass);
      setIsAddDialogOpen(false);
      setSelectedStudents([]);
      setSelectedTeachers([]);
      setAddType("");
    } catch (error) {
      alert(t("failedToUpdateClass"));
    }
  };

  // Thêm nhiều giáo viên vào lớp
  const handleAddTeachers = async () => {
    if (!selectedTeachers.length) return;
    const newTeachers = allTeachers.filter((t) =>
      selectedTeachers.includes(t._id)
    );
    const updated = {
      ...classItem,
      teachers: [...classItem.teachers, ...newTeachers],
    };
    try {
      const updatedClass = await updateClass(updated);
      setClassItem(updatedClass);
      setIsAddDialogOpen(false);
      setSelectedStudents([]);
      setSelectedTeachers([]);
      setAddType("");
    } catch (error) {
      alert(t("failedToUpdateClass"));
    }
  };

  // Lọc học viên chưa có trong lớp
  const availableStudents = allStudents.filter(
    (s) => !classItem.students.some((cs) => cs._id === s._id)
  );

  // Giáo viên: hiện tất cả giáo viên, nhưng nếu đã có trong lớp thì checkbox đã tick và disabled
  const teachersWithStatus = allTeachers.map((teacher) => {
    const isInClass = classItem.teachers.some((ct) => ct._id === teacher._id);
    return {
      ...teacher,
      isInClass,
    };
  });

  // Xử lý chọn nhiều học viên/giáo viên
  const handleStudentCheckbox = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleTeacherCheckbox = (id) => {
    setSelectedTeachers((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  // Số lượng giáo viên/học viên hiện tại
  const teacherCount = classItem.teachers?.length || 0;
  const studentCount = classItem.students?.length || 0;

  return (
    <div key={classItem._id} className="col-12 col-md-6 col-lg-3 mb-4">
      <div className="border border-gray-300 rounded-xl p-4 shadow">
        <h2 className="text-lg font-semibold text-center">
          {classItem.classname}
        </h2>
        <p>
          {t("course")}: {classItem.courseId?.coursename || t("N/A")}
        </p>
        <p>
          {t("teachers")}:{" "}
          {classItem.teachers?.map((t) => t.name).join(", ") || t("N/A")}
        </p>
        <p>
          {t("students")}:{" "}
          {studentCount > 0
            ? `${studentCount} ${t("students")}`
            : t("noAvailableStudents")}
        </p>
        <p>
          {t("quantity")}: {classItem.quantity}
        </p>
        <p>
          {t("status")}: {t(classItem.status)}
        </p>
        <p>
          {t("createdAt")}: {new Date(classItem.createdAt).toLocaleDateString()}
        </p>
        <div className="d-flex justify-content-end mt-2 gap-2">
          <Button
            className="btn btn-outline-primary"
            onClick={() => setIsViewDialogOpen(true)}
          >
            {t("seeMore")}
          </Button>
          <Button
            className="btn btn-outline-secondary"
            onClick={() => {
              setEditedClass({ ...classItem });
              setIsEditDialogOpen(true);
            }}
          >
            {t("edit")}
          </Button>
          <Button
            className="btn btn-outline-success"
            onClick={() => {
              setAddType("student");
              setIsAddDialogOpen(true);
            }}
          >
            {t("addStudent")}
          </Button>
          <Button
            className="btn btn-outline-info"
            onClick={() => {
              setAddType("teacher");
              setIsAddDialogOpen(true);
            }}
          >
            {t("addTeacher")}
          </Button>
        </div>
      </div>

      {/* Dialog Xem thêm */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Dialog.Panel className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("classDetails")}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsViewDialogOpen(false)}
              ></button>
            </div>
            <div className="modal-body">
              <h2 className="text-lg font-semibold text-center">
                {classItem.classname}
              </h2>
              <p>
                {t("course")}: {classItem.courseId?.coursename || t("N/A")}
              </p>
              <p>
                {t("teachers")}:{" "}
                {classItem.teachers?.map((t) => t.name).join(", ") || t("N/A")}
              </p>
              <p>
                {t("students")}:{" "}
                {classItem.students?.map((s) => s.name).join(", ") || t("N/A")}
              </p>
              <p>
                {t("quantity")}: {classItem.quantity}
              </p>
              <p>
                {t("status")}: {t(classItem.status)}
              </p>
              <p>
                {t("createdAt")}:{" "}
                {new Date(classItem.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="modal-footer">
              <Button
                className="btn btn-secondary"
                onClick={() => setIsViewDialogOpen(false)}
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Dialog Chỉnh sửa */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setErrors({});
        }}
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Dialog.Panel className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("editClass")}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setErrors({});
                }}
              ></button>
            </div>
            <div className="modal-body">
              {editedClass && (
                <>
                  <div className="mb-3">
                    <label className="form-label">{t("className")}</label>
                    <input
                      type="text"
                      name="classname"
                      value={editedClass.classname || ""}
                      onChange={handleEditClassChange}
                      className={`form-control ${
                        errors.classname ? "is-invalid" : ""
                      }`}
                      style={{ height: "38px" }}
                    />
                    {errors.classname && (
                      <div className="invalid-feedback">{errors.classname}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t("quantity")}</label>
                    <input
                      type="number"
                      name="quantity"
                      value={editedClass.quantity || 0}
                      onChange={handleEditClassChange}
                      min="0"
                      className={`form-control ${
                        errors.quantity ? "is-invalid" : ""
                      }`}
                      style={{ height: "38px" }}
                    />
                    {errors.quantity && (
                      <div className="invalid-feedback">{errors.quantity}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t("status")}</label>
                    <select
                      name="status"
                      value={editedClass.status || ""}
                      onChange={handleEditClassChange}
                      className="form-select"
                      style={{ height: "38px" }}
                    >
                      <option value="Incomplete">{t("Incomplete")}</option>
                      <option value="Active">{t("Active")}</option>
                      <option value="Completed">{t("Completed")}</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <Button
                className="btn btn-primary"
                onClick={handleSaveEdit}
                disabled={!editedClass}
              >
                {t("save")}
              </Button>
              <Button
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setErrors({});
                }}
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Dialog Thêm học viên hoặc giáo viên */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setSelectedStudents([]);
          setSelectedTeachers([]);
          setAddType("");
        }}
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Dialog.Panel className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {addType === "student"
                  ? t("addStudent")
                  : addType === "teacher"
                  ? t("addTeacher")
                  : ""}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setSelectedStudents([]);
                  setSelectedTeachers([]);
                  setAddType("");
                }}
              ></button>
            </div>
            <div className="modal-body">
              {addType === "student" && (
                <>
                  <div
                    style={{
                      maxHeight: "180px",
                      overflowY: "auto",
                      border: "1px solid #eee",
                      borderRadius: "4px",
                      padding: "8px",
                    }}
                  >
                    {availableStudents.length === 0 ? (
                      <div className="text-muted">
                        {t("noAvailableStudents")}
                      </div>
                    ) : (
                      availableStudents.map((student) => (
                        <div key={student._id} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`student-${student._id}`}
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => handleStudentCheckbox(student._id)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`student-${student._id}`}
                          >
                            {student.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <Button
                    className="btn btn-success mt-2"
                    onClick={handleAddStudents}
                    disabled={selectedStudents.length === 0}
                  >
                    {t("addStudent")}
                  </Button>
                </>
              )}
              {addType === "teacher" && (
                <>
                  <div
                    style={{
                      maxHeight: "180px",
                      overflowY: "auto",
                      border: "1px solid #eee",
                      borderRadius: "4px",
                      padding: "8px",
                    }}
                  >
                    {teachersWithStatus.length === 0 ? (
                      <div className="text-muted">
                        {t("noAvailableTeachers")}
                      </div>
                    ) : (
                      teachersWithStatus.map((teacher) => (
                        <div key={teacher._id} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`teacher-${teacher._id}`}
                            checked={
                              teacher.isInClass ||
                              selectedTeachers.includes(teacher._id)
                            }
                            disabled={teacher.isInClass}
                            onChange={() =>
                              !teacher.isInClass &&
                              handleTeacherCheckbox(teacher._id)
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`teacher-${teacher._id}`}
                            style={teacher.isInClass ? { color: "#888" } : {}}
                          >
                            {teacher.name}
                            {teacher.isInClass && (
                              <span className="ms-2 badge bg-secondary">
                                {t("alreadyAdded")}
                              </span>
                            )}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <Button
                    className="btn btn-info mt-2"
                    onClick={handleAddTeachers}
                    disabled={selectedTeachers.length === 0}
                  >
                    {t("addTeacher")}
                  </Button>
                </>
              )}
            </div>
            <div className="modal-footer">
              <Button
                className="btn btn-secondary"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setSelectedStudents([]);
                  setSelectedTeachers([]);
                  setAddType("");
                }}
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

export default ClassItem;
