import React, { useState } from "react";
import { X, Link, Send, FileText, Calendar, User } from "lucide-react";

const SubmissionDialog = ({ open, onClose, assignment, onSubmit }) => {
  const [submissionLink, setSubmissionLink] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionLink.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const submissionData = {
      link: submissionLink,
      comments: comments,
      submittedAt: new Date().toISOString(),
    };

    onSubmit(submissionData);
    setIsSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    setSubmissionLink("");
    setComments("");
    onClose();
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const getDaysUntilDue = () => {
    if (!assignment) return 0;
    return Math.ceil(
      (new Date(assignment.dueDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;

  if (!open || !assignment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <FileText className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Submit Assignment
                </h2>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {assignment.title}
              </h3>
              <p className="text-gray-600 text-sm">{assignment.className}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Assignment Info */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Max Score</p>
                <p className="font-medium text-gray-900">
                  {assignment.maxScore} points
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  isOverdue
                    ? "bg-red-500"
                    : isUrgent
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              ></div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p
                  className={`font-medium ${
                    isOverdue
                      ? "text-red-600"
                      : isUrgent
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {isOverdue
                    ? `${Math.abs(daysUntilDue)} days overdue`
                    : `${daysUntilDue} days remaining`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Description */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">
            Assignment Description
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {assignment.description}
          </p>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Submission Link */}
            <div>
              <label
                htmlFor="submissionLink"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Submission Link *
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="submissionLink"
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    submissionLink && !isValidUrl(submissionLink)
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="https://github.com/username/project or https://drive.google.com/..."
                  required
                />
              </div>
              {submissionLink && !isValidUrl(submissionLink) && (
                <p className="mt-1 text-sm text-red-600">
                  Please enter a valid URL
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Provide a link to your project (GitHub, Google Drive, etc.)
              </p>
            </div>

            {/* Comments */}
            <div>
              <label
                htmlFor="comments"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Additional Comments (Optional)
              </label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                placeholder="Any additional notes or comments about your submission..."
              />
            </div>

            {/* Submission Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">
                Submission Guidelines
              </h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Ensure your link is publicly accessible or properly shared
                </li>
                <li>
                  • Include a README file with setup instructions if applicable
                </li>
                <li>• Test your link before submitting to ensure it works</li>
                <li>• You can resubmit if needed before the deadline</li>
              </ul>
            </div>

            {/* Warning for overdue */}
            {isOverdue && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <p className="text-red-800 font-medium">
                    This assignment is {Math.abs(daysUntilDue)} days overdue.
                    Late submissions may receive reduced points.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !submissionLink.trim() ||
                !isValidUrl(submissionLink) ||
                isSubmitting
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionDialog;
