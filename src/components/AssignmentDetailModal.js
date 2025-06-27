import React, { useState } from "react";

const AssignmentDetailModal = ({
  open,
  onClose,
  assignment,
  isLecturer,
  t,
  onGrade,
}) => {
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradingScore, setGradingScore] = useState("");
  const [gradingComment, setGradingComment] = useState("");
  const [gradingLoading, setGradingLoading] = useState(false);

  // Hàm mở grading modal
  const handleOpenGrading = (submission) => {
    setGradingSubmission(submission);
    setGradingScore(submission.grade || "");
    setGradingComment(submission.teacherComments || "");
  };
  const handleCloseGrading = () => {
    setGradingSubmission(null);
    setGradingScore("");
    setGradingComment("");
  };

  // Hàm submit grading
  const handleGradeSubmit = async () => {
    if (!gradingSubmission) return;
    setGradingLoading(true);
    try {
      // Gọi callback grading ra ngoài nếu có
      if (onGrade) {
        await onGrade(gradingSubmission, gradingScore, gradingComment);
      }
      handleCloseGrading();
    } catch (err) {
      alert(err.message);
    } finally {
      setGradingLoading(false);
    }
  };
  if (!open || !assignment) return null;

  const dueDate = assignment.dueDate
    ? new Date(assignment.dueDate).toLocaleString()
    : "";

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative transform transition-all duration-300 hover:shadow-3xl">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-5 rounded-xl mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {assignment.title}
          </h2>
          <p className="text-gray-700 mb-4">{assignment.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>{t("class")}: </strong>
              {assignment.classId?.classname ||
                assignment.classId?.name ||
                t("unknown_class")}
            </div>
            <div>
              <strong>{t("due_date")}: </strong>
              {dueDate}
            </div>
            <div>
              <strong>{t("status")}: </strong>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  assignment.status === "draft"
                    ? "bg-gray-200 text-gray-800"
                    : assignment.status === "published"
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {assignment.status}
              </span>
            </div>
          </div>
        </div>

        {isLecturer ? (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 border-gray-200">
              {t("recent_submissions")}
            </h4>
            {assignment.submissions && assignment.submissions.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {assignment.submissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-100"
                  >
                    <div className="flex items-center">
                      <img
                        src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2"
                        alt={submission.studentId?.name || t("student")}
                        className="w-8 h-8 rounded-full mr-3 object-cover"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {submission.studentId?.name || t("unknown_student")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {new Date(
                          submission.submissionDate
                        ).toLocaleDateString()}
                      </span>
                      {submission.grade !== null && (
                        <span className="text-sm font-medium text-green-600">
                          {submission.grade}
                        </span>
                      )}
                      {isLecturer && (
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                          onClick={() => handleOpenGrading(submission)}
                        >
                          {t("grade")}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
                {t("no_assignments_found")}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 border-gray-200">
              {t("your_submission")}
            </h4>
            {assignment.submissions && assignment.submissions.length > 0 ? (
              assignment.submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="p-4 bg-gray-50 rounded-lg mb-3 hover:bg-gray-100 transition-colors duration-200 border border-gray-100"
                >
                  <div className="text-sm text-gray-900 mb-1">
                    <strong>{t("submitted_on")}: </strong>
                    {new Date(submission.submissionDate).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    <strong>{t("your_comments")}: </strong>
                    {submission.comments || t("no_comments")}
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    <strong>{t("Link")}: </strong>
                    {submission.link || t("no_link")}
                  </div>
                  {submission.teacherComments !== null && (
                    <div className="text-sm font-medium text-green-600 mt-1">
                      <strong>{t("teacherComments")}: </strong>
                      {submission.teacherComments}
                    </div>
                  )}
                  {submission.grade !== null && (
                    <div className="text-sm font-medium text-green-600 mt-1">
                      <strong>{t("grade")}: </strong>
                      {submission.grade}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
                {t("no_assignments_found")}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
          >
            {t("close") || "Close"}
          </button>
        </div>

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
      </div>
    </div>
  );
};

export default AssignmentDetailModal;
