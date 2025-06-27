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
import {
  fetchScheduleByClass,
  createSchedule,
  updateSchedule,
} from "../../services/ScheduleService";
import AddScheduleDialog from "./AddScheduleDialog";

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

  // Dialog lịch học
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [isAddScheduleDialogOpen, setIsAddScheduleDialogOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState("create"); // "create" | "auto"
  const [scheduleForm, setScheduleForm] = useState({
    teacher: "",
    room: "",
    date: "",
    startTime: "",
    endTime: "",
    status: "Scheduled",
    numberOfShift: "",
    startDate: "",
    scheduleDays: "",
  });
  const [scheduleErrors, setScheduleErrors] = useState({});
  const [selectedDays, setSelectedDays] = useState([]); // Các ngày được chọn (VD: ["2", "4"])

  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editScheduleForm, setEditScheduleForm] = useState({});
  const [editScheduleErrors, setEditScheduleErrors] = useState({});

  // Hàm mở dialog chỉnh sửa
  const handleOpenEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setEditScheduleForm({
      room: schedule.room || "",
      startTime: schedule.startTime || "",
      endTime: schedule.endTime || "",
      status: schedule.status || "",
    });
  };

  // Hàm đóng dialog
  const handleCloseEditSchedule = () => {
    setEditingSchedule(null);
    setEditScheduleForm({});
    setEditScheduleErrors({});
  };

  // Hàm xử lý thay đổi form
  const handleEditScheduleFormChange = (e) => {
    const { name, value } = e.target;
    setEditScheduleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setEditScheduleErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Hàm submit cập nhật lịch học
  const handleSubmitEditSchedule = async () => {
    // Validate nếu cần
    if (
      !editScheduleForm.room ||
      !editScheduleForm.startTime ||
      !editScheduleForm.endTime
    ) {
      setEditScheduleErrors({
        room: t("required"),
        startTime: t("required"),
        endTime: t("required"),
      });
      return;
    }
    try {
      await updateSchedule({
        action: "updateSchedule",
        scheduleId: editingSchedule._id,
        scheduleData: {
          room: editScheduleForm.room,
          teacher: editScheduleForm.teacher, // thêm dòng này để cập nhật giáo viên
          startTime: editScheduleForm.startTime,
          endTime: editScheduleForm.endTime,
          status: editScheduleForm.status,
        },
      });
      // Refresh lại danh sách lịch học
      fetchScheduleByClass(classItem._id).then(setSchedules);
      handleCloseEditSchedule();
    } catch (e) {
      console.log(e);

      alert(t("failedToUpdateSchedule"));
    }
  };

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

  // Fetch schedules khi mở dialog xem lịch học
  useEffect(() => {
    if (isScheduleDialogOpen && classItem._id) {
      console.log("Fetching schedules for class:", classItem);

      console.log("Fetching schedules for class:", classItem);

      fetchScheduleByClass(classItem._id).then(setSchedules);
    }
  }, [isScheduleDialogOpen, classItem._id]);

  const handleEditClassChange = (e) => {
    const { name, value } = e.target;
    setEditedClass((prev) => ({
      ...prev,
      [name]:
        name === "quantity"
          ? Number(value)
          : name === "date" || name === "dayend"
          ? value // keep as "YYYY-MM-DD" for now, convert to ISO string before sending to backend
          : value,
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

    // Validate daybegin và dayend
    if (!editedClass.daybegin) {
      newErrors.daybegin = t("required");
    }
    if (!editedClass.dayend) {
      newErrors.dayend = t("required");
    }
    if (
      editedClass.daybegin &&
      editedClass.dayend &&
      new Date(editedClass.dayend) < new Date(editedClass.daybegin)
    ) {
      newErrors.dayend = t(
        "dayendMustBeAfterDaybegin",
        "End date must be after start date"
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateEditForm()) {
      return;
    }

    try {
      console.log(editedClass);
      const data = {
        _id: classItem._id,
        classname: editedClass.classname,
        quantity: editedClass.quantity,
        daybegin: editedClass.daybegin,
        dayend: editedClass.dayend,
        status: editedClass.status,
      };

      const updatedClass = await updateClass(data);
      setClassItem(updatedClass);
      setIsEditDialogOpen(false);
      setErrors({});
    } catch (error) {
      console.log("error");

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

  // Lịch học
  const handleOpenScheduleDialog = () => {
    setIsScheduleDialogOpen(true);
  };

  const handleCloseScheduleDialog = () => {
    setIsScheduleDialogOpen(false);
    setSchedules([]);
  };

  // Thêm lịch học
  const handleOpenAddScheduleDialog = () => {
    setScheduleType("create");
    setScheduleForm({
      teacher: "",
      room: "",
      date: "",
      startTime: "",
      endTime: "",
      status: "Scheduled",
      numberOfShift: classItem.courseId?.numberOfShift || "",
      startDate: "",
      scheduleDays: "",
    });
    setScheduleErrors({});
    setSelectedDays([]); // Reset ngày chọn
    setIsAddScheduleDialogOpen(true);
  };

  const handleCloseAddScheduleDialog = () => {
    setIsAddScheduleDialogOpen(false);
    setScheduleErrors({});
  };

  const handleScheduleFormChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setScheduleErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDayCheckbox = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const validateScheduleForm = () => {
    const errs = {};
    if (scheduleType === "create") {
      if (!scheduleForm.date) errs.date = t("required");
      if (!scheduleForm.startTime) errs.startTime = t("required");
      if (!scheduleForm.endTime) errs.endTime = t("required");
      if (!scheduleForm.status) errs.status = t("required");
    } else {
      if (!scheduleForm.numberOfShift || isNaN(scheduleForm.numberOfShift))
        errs.numberOfShift = t("required");
      if (!scheduleForm.startDate) errs.startDate = t("required");
      if (!scheduleForm.startTime) errs.startTime = t("required");
      if (!scheduleForm.endTime) errs.endTime = t("required");
      if (selectedDays.length === 0)
        errs.scheduleDays = t("selectAtLeastOneDay");
    }
    setScheduleErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitSchedule = async () => {
    if (!validateScheduleForm()) return;
    try {
      if (scheduleType === "create") {
        const action = await createSchedule({
          action: "createSchedule",
          scheduleData: {
            classId: classItem._id,
            teacher: scheduleForm.teacher || undefined,
            room: scheduleForm.room || undefined,
            date: scheduleForm.date,
            startTime: scheduleForm.startTime,
            endTime: scheduleForm.endTime,
            status: scheduleForm.status,
          },
        });
      } else {
        await createSchedule({
          action: "autoCreateSchedule",
          scheduleData: {
            classId: classItem._id,
            teacher: scheduleForm.teacher || undefined,
            room: scheduleForm.room || undefined,
            numberOfShift: scheduleForm.numberOfShift,
            startDate: scheduleForm.startDate,
            startTime: scheduleForm.startTime,
            endTime: scheduleForm.endTime,
            scheduleDays: selectedDays.map((day) => parseInt(day, 10)), // Chuyển thành mảng số [2, 4]
          },
        });
      }
      fetchScheduleByClass(classItem._id).then(setSchedules);
      setIsAddScheduleDialogOpen(false);
    } catch (e) {
      alert(t("failedToCreateSchedule"));
    }
  };

  return (
    <div className="card h-100">
      <div className="card-body">
        <h5 className="card-title">{classItem.classname}</h5>
        <div className="card-text">
          <p>
            <strong>{t("course")}:</strong>{" "}
            {classItem.courseId?.coursename || t("N/A")}
          </p>
          <p>
            <strong>{t("quantity")}:</strong> {classItem.quantity}
          </p>
          <p>
            <strong>{t("status")}:</strong> {t(classItem.status)}
          </p>
          {classItem.teachers?.length > 0 && (
            <p>
              <strong>{t("teacher")}:</strong>{" "}
              {classItem.teachers.map((t) => t.name).join(", ")}
            </p>
          )}
          <p>
            {t("dayend")}:{" "}
            {classItem.dayend
              ? new Date(classItem.dayend).toLocaleDateString()
              : t("N/A")}
          </p>
        </div>
        <div className="d-flex gap-2 mt-3">
          <Button
            className="btn btn-primary"
            onClick={() => {
              setEditedClass({ ...classItem });
              setIsEditDialogOpen(true);
            }}
          >
            {t("edit")}
          </Button>
          <Button
            className="btn btn-outline-primary"
            onClick={() => setIsViewDialogOpen(true)}
          >
            {t("view")}
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
              <p>
                {t("dayend")}:{" "}
                {classItem.dayend
                  ? new Date(classItem.dayend).toLocaleDateString()
                  : t("N/A")}
              </p>
            </div>
            <div className="modal-footer">
              <Button
                className="btn btn-outline-success"
                onClick={() => {
                  setAddType("student");
                  setIsAddDialogOpen(true);
                }}
              >
                {t("viewStudents")}
              </Button>
              <Button
                className="btn btn-outline-info"
                onClick={handleOpenScheduleDialog}
              >
                {t("viewSchedule")}
              </Button>
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

      {/* Dialog Lịch học */}
      <Dialog
        open={isScheduleDialogOpen}
        onClose={handleCloseScheduleDialog}
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Dialog.Panel className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("scheduleList")}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseScheduleDialog}
              ></button>
            </div>
            <div className="modal-body">
              {schedules.length === 0 ? (
                <div className="text-muted">
                  {t("noSchedule") || "Chưa có lịch học"}
                </div>
              ) : (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>{t("dateBegin")}</th>
                      <th>{t("startTime")}</th>
                      <th>{t("endTime")}</th>
                      <th>{t("teacher")}</th>
                      <th>{t("room")}</th>
                      <th>{t("status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((sch) => (
                      <tr key={sch._id}>
                        <td>
                          {sch.date
                            ? new Date(sch.date).toLocaleDateString()
                            : ""}
                        </td>
                        <td>{sch.startTime}</td>
                        <td>{sch.endTime}</td>
                        <td>{sch.teacher?.name || ""}</td>
                        <td>{sch.room || ""}</td>
                        <td>{t(sch.status) || sch.status}</td>
                        <td>
                          <Button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleOpenEditSchedule(sch)}
                          >
                            {t("edit")}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <Button
                className="btn btn-outline-success"
                onClick={handleOpenAddScheduleDialog}
              >
                {t("addSchedule")}
              </Button>
              <Button
                className="btn btn-secondary"
                onClick={handleCloseScheduleDialog}
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Dialog Thêm lịch học */}
      <AddScheduleDialog
        open={isAddScheduleDialogOpen}
        onClose={handleCloseAddScheduleDialog}
        t={t}
        scheduleType={scheduleType}
        setScheduleType={setScheduleType}
        scheduleForm={scheduleForm}
        handleScheduleFormChange={handleScheduleFormChange}
        classItem={classItem}
        scheduleErrors={scheduleErrors}
        handleSubmitSchedule={handleSubmitSchedule}
        handleCloseAddScheduleDialog={handleCloseAddScheduleDialog}
        selectedDays={selectedDays}
        handleDayCheckbox={handleDayCheckbox}
      />
      {/* Dialog chỉnh sửa lịch học */}
      <Dialog
        open={!!editingSchedule}
        onClose={handleCloseEditSchedule}
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Dialog.Panel className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("editSchedule")}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseEditSchedule}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">{t("room")}</label>
                <input
                  type="text"
                  name="room"
                  value={editScheduleForm.room}
                  onChange={handleEditScheduleFormChange}
                  className={`form-control ${
                    editScheduleErrors.room ? "is-invalid" : ""
                  }`}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">{t("teacher")}</label>
                <select
                  name="teacher"
                  value={
                    editScheduleForm.teacher ||
                    editingSchedule?.teacher?._id ||
                    ""
                  }
                  onChange={handleEditScheduleFormChange}
                  className="form-select"
                >
                  <option value="">{t("chooseTeacher")}</option>
                  {classItem.teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">{t("startTime")}</label>
                <input
                  type="time"
                  name="startTime"
                  value={editScheduleForm.startTime}
                  onChange={handleEditScheduleFormChange}
                  className={`form-control ${
                    editScheduleErrors.startTime ? "is-invalid" : ""
                  }`}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">{t("endTime")}</label>
                <input
                  type="time"
                  name="endTime"
                  value={editScheduleForm.endTime}
                  onChange={handleEditScheduleFormChange}
                  className={`form-control ${
                    editScheduleErrors.endTime ? "is-invalid" : ""
                  }`}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">{t("status")}</label>
                <select
                  name="status"
                  value={editScheduleForm.status}
                  onChange={handleEditScheduleFormChange}
                  className="form-select"
                >
                  <option value="Scheduled">{t("Scheduled")}</option>
                  <option value="Completed">{t("Completed")}</option>
                  <option value="Cancelled">{t("Cancelled")}</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <Button
                className="btn btn-primary"
                onClick={handleSubmitEditSchedule}
              >
                {t("save")}
              </Button>
              <Button
                className="btn btn-secondary"
                onClick={handleCloseEditSchedule}
              >
                {t("cancel")}
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
                  <div className="mb-3">
                    <label className="form-label">{t("daybegin")}</label>
                    <input
                      type="date"
                      name="daybegin"
                      value={
                        editedClass.daybegin
                          ? new Date(editedClass.daybegin)
                              .toISOString()
                              .slice(0, 10)
                          : ""
                      }
                      onChange={handleEditClassChange}
                      className={`form-control ${
                        errors.daybegin ? "is-invalid" : ""
                      }`}
                      style={{ height: "38px" }}
                    />
                    {errors.daybegin && (
                      <div className="invalid-feedback">{errors.daybegin}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t("dayend")}</label>
                    <input
                      type="date"
                      name="dayend"
                      value={
                        editedClass.dayend
                          ? new Date(editedClass.dayend)
                              .toISOString()
                              .slice(0, 10)
                          : ""
                      }
                      onChange={handleEditClassChange}
                      className={`form-control ${
                        errors.dayend ? "is-invalid" : ""
                      }`}
                      style={{ height: "38px" }}
                    />
                    {errors.dayend && (
                      <div className="invalid-feedback">{errors.dayend}</div>
                    )}
                  </div>
                  {/* Add Student and Add Teacher buttons moved here */}
                  <div className="d-flex gap-2 mb-3"></div>
                </>
              )}
            </div>
            <div className="modal-footer">
              {/* <Button
                className="btn btn-outline-success"
                onClick={() => {
                  setAddType("student");
                  setIsAddDialogOpen(true);
                }}
              >
                {t("addStudent")}
              </Button> */}
              <Button
                className="btn btn-outline-info"
                onClick={() => {
                  setAddType("teacher");
                  setIsAddDialogOpen(true);
                }}
              >
                {t("addTeacher")}
              </Button>
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
                  ? t("viewStudents")
                  : addType === "teacher"
                  ? t("addTeacher")
                  : ""}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setIsAddDialogOpen(false);
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
                      maxHeight: "240px",
                      overflowY: "auto",
                      border: "1px solid #eee",
                      borderRadius: "4px",
                      padding: "8px",
                    }}
                  >
                    {classItem.students.length === 0 ? (
                      <div className="text-muted">{t("noStudentsInClass")}</div>
                    ) : (
                      classItem.students.map((student) => (
                        <div key={student._id} className="mb-2">
                          <span>
                            {" "}
                            {student.student?.name ||
                              `${student._id} - No account`}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
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
