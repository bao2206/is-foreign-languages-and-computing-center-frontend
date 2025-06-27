import React from "react";
import { useTranslation } from "react-i18next";
import { loginUser } from "../services/auth";
import axios from "axios";

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const { t } = useTranslation();
  const [showForgot, setShowForgot] = React.useState(false);
  const [forgotUsername, setForgotUsername] = React.useState("");
  const [forgotMessage, setForgotMessage] = React.useState("");
  const [forgotLoading, setForgotLoading] = React.useState(false);
  const [role, setRole] = React.useState("employee"); // "employee" hoặc "manager"

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password)
      return alert("Please enter username and password");

    try {
      const result = await loginUser(username, password, role); // Thêm role vào login

      localStorage.setItem("token", result.token);
      localStorage.setItem("username", result.user.username);
      localStorage.setItem("userRole", result.user.role);
      localStorage.setItem("userId", result.user.id);

      console.log("User:", result.user);
      alert(result.message || "Login successful");

      onLogin?.(result.user);
      onClose();
    } catch (err) {
      console.error("Login failed", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage("");
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}users/forgot-password`,
        {
          username: forgotUsername,
        }
      );
      setForgotMessage(
        res.data.message || "Check your email for reset instructions."
      );
    } catch (err) {
      setForgotMessage(
        err.response?.data?.message || "Error sending reset email."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
      style={{ backdropFilter: "blur(5px)" }}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md animate-fadeIn"
        style={{
          background: "linear-gradient(135deg, #f7f9fc, #e0e7ff)",
        }}
      >
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
          {t("login")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("username")}
            </label>
            <input
              type="text"
              placeholder={t("username")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("password")}
            </label>
            <input
              type="password"
              placeholder={t("password")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
              onClick={() => setShowForgot(true)}
            >
              {t("forgotPassword")}
            </button>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 text-sm hover:bg-gray-300 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
            >
              {t("login")}
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal/Dialog */}
      {showForgot && (
        <div
          className="fixed inset-0 flex items-center justify-center z-60 bg-gray-900 bg-opacity-50"
          style={{ backdropFilter: "blur(5px)" }}
        >
          <div
            className="bg-white p-5 rounded-xl shadow-2xl w-full max-w-sm animate-fadeIn"
            style={{
              background: "linear-gradient(135deg, #f7f9fc, #e0e7ff)",
            }}
          >
            <div className="modal-header">
              <h5 className="text-lg font-semibold text-gray-800 mb-3">
                {t("forgotPassword")}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowForgot(false)}
              ></button>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("username")}
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t("enterUsername")}
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  required
                />
              </div>
              {forgotMessage && (
                <div
                  className={`alert ${
                    forgotMessage.includes("instructions")
                      ? "alert-success"
                      : "alert-danger"
                  } text-sm mt-2`}
                >
                  {forgotMessage}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-200 text-sm hover:bg-gray-300 transition-colors"
                  onClick={() => setShowForgot(false)}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    t("sendResetEmail")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export const forgotPassword = async (username) => {
  return axios.post(
    `${process.env.REACT_APP_API_BASE_URL}users/forgot-password`,
    { username }
  );
};
