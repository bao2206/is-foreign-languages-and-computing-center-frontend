import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../Button";
import { useTranslation } from "react-i18next";
import {
  updateClass,
  fetchTeachers,
  fetchStudents,
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
  const [allTeachers, setAllTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  // Regex cho tên lớp
  const classNameRegex = /^[\w\s&-]+$/;

  // Load danh sách giáo viên và học sinh
  useEffect(() => {
    const loadData = async () => {
      try {
        const teachersData = await fetchTeachers();
        setAllTeachers(teachersData || []);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
      try {
        const studentsData = await fetchStudents();
        setAllStudents(studentsData || []);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    console.log("ClassItem props:", props.classItem);
    if (props.classItem) {
      setClassItem(props.classItem);
    } else {
      console.error("ClassItem props.classItem is undefined");
    }
  }, [props.classItem]);

  const handleEditClassChange = (e) => {
    const { name, value } = e.target;
    setEditedClass((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTeacherChange = (e) => {
    const selectedTeacherIds = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    const selectedTeachers = allTeachers.filter((teacher) =>
      selectedTeacherIds.includes(teacher._id)
    );
    setEditedClass((prev) => ({
      ...prev,
      teachers: selectedTeachers,
    }));
  };

  const handleStudentChange = (e) => {
    const selectedStudentIds = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    const selectedStudents = allStudents.filter((student) =>
      selectedStudentIds.includes(student._id)
    );
    setEditedClass((prev) => ({
      ...prev,
      students: selectedStudents,
    }));
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
      const updatedClass = await updateClass(classItem._id, editedClass);
      setClassItem(updatedClass);
      setIsEditDialogOpen(false);
      setErrors({});
    } catch (error) {
      alert(t("failedToUpdateClass"));
    }
  };

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
              <div className="mb-3">
                <label className="form-label">{t("className")}</label>
                <input
                  type="text"
                  name="classname"
                  value={editedClass?.classname || ""}
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
                <label className="form-label">{t("teachers")}</label>
                <select
                  multiple
                  value={editedClass?.teachers?.map((t) => t._id) || []}
                  onChange={handleTeacherChange}
                  className="form-select"
                  style={{ height: "100px" }}
                >
                  {allTeachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">{t("students")}</label>
                <select
                  multiple
                  value={editedClass?.students?.map((s) => s._id) || []}
                  onChange={handleStudentChange}
                  className="form-select"
                  style={{ height: "100px" }}
                >
                  {allStudents.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">{t("quantity")}</label>
                <input
                  type="number"
                  name="quantity"
                  value={editedClass?.quantity || 0}
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
                  value={editedClass?.status || ""}
                  onChange={handleEditClassChange}
                  className="form-select"
                  style={{ height: "38px" }}
                >
                  <option value="Incomplete">{t("Incomplete")}</option>
                  <option value="Active">{t("Active")}</option>
                  <option value="Completed">{t("Completed")}</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <Button className="btn btn-primary" onClick={handleSaveEdit}>
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
    </div>
  );
};

export default ClassItem;
