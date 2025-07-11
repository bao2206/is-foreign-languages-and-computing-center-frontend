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
      if (onGrade) {
        await onGrade(gradingSubmission, gradingScore, gradingComment);
        // Update the submissions array with the graded submission
        assignment.submissions = assignment.submissions.map((sub) =>
          sub._id === gradingSubmission._id
            ? {
                ...gradingSubmission,
                grade: gradingScore,
                teacherComments: gradingComment,
              }
            : sub
        );
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
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50"
      style={{ backdropFilter: "blur(5px)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative animate-slide-up"
        style={{
          background: "linear-gradient(135deg, #f9fafb, #e0e7ff)",
          transform: "translateY(0)",
          transition: "all 0.3s ease",
          zIndex: 51, // Đảm bảo detail modal nổi hơn overlay
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="bg-gradient-to-r from-blue-100 to-indigo-200 p-6 rounded-xl mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {assignment.title}
          </h2>
          <p className="text-gray-700 text-base mb-4">
            {assignment.description}
          </p>
          <div className="grid grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <strong className="text-gray-800">{t("class")}: </strong>
              <span className="ml-1">
                {assignment.classId?.classname ||
                  assignment.classId?.name ||
                  t("unknown_class")}
              </span>
            </div>
            <div>
              <strong className="text-gray-800">{t("due_date")}: </strong>
              <span className="ml-1">{dueDate}</span>
            </div>
            <div>
              <strong className="text-gray-800">{t("status")}: </strong>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
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
            <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-100 pb-2">
              {t("recent_submissions")}
            </h4>
            {assignment.submissions && assignment.submissions.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {assignment.submissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-200"
                  >
                    <div className="flex items-center">
                      <img
                        src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2"
                        alt={submission.studentId?.name || t("student")}
                        className="w-10 h-10 rounded-full mr-4 object-cover border-2 border-blue-100"
                      />
                      <span className="text-base font-medium text-gray-900">
                        {submission.studentId?.name || t("unknown_student")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-5">
                      <span className="text-sm text-gray-500">
                        {new Date(
                          submission.submissionDate
                        ).toLocaleDateString()}
                      </span>
                      {submission.grade !== null && (
                        <span className="text-sm font-semibold text-green-600">
                          {submission.grade}
                        </span>
                      )}
                      {isLecturer && (
                        <button
                          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
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
              <div className="text-center text-gray-500 py-6 bg-gray-50 rounded-xl">
                {t("no_assignments_found")}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-100 pb-2">
              {t("your_submission")}
            </h4>
            {assignment.submissions && assignment.submissions.length > 0 ? (
              assignment.submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="p-5 bg-gray-50 rounded-xl mb-4 hover:bg-gray-100 transition-all duration-200 border border-gray-200"
                >
                  <div className="text-base text-gray-900 mb-2">
                    <strong>{t("submitted_on")}: </strong>
                    {new Date(submission.submissionDate).toLocaleString()}
                  </div>
                  <div className="text-base text-gray-700 mb-2">
                    <strong>{t("your_comments")}: </strong>
                    {submission.comments || t("no_comments")}
                  </div>
                  <div className="text-base text-gray-700 mb-2">
                    <strong>{t("Link")}: </strong>
                    {submission.link ? (
                      <a
                        href={submission.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800 transition-colors"
                      >
                        {submission.link}
                      </a>
                    ) : (
                      t("no_link")
                    )}
                  </div>
                  {submission.teacherComments !== null && (
                    <div className="text-base font-medium text-green-600 mt-2">
                      <strong>{t("teacherComments")}: </strong>
                      {submission.teacherComments}
                    </div>
                  )}
                  {submission.grade !== null && (
                    <div className="text-base font-medium text-green-600 mt-2">
                      <strong>{t("grade")}: </strong>
                      {submission.grade}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6 bg-gray-50 rounded-xl">
                {t("no_assignments_found")}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
          >
            {t("close") || "Close"}
          </button>
        </div>

        {gradingSubmission && (
          <div className="fixed inset-0 flex items-center justify-center z-60">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up relative"
              style={{
                background: "linear-gradient(135deg, #f9fafb, #e0e7ff)",
              }}
            >
              <button
                onClick={handleCloseGrading}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center z-10">
                <span className="mr-2">{t("grade_submission")}</span>
                <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">
                  {gradingSubmission.studentId?.name || t("unknown_student")}
                </span>
              </h3>
              <div className="mb-4 z-10">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("score")}
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={gradingScore}
                  onChange={(e) => setGradingScore(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all z-10"
                  placeholder={t("enter_score")}
                />
              </div>
              <div className="mb-4 z-10">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("comment")}
                </label>
                <textarea
                  value={gradingComment}
                  onChange={(e) => setGradingComment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y z-10"
                  rows={4}
                  placeholder={t("enter_comment")}
                />
              </div>
              <div className="mb-4 z-10">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("submission_link")}
                </label>
                <div className="p-3 bg-gray-50 rounded-xl z-10">
                  {gradingSubmission.link ? (
                    <a
                      href={gradingSubmission.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 transition-colors break-words z-10"
                    >
                      {gradingSubmission.link}
                    </a>
                  ) : (
                    <span className="text-gray-500 z-10">
                      {t("no_link_provided")}
                    </span>
                  )}
                </div>
              </div>
              <div className="mb-6 z-10">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("student_comment")}
                </label>
                <div className="p-3 bg-gray-50 rounded-xl min-h-[60px] z-10">
                  {gradingSubmission.comments ? (
                    <p className="text-gray-800 whitespace-pre-wrap z-10">
                      {gradingSubmission.comments}
                    </p>
                  ) : (
                    <span className="text-gray-500 z-10">
                      {t("no_comment")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 z-10">
                <button
                  onClick={handleCloseGrading}
                  className="bg-gray-200 text-gray-800 px-5 py-2 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium z-10"
                  disabled={gradingLoading}
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleGradeSubmit}
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold z-10"
                  disabled={gradingLoading}
                >
                  {gradingLoading ? (
                    <span className="flex items-center z-10">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 z-10"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t("saving")}
                    </span>
                  ) : (
                    t("save")
                  )}
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
