import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Calendar,
  Clock,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import {
  getAssignments,
  submitAssignment,
  deleteAssignment,
  createAssignment,
  updateAssignment,
} from "../../services/AssignmentService";
import {
  getClassForTeacher,
  getClassForStudent,
} from "../../services/ClassService";
import { getUserProfile } from "../../services/auth";
import AssignmentDetailModal from "../../components/AssignmentDetailModal";
import AssignmentEditModal from "../../components/AssignmentEditModal";
import SubmissionDialog from "../../components/Dialogs/SubmissionDialog";

const AssignmentList = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [sortBy, setSortBy] = useState("dueDate");
  const [searchTerm, setSearchTerm] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    classId: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({});
  const [classes, setClasses] = useState([]);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const [submissionAssignment, setSubmissionAssignment] = useState(null);

  // New: State for showing all submissions and grading dialog
  const [showAllSubmissionsFor, setShowAllSubmissionsFor] = useState(null);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradingScore, setGradingScore] = useState("");
  const [gradingComment, setGradingComment] = useState("");
  const [gradingLoading, setGradingLoading] = useState(false);

  useEffect(() => {
    const fetchUserAndClasses = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
        setLoading(true);
        await fetchAssignments(profile);

        let classList;
        if (profile.authId.role.name === "teacher") {
          classList = await getClassForTeacher({
            limit: 100,
            authId: profile.authId,
          });
        } else {
          classList = await getClassForStudent({
            limit: 100,
            authId: profile.authId,
          });
        }
        setClasses(classList || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndClasses();
  }, []);

  const fetchAssignments = async (user) => {
    if (!user) return;
    setError(null);
    try {
      let config = {
        sortBy,
        searchTerm,
        page,
        pageSize,
      };
      if (user.authId.role.name === "teacher") {
        config.action = "getByTeacherId";
        config.authId = user.authId;
      } else {
        config.action = "getByStudentId";
        config.authId = user.authId;
      }
      const res = await getAssignments(config);

      setAssignments(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAssignments(user);
    // eslint-disable-next-line
  }, [sortBy, searchTerm, page, pageSize, user]);

  const isLecturer = user?.authId.role.name === "teacher";

  const hasUserSubmitted = (assignment) =>
    assignment.submissions.some(
      (submission) =>
        submission.studentId &&
        (typeof submission.studentId === "object"
          ? submission.studentId._id === user._id
          : submission.studentId === user._id)
    );

  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);

    const submitted = hasUserSubmitted(assignment);

    if (isLecturer) {
      return assignment.status === "published" ? "Published" : "Draft";
    }
    if (submitted) return "Submitted";
    if (dueDate < now) return "Overdue";
    return "Pending";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-700";
      case "Draft":
        return "bg-gray-100 text-gray-700";
      case "Submitted":
        return "bg-blue-100 text-blue-700";
      case "Overdue":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleSortChange = (e) => setSortBy(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handlePageChange = (newPage) => setPage(newPage);

  // Open submission dialog for student
  const handleOpenSubmissionDialog = (assignment) => {
    setSubmissionAssignment(assignment);
    setIsSubmissionDialogOpen(true);
  };
  const handleCloseSubmissionDialog = () => {
    setSubmissionAssignment(null);
    setIsSubmissionDialogOpen(false);
  };

  // Student submits assignment (with dialog)
  const handleSubmitAssignment = async (assignmentId, submissionData) => {
    if (!user) return;
    try {
      // submissionData nên có: link, comments, submittedAt

      await submitAssignment(
        assignmentId,
        {
          ...submissionData,
          studentId: user._id,
        },
        {
          authId: user.authId,
        }
      );
      await fetchAssignments(user);
      setIsSubmissionDialogOpen(false);
      setSubmissionAssignment(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!isLecturer || !user) return;
    try {
      await deleteAssignment(assignmentId, { authId: user.authId });
      await fetchAssignments(user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (
      !user ||
      !newAssignment.title ||
      !newAssignment.dueDate ||
      !newAssignment.classId
    ) {
      alert(t("all_fields_required"));
      return;
    }
    try {
      await createAssignment(user._id, newAssignment, { authId: user.authId });
      setNewAssignment({
        title: "",
        description: "",
        dueDate: "",
        classId: "",
      });
      setIsAddModalOpen(false);
      await fetchAssignments(user);
    } catch (err) {
      setError(err.message);
    }
  };

  // Detail Modal handlers
  const handleOpenDetailModal = (assignment) => {
    setSelectedAssignment(assignment);
    setIsDetailModalOpen(true);
  };
  const handleCloseDetailModal = () => {
    setSelectedAssignment(null);
    setIsDetailModalOpen(false);
  };

  // Edit Modal handlers
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
      await fetchAssignments(user);
    } catch (err) {
      setError(err.message);
    }
  };

  // Show all submissions for an assignment (toggle)
  const handleToggleAllSubmissions = (assignmentId) => {
    setShowAllSubmissionsFor((prev) =>
      prev === assignmentId ? null : assignmentId
    );
  };

  // Grading logic
  const handleOpenGrading = (submission, assignment) => {
    setGradingSubmission({ ...submission, assignment });
    setGradingScore(submission.grade || "");
    setGradingComment(submission.teacherComment || "");
  };
  const handleCloseGrading = () => {
    setGradingSubmission(null);
    setGradingScore("");
    setGradingComment("");
  };
  const handleGradeSubmit = async () => {
    if (!gradingSubmission || !gradingSubmission.assignment) return;
    setGradingLoading(true);
    try {
      // Call updateAssignment with updated submission grade
      const updatedSubmissions = gradingSubmission.assignment.submissions.map(
        (s) =>
          s._id === gradingSubmission._id
            ? { ...s, grade: gradingScore, teacherComment: gradingComment }
            : s
      );
      await updateAssignment(gradingSubmission.assignment._id, {
        ...gradingSubmission.assignment,
        submissions: updatedSubmissions,
      });
      await fetchAssignments(user);
      handleCloseGrading();
      setShowAllSubmissionsFor(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setGradingLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-center">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("assignments")}
          </h1>
          <p className="text-gray-600 mt-1">
            {isLecturer
              ? t("manage_assignments_lecturer")
              : t("view_submit_assignments")}
          </p>
        </div>
        {isLecturer && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("create_assignment")}
          </button>
        )}
      </div>

      {/* Search and Sort Controls */}
      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t("search_by_title")}
          className="w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="dueDate">{t("sort_by_due_date")}</option>
          <option value="title">{t("sort_by_title")}</option>
          <option value="submissions">{t("sort_by_submissions")}</option>
        </select>
      </div>

      {/* Add Assignment Modal */}
      {isLecturer && isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {t("add_new_assignment")}
            </h2>
            <form onSubmit={handleAddAssignment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("title")}
                </label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      title: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("description")}
                </label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("due_date")}
                </label>
                <input
                  type="datetime-local"
                  value={newAssignment.dueDate}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      dueDate: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("class")}
                </label>
                <select
                  value={newAssignment.classId}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      classId: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                >
                  <option value="">{t("select_a_class")}</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.classname}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {t("add_assignment")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submission Dialog for students */}
      {isSubmissionDialogOpen && submissionAssignment && (
        <SubmissionDialog
          open={isSubmissionDialogOpen}
          assignment={submissionAssignment}
          onClose={handleCloseSubmissionDialog}
          onSubmit={async (submissionData) =>
            await handleSubmitAssignment(
              submissionAssignment._id,
              submissionData
            )
          }
          t={t}
        />
      )}

      {/* Detail Modal */}
      {selectedAssignment && (
        <AssignmentDetailModal
          open={isDetailModalOpen}
          assignment={selectedAssignment}
          onClose={handleCloseDetailModal}
          isLecturer={isLecturer}
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
          classes={classes}
          t={t}
        />
      )}

      {/* Show all submissions modal for lecturer (toggleable) */}
      {isLecturer && showAllSubmissionsFor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{t("all_submissions")}</h3>
              <button
                className="text-blue-600 hover:underline text-xs"
                onClick={() => setShowAllSubmissionsFor(null)}
              >
                {t("collapse")}
              </button>
            </div>
            {assignments
              .find((a) => a._id === showAllSubmissionsFor)
              ?.submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded mb-2"
                >
                  <div className="flex items-center">
                    <img
                      src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2"
                      alt={submission.studentId?.name || t("student")}
                      className="w-6 h-6 rounded-full mr-3"
                    />
                    <span className="text-sm text-gray-900">
                      {submission.studentId?.name || t("unknown_student")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {new Date(submission.submissionDate).toLocaleDateString()}
                    </span>
                    {submission.grade && (
                      <span className="text-sm font-medium text-green-600">
                        {submission.grade}
                      </span>
                    )}
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                      onClick={() => {
                        handleOpenGrading(
                          submission,
                          assignments.find(
                            (a) => a._id === showAllSubmissionsFor
                          )
                        );
                      }}
                    >
                      {t("grade")}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Grading dialog with submission info */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
            <h3 className="text-2xl font-bold mb-4 text-blue-700 flex items-center">
              <span className="mr-2">{t("grade_submission")}</span>
              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                {gradingSubmission.studentId?.name || t("unknown_student")}
              </span>
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("score")}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={gradingScore}
                onChange={(e) => setGradingScore(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder={t("enter_score")}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("comment")}
              </label>
              <textarea
                value={gradingComment}
                onChange={(e) => setGradingComment(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
                rows={3}
                placeholder={t("enter_comment")}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("submission_link")}
              </label>
              <div>
                {gradingSubmission.link ? (
                  <a
                    href={gradingSubmission.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all hover:text-blue-800 transition"
                  >
                    {gradingSubmission.link}
                  </a>
                ) : (
                  <span className="text-gray-400">{t("no_link_provided")}</span>
                )}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("student_comment")}
              </label>
              <div className="text-gray-700 whitespace-pre-line bg-gray-50 rounded px-3 py-2 min-h-[40px]">
                {gradingSubmission.comments || (
                  <span className="text-gray-400">{t("no_comment")}</span>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseGrading}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                disabled={gradingLoading}
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleGradeSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                disabled={gradingLoading}
              >
                {gradingLoading ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {assignments.map((assignment) => {
          const status = getAssignmentStatus(assignment);

          const daysUntilDue = Math.ceil(
            (new Date(assignment.dueDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );

          const isShowAll = showAllSubmissionsFor === assignment._id;

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
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      <span>
                        {assignment.classId?.name || t("unknown_class")}
                      </span>
                    </div>
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
                    {isLecturer && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>
                          {assignment.submissions.length} {t("submissions")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => handleOpenDetailModal(assignment)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {isLecturer && (
                    <>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => handleOpenEditModal(assignment)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isLecturer && assignment.submissions.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      {t("recent_submissions")}
                    </h4>
                    <button
                      className="text-blue-600 hover:underline text-xs"
                      onClick={() => handleToggleAllSubmissions(assignment._id)}
                    >
                      {isShowAll ? t("collapse") : t("show_all")}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {assignment.submissions.slice(0, 3).map((submission) => (
                      <div
                        key={submission._id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center">
                          <img
                            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2"
                            alt={submission.studentId?.name || t("student")}
                            className="w-6 h-6 rounded-full mr-3"
                          />
                          <span className="text-sm text-gray-900">
                            {submission.studentId?.name || t("unknown_student")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">
                            {new Date(
                              submission.submissionDate
                            ).toLocaleDateString()}
                          </span>
                          {submission.grade && (
                            <span className="text-sm font-medium text-green-600">
                              {submission.grade}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex space-x-3">
                {isLecturer ? (
                  <>
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      onClick={() => handleOpenDetailModal(assignment)}
                    >
                      {t("view_submissions")}
                    </button>
                    <button
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      onClick={() => handleOpenEditModal(assignment)}
                    >
                      {t("edit_assignment")}
                    </button>
                  </>
                ) : (
                  <>
                    {status === "Pending" && (
                      <button
                        onClick={() => handleOpenSubmissionDialog(assignment)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {t("submit_assignment")}
                      </button>
                    )}
                    <button
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      onClick={() => handleOpenDetailModal(assignment)}
                    >
                      {t("view_details")}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center mt-6">
        {pagination.totalPages > 1 &&
          Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`mx-1 px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("no_assignments_found")}
          </h3>
          <p className="text-gray-600">
            {isLecturer
              ? t("create_first_assignment")
              : t("no_assignments_match_filter")}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignmentList;
