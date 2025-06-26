import React from "react";

const AssignmentDetailModal = ({
  open,
  onClose,
  assignment,
  isLecturer,
  t,
}) => {
  if (!open || !assignment) return null;

  const dueDate = assignment.dueDate
    ? new Date(assignment.dueDate).toLocaleString()
    : "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-2">{assignment.title}</h2>
        <div className="mb-2 text-gray-700">{assignment.description}</div>
        <div className="mb-2 text-sm text-gray-600">
          <strong>{t("class")}: </strong>
          {assignment.classId?.classname ||
            assignment.classId?.name ||
            t("unknown_class")}
        </div>
        <div className="mb-2 text-sm text-gray-600">
          <strong>{t("due_date")}: </strong>
          {dueDate}
        </div>
        <div className="mb-2 text-sm text-gray-600">
          <strong>{t("status")}: </strong>
          {assignment.status}
        </div>
        {isLecturer ? (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">{t("recent_submissions")}</h4>
            {assignment.submissions && assignment.submissions.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {assignment.submissions.map((submission) => (
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
                      {submission.grade !== null && (
                        <span className="text-sm font-medium text-green-600">
                          {submission.grade}/100
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">{t("no_assignments_found")}</div>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">{t("your_submission")}</h4>
            {assignment.submissions && assignment.submissions.length > 0 ? (
              assignment.submissions.map((submission) => {
                return (
                  <div className="p-2 bg-gray-50 rounded mb-2">
                    <div className="text-sm text-gray-900 mb-1">
                      {t("submitted_on")}:{" "}
                      {new Date(submission.submissionDate).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-700 mb-1">
                      {t("comments")}: {submission.comments}
                    </div>
                    <div className="text-sm text-gray-700 mb-1">
                      {t("comments")}: {submission.link}
                    </div>
                    {submission.grade !== null && (
                      <div className="text-sm font-medium text-green-600">
                        {t("grade")}: {submission.grade}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500">{t("no_assignments_found")}</div>
            )}
          </div>
        )}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            {t("close") || "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailModal;
