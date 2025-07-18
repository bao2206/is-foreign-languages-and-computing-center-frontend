import React, { use, useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../../components/Button";
import { useTranslation } from "react-i18next";
import {
  fetchClasses,
  createClass,
  fetchTeachers,
} from "../../services/ClassManagementService";
import "bootstrap/dist/css/bootstrap.css";
import { Search } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ClassItem from "../../components/Dialogs/ClassItem";
import { fetchCourses } from "../../services/ManagementCourse";
import OpenClassesList from "../../components/OpenClassesList";

// Regex cho tên lớp
const classNameRegex = /^[\w\s&-]+$/;

// Custom styles for better card appearance
const cardStyles = `
  .class-card {
    transition: all 0.3s ease;
    border-radius: 12px;
  }
  
  .class-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
  }
  
  .class-card .card-body {
    padding: 1.25rem;
  }
  
  .class-card .badge {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
  
  .class-card .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .class-card .text-truncate {
    max-width: 100%;
  }
  
  .filter-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .empty-state {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    padding: 3rem 1rem;
  }
  
  .empty-state i {
    color: #6c757d;
    opacity: 0.6;
  }
`;

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    classname: "",
    courseId: "",
    quantity: 0,
    status: "Incomplete",
  });
  const [errors, setErrors] = useState({});
  const [isViewStudentDialogOpen, setIsViewStudentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Load courses và teachers
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const coursesData = await fetchCourses();
        // Ensure courses is always an array
        if (coursesData && coursesData.data) {
          setCourses(coursesData.data);
        } else if (Array.isArray(coursesData)) {
          setCourses(coursesData);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error("Error loading courses:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setCourses([]); // Set empty array on error
      }
      try {
        const teachersData = await fetchTeachers();

        // Ensure teachers is always an array
        if (Array.isArray(teachersData)) {
          setTeachers(teachersData);
        } else {
          setTeachers([]);
        }
      } catch (error) {
        console.error("Error loading teachers:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setTeachers([]); // Set empty array on error
      }
    };
    loadStaticData();
  }, []);

  // Load classes
  useEffect(() => {
    const loadData = async () => {
      try {
        const params = {
          name: searchTerm.trim() || undefined,
          courseId: courseFilter !== "all" ? courseFilter : undefined,
          teacherId: teacherFilter !== "all" ? teacherFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          startDate: startDate && endDate ? startDate.toISOString() : undefined,
          endDate: startDate && endDate ? endDate.toISOString() : undefined,
          page,
          limit,
        };
        const { classes, total, currentPage, totalPages } = await fetchClasses(
          params
        );
        console.log("============", classes);

        setClasses(classes);
        setFilteredClasses(classes);
        setTotal(total);
        setTotalPages(totalPages);
        setPage(currentPage);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    loadData();
  }, [
    searchTerm,
    courseFilter,
    teacherFilter,
    statusFilter,
    startDate,
    endDate,
    page,
    limit,
  ]);

  const validateForm = () => {
    const newErrors = {};
    if (!newClass.classname.trim() || !classNameRegex.test(newClass.classname))
      newErrors.classname = t("invalidClassName");
    if (!newClass.courseId) newErrors.courseId = t("courseRequired");
    if (newClass.quantity < 0 || isNaN(newClass.quantity))
      newErrors.quantity = t("invalidQuantity");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddClass = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const createdClass = await createClass(newClass);
      setClasses((prev) => [...prev, createdClass]);
      setIsAddDialogOpen(false);
      setNewClass({
        classname: "",
        courseId: "",
        quantity: 0,
        status: "Incomplete",
      });
      setErrors({});
    } catch (error) {
      alert(t("failedToCreateClass"));
    }
  };

  const handleNewClassChange = (e) => {
    const { name, value } = e.target;
    setNewClass((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePageInputChange = (e) => {
    const value = Number(e.target.value);
    if (value >= 1 && value <= totalPages) {
      setPage(value);
    }
  };

  const handleDateChange = (date) => {
    setNewClass((prev) => ({
      ...prev,
      date: date,
    }));
  };

  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student);
    setIsViewStudentDialogOpen(true);
  };

  return (
    <div className="container-fluid mt-4 px-3">
      {/* Inject custom styles */}
      <style>{cardStyles}</style>

      {/* Thanh tìm kiếm và lọc */}
      <div className="filter-section">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {/* Tìm kiếm */}
          <div style={{ minWidth: 220, flex: 1 }}>
            <div className="position-relative">
              <Search
                className="position-absolute"
                style={{
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6c757d",
                }}
                size={18}
              />
              <input
                type="text"
                placeholder={t("searchClass")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control ps-5"
                style={{ height: "38px" }}
              />
            </div>
          </div>
          {/* Khóa học */}
          <div style={{ minWidth: 160 }}>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="form-select"
              style={{ height: "38px" }}
            >
              <option value="all">{t("allCourses")}</option>
              {courses &&
                courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.coursename}
                  </option>
                ))}
            </select>
          </div>
          {/* Giáo viên */}
          <div style={{ minWidth: 160 }}>
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="form-select"
              style={{ height: "38px" }}
            >
              <option value="all">{t("allTeachers")}</option>
              {teachers &&
                teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
            </select>
          </div>
          {/* Trạng thái */}
          <div style={{ minWidth: 140 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ height: "38px" }}
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="Incomplete">{t("Incomplete")}</option>
              <option value="Active">{t("Active")}</option>
              <option value="Completed">{t("Completed")}</option>
            </select>
          </div>
          {/* Khoảng ngày */}
          <div style={{ minWidth: 180 }}>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              placeholderText={t("selectDateRange")}
              className="form-control"
              style={{ height: "38px" }}
              isClearable
            />
          </div>
          {/* Phân trang nhanh */}
          <div style={{ minWidth: 90 }}>
            <input
              type="number"
              value={page}
              onChange={handlePageInputChange}
              min="1"
              max={totalPages}
              className="form-control"
              style={{ height: "38px", width: "70px" }}
            />
          </div>
          {/* Nút thêm lớp */}
          <div className="ms-auto">
            <Button
              className="btn btn-primary"
              onClick={() => setIsAddDialogOpen(true)}
              style={{
                height: "38px",
                padding: "0 16px",
                whiteSpace: "nowrap",
              }}
            >
              {t("addClass")}
            </Button>
          </div>
        </div>
      </div>

      {/* Danh sách lớp học */}
      <div className="row g-3">
        {filteredClasses.map((classItem) => (
          <div key={classItem._id} className="col-lg-3 col-md-6 col-sm-12">
            <div className="class-card">
              <ClassItem classItem={classItem} />
            </div>
          </div>
        ))}
      </div>

      {/* Empty state when no classes */}
      {filteredClasses.length === 0 && (
        <div className="empty-state text-center">
          <div className="text-muted">
            <i className="fas fa-graduation-cap fa-3x mb-3"></i>
            <h5>{t("noClassesFound")}</h5>
            <p>{t("noClassesMessage")}</p>
          </div>
        </div>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div>
            {t("showing")} {filteredClasses.length} {t("of")} {total}{" "}
            {t("classes")}
          </div>
          <div className="d-flex gap-2">
            <Button
              className="btn btn-outline-primary"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              {t("previous")}
            </Button>
            <select
              value={page}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="form-select"
              style={{ width: "100px", height: "38px" }}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  {t("page")} {p}
                </option>
              ))}
            </select>
            <Button
              className="btn btn-outline-primary"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}

      {/* Dialog thêm lớp học */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setNewClass({
            classname: "",
            courseId: "",
            quantity: 0,
            status: "Incomplete",
            date: null,
          });
          setErrors({});
        }}
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Dialog.Panel className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("addNewClass")}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewClass({
                    classname: "",
                    courseId: "",
                    quantity: 0,
                    status: "Incomplete",
                    date: null,
                  });
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
                  value={newClass.classname}
                  onChange={handleNewClassChange}
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
                <label className="form-label">{t("course")}</label>
                <select
                  name="courseId"
                  value={newClass.courseId}
                  onChange={handleNewClassChange}
                  className={`form-select ${
                    errors.courseId ? "is-invalid" : ""
                  }`}
                  style={{ height: "38px" }}
                >
                  <option value="">{t("selectCourse")}</option>
                  {courses &&
                    courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.coursename}
                      </option>
                    ))}
                </select>
                {errors.courseId && (
                  <div className="invalid-feedback">{errors.courseId}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">{t("quantity")}</label>
                <input
                  type="number"
                  name="quantity"
                  value={newClass.quantity}
                  onChange={handleNewClassChange}
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
                <label className="form-label">{t("dateBegin")}</label>
                <div>
                  <DatePicker
                    selected={newClass.date}
                    onChange={handleDateChange}
                    placeholderText={t("selectDate")}
                    className={`form-control ${
                      errors.date ? "is-invalid" : ""
                    }`}
                    style={{ height: "38px" }}
                    isClearable
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">{t("status")}</label>
                <select
                  name="status"
                  value={newClass.status}
                  onChange={handleNewClassChange}
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
              <Button className="btn btn-primary" onClick={handleAddClass}>
                {t("add")}
              </Button>
              <Button
                className="btn btn-secondary"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewClass({
                    classname: "",
                    courseId: "",
                    quantity: 0,
                    status: "Incomplete",
                    date: null,
                  });
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

export default ClassManagement;
