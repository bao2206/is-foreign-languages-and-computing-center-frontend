import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  FileText,
  Calendar,
  Users,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getAssignments,
  createAssignment,
} from "../../services/AssignmentService";
import AssignmentDetailModal from "../../components/AssignmentDetailModal";
import AssignmentEditModal from "../../components/AssignmentEditModal";
import {
  deleteAssignment,
  updateAssignment,
} from "../../services/AssignmentService";
import {
  getClassForTeacher,
  getClassForStudent,
  fetchClassById,
} from "../../services/ClassService";
import { getUserProfile } from "../../services/auth";

const ClassAssignmentManagement = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [classData, setClassData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Lấy thông tin user và class
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profile = await getUserProfile();
        setUser(profile);

        // Lấy class theo Id (dùng service mới)
        const foundClass = await fetchClassById(classId);
        console.log(foundClass);

        setClassData(foundClass);

        // Lấy assignments theo classId
        const res = await getAssignments({
          action: "getByClassId",
          classId,
        });

        console.log("asignments: ", res.data);

        setAssignments(res.data.data || []);
      } catch (err) {
        setClassData(null);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId, showCreateDialog]);

  // Xem chi tiết
  const handleOpenDetailModal = (assignment) => {
    console.log(assignment);

    setSelectedAssignment(assignment);
    setIsDetailModalOpen(true);
  };
  const handleCloseDetailModal = () => {
    setSelectedAssignment(null);
    setIsDetailModalOpen(false);
  };

  // Sửa assignment
  const handleOpenEditModal = (assignment) => {
    setSelectedAssignment(assignment);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setSelectedAssignment(null);
    setIsEditModalOpen(false);
  };
  const handleEditAssignment = async (updatedAssignment) => {
    try {
      await updateAssignment(updatedAssignment._id, updatedAssignment);
      setIsEditModalOpen(false);
      setSelectedAssignment(null);
      // Refresh assignments
      const res = await getAssignments({ action: "getByClassId", classId });
      setAssignments(res.data.data || []);
    } catch (err) {
      alert(err.message);
    }
  };

  // Xóa assignment
  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm(t("confirm_delete") || "Are you sure?")) return;
    try {
      await deleteAssignment(assignmentId);
      // Refresh assignments
      const res = await getAssignments({ action: "getByClassId", classId });
      setAssignments(res.data.data || []);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-center">{t("loading")}</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("unknown_class")}
          </h2>
          <button
            onClick={() => navigate("/class")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("back_to_classes") || "Back to Classes"}
          </button>
        </div>
      </div>
    );
  }

  // Lọc assignment theo search và status
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Thống kê
  const getAssignmentStats = (assignment) => {
    const totalStudents = classData.students?.length || 0;
    const submittedCount = assignment.submissions?.length || 0;
    const gradedCount = assignment.submissions?.filter(
      (sub) => sub.grade !== undefined && sub.grade !== null
    ).length;
    const pendingCount = totalStudents - submittedCount;

    return {
      total: totalStudents,
      submitted: submittedCount,
      graded: gradedCount,
      pending: pendingCount,
      submissionRate:
        totalStudents > 0
          ? Math.round((submittedCount / totalStudents) * 100)
          : 0,
    };
  };

  // Màu trạng thái
  const getStatusColor = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = dueDate < now;
    const stats = getAssignmentStats(assignment);

    if (assignment.status === "draft") return "bg-gray-100 text-gray-700";
    if (isOverdue) return "bg-red-100 text-red-700";
    if (stats.submissionRate === 100) return "bg-green-100 text-green-700";
    return "bg-blue-100 text-blue-700";
  };

  const getStatusText = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = dueDate < now;
    const stats = getAssignmentStats(assignment);

    if (assignment.status === "draft") return t("draft");
    if (isOverdue) return t("overdue");
    if (stats.submissionRate === 100) return t("completed");
    return t("active");
  };

  // Tạo assignment mới
  const CreateAssignmentDialog = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      dueDate: "",
      maxScore: 100,
      instructions: "",
      status: "draft",
    });
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Chỉ gửi đúng các trường có trong schema
        console.log("create : asign: ", classData);

        await createAssignment(user._id, {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          status: formData.status,
          classId: classData._id,
          teacherId: user._id,
        });
        setShowCreateDialog(false);
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          status: "draft",
        });
      } catch (err) {
        alert(err.message || "Create assignment failed");
      }
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    if (!showCreateDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t("create_assignment")}
                </h2>
                <p className="text-gray-600 mt-1">
                  {classData.classname || classData.name}
                </p>
              </div>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("title")} *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("title")}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("description")} *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("description")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("due_date")} *
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("status")}
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">{t("draft")}</option>
                  <option value="published">{t("published")}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateDialog(false)}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t("create_assignment")}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/class")}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("manage_assignments_lecturer")}
            </h1>
            <p className="text-gray-600 mt-1">
              {classData.classname || classData.name} ({classData.code}) •{" "}
              {classData.students?.length || 0} {t("students")}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("create_assignment")}
        </button>
      </div>

      {/* Class Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {assignments.length}
            </div>
            <div className="text-sm text-gray-600">{t("assignments")}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {assignments.filter((a) => a.status === "published").length}
            </div>
            <div className="text-sm text-gray-600">{t("published")}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {assignments.filter((a) => a.status === "draft").length}
            </div>
            <div className="text-sm text-gray-600">{t("draft")}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {assignments.reduce(
                (acc, a) => acc + (a.submissions?.length || 0),
                0
              )}
            </div>
            <div className="text-sm text-gray-600">{t("submissions")}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={t("search_by_title")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t("all")}</option>
                <option value="published">{t("published")}</option>
                <option value="draft">{t("draft")}</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
              <Download className="w-4 h-4 mr-2" />
              {t("export") || "Export"}
            </button>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => {
            const stats = getAssignmentStats(assignment);
            const daysUntilDue = Math.ceil(
              (new Date(assignment.dueDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={assignment._id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {assignment.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          assignment
                        )}`}
                      >
                        {getStatusText(assignment)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">
                      {assignment.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {t("due")}{" "}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span
                          className={
                            daysUntilDue < 0
                              ? "text-red-600"
                              : daysUntilDue <= 3
                              ? "text-yellow-600"
                              : ""
                          }
                        >
                          {daysUntilDue < 0
                            ? `${Math.abs(daysUntilDue)} ${t("days_overdue")}`
                            : `${daysUntilDue} ${t("days_remaining")}`}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        <span>
                          {assignment.maxScore || 100} {t("points") || "points"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => handleOpenDetailModal(assignment)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => handleOpenEditModal(assignment)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      onClick={() => handleDeleteAssignment(assignment._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Submission Statistics */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    {t("recent_submissions")}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {stats.submitted}
                      </div>
                      <div className="text-xs text-gray-600">
                        {t("submitted")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {stats.graded}
                      </div>
                      <div className="text-xs text-gray-600">{t("graded")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">
                        {stats.pending}
                      </div>
                      <div className="text-xs text-gray-600">
                        {t("pending")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {stats.submissionRate}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {t("rate") || "Rate"}
                      </div>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>
                        {t("submission_progress") || "Submission Progress"}
                      </span>
                      <span>
                        {stats.submitted}/{stats.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.submissionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("no_assignments_found")}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all"
                ? t("no_assignments_match_filter")
                : t("create_first_assignment")}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("create_assignment")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Assignment Dialog */}
      <CreateAssignmentDialog />
      {/* Detail Modal */}
      {selectedAssignment && (
        <AssignmentDetailModal
          open={isDetailModalOpen}
          assignment={selectedAssignment}
          onClose={handleCloseDetailModal}
          isLecturer={true}
          t={t}
        />
      )}

      {/* Edit Modal */}
      {selectedAssignment && (
        <AssignmentEditModal
          open={isEditModalOpen}
          assignment={selectedAssignment}
          onClose={handleCloseEditModal}
          onSave={handleEditAssignment}
          classes={[classData]}
          t={t}
        />
      )}
    </div>
  );
};

export default ClassAssignmentManagement;
