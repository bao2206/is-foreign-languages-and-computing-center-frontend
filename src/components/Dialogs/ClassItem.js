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
} from "../../services/ScheduleService";

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

      fetchScheduleByClass(classItem._id).then(setSchedules);
    }
  }, [isScheduleDialogOpen, classItem._id]);

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
      <Dialog
        open={isAddScheduleDialogOpen}
        onClose={handleCloseAddScheduleDialog}
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Dialog.Panel className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("addSchedule")}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseAddScheduleDialog}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">{t("scheduleType")}</label>
                <select
                  className="form-select"
                  value={scheduleType}
                  onChange={(e) => setScheduleType(e.target.value)}
                >
                  <option value="create">{t("manualCreate")}</option>
                  <option value="auto">{t("autoCreate")}</option>
                </select>
              </div>
              {scheduleType === "create" ? (
                <>
                  <div className="mb-3">
                    <label className="form-label">{t("teacher")}</label>
                    <select
                      className="form-select"
                      name="teacher"
                      value={scheduleForm.teacher}
                      onChange={handleScheduleFormChange}
                    >
                      <option value=""></option>
                      {classItem.teachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t("room") || "Phòng"}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="room"
                      value={scheduleForm.room}
                      onChange={handleScheduleFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t("date") || "Ngày"}</label>
                    <input
                      type="date"
                      className={`form-control ${
                        scheduleErrors.date ? "is-invalid" : ""
                      }`}
                      name="date"
                      value={scheduleForm.date}
                      onChange={handleScheduleFormChange}
                    />
                    {scheduleErrors.date && (
                      <div className="invalid-feedback">
                        {scheduleErrors.date}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {t("startTime") || "Giờ bắt đầu"}
                    </label>
                    <input
                      type="time"
                      className={`form-control ${
                        scheduleErrors.startTime ? "is-invalid" : ""
                      }`}
                      name="startTime"
                      value={scheduleForm.startTime}
                      onChange={handleScheduleFormChange}
                    />
                    {scheduleErrors.startTime && (
                      <div className="invalid-feedback">
                        {scheduleErrors.startTime}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {t("endTime") || "Giờ kết thúc"}
                    </label>
                    <input
                      type="time"
                      className={`form-control ${
                        scheduleErrors.endTime ? "is-invalid" : ""
                      }`}
                      name="endTime"
                      value={scheduleForm.endTime}
                      onChange={handleScheduleFormChange}
                    />
                    {scheduleErrors.endTime && (
                      <div className="invalid-feedback">
                        {scheduleErrors.endTime}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {t("status") || "Trạng thái"}
                    </label>
                    <select
                      className={`form-select ${
                        scheduleErrors.status ? "is-invalid" : ""
                      }`}
                      name="status"
                      value={scheduleForm.status}
                      onChange={handleScheduleFormChange}
                    >
                      <option value="Scheduled">
                        {t("Scheduled") || "Đã lên lịch"}
                      </option>
                      <option value="Cancel">{t("Cancel") || "Hủy"}</option>
                      <option value="make up lesson">
                        {t("makeUpLesson") || "Bù"}
                      </option>
                    </select>
                    {scheduleErrors.status && (
                      <div className="invalid-feedback">
                        {scheduleErrors.status}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label">
                      {t("teacher") || "Giáo viên"}
                    </label>
                    <select
                      className="form-select"
                      name="teacher"
                      value={scheduleForm.teacher}
                      onChange={handleScheduleFormChange}
                    >
                      <option value="">{t("optional") || "Không chọn"}</option>
                      {classItem.teachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t("room") || "Phòng"}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="room"
                      value={scheduleForm.room}
                      onChange={handleScheduleFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {t("numberOfShifts") || "Số buổi"}
                    </label>
                    <input
                      type="number"
                      className={`form-control ${
                        scheduleErrors.numberOfShift ? "is-invalid" : ""
                      }`}
                      name="numberOfShift"
                      value={scheduleForm.numberOfShift}
                      onChange={handleScheduleFormChange}
                      min="1"
                    />
                    {scheduleErrors.numberOfShift && (
                      <div className="invalid-feedback">
                        {scheduleErrors.numberOfShift}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {t("startDate") || "Ngày bắt đầu"}
                    </label>
                    <input
                      type="date"
                      className={`form-control ${
                        scheduleErrors.startDate ? "is-invalid" : ""
                      }`}
                      name="startDate"
                      value={scheduleForm.startDate}
                      onChange={handleScheduleFormChange}
                    />
                    {scheduleErrors.startDate && (
                      <div className="invalid-feedback">
                        {scheduleErrors.startDate}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {t("startTime") || "Giờ bắt đầu"}
                    </label>
                    <input
                      type="time"
                      className={`form-control ${
                        scheduleErrors.startTime ? "is-invalid" : ""
                      }`}
                      name="startTime"
                      value={scheduleForm.startTime}
                      onChange={handleScheduleFormChange}
                    />
                    {scheduleErrors.startTime && (
                      <div className="invalid-feedback">
                        {scheduleErrors.startTime}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {t("endTime") || "Giờ kết thúc"}
                    </label>
                    <input
                      type="time"
                      className={`form-control ${
                        scheduleErrors.endTime ? "is-invalid" : ""
                      }`}
                      name="endTime"
                      value={scheduleForm.endTime}
                      onChange={handleScheduleFormChange}
                    />
                    {scheduleErrors.endTime && (
                      <div className="invalid-feedback">
                        {scheduleErrors.endTime}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {t("scheduleDays") || "Chọn ngày trong tuần"}
                    </label>
                    <div
                      style={{
                        maxHeight: "120px",
                        overflowY: "auto",
                        border: "1px solid #eee",
                        borderRadius: "4px",
                        padding: "8px",
                      }}
                    >
                      {["1", "2", "3", "4", "5", "6", "7"].map((day) => (
                        <div key={day} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`day-${day}`}
                            checked={selectedDays.includes(day)}
                            onChange={() => handleDayCheckbox(day)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`day-${day}`}
                          >
                            {t(`day${day}`) || `Thứ ${parseInt(day) - 1}`}
                          </label>
                        </div>
                      ))}
                    </div>
                    {scheduleErrors.scheduleDays && (
                      <div className="invalid-feedback">
                        {scheduleErrors.scheduleDays}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <Button
                className="btn btn-primary"
                onClick={handleSubmitSchedule}
              >
                {t("save") || "Lưu"}
              </Button>
              <Button
                className="btn btn-secondary"
                onClick={handleCloseAddScheduleDialog}
              >
                {t("cancel") || "Hủy"}
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
