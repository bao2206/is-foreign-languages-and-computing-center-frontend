import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Get token from query string
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!token) {
      setMessage("Invalid or missing token.");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}users/reset-password/${token}`,
        { newPassword, confirmPassword }
      );
      setMessage(res.data.message || "Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        background: "linear-gradient(135deg, #6b48ff, #00d2ff)",
      }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "15px",
          backgroundColor: "#ffffff",
        }}
      >
        <div className="card-body">
          <h2 className="text-center mb-4" style={{ color: "#6b48ff" }}>
            Reset Password
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold" style={{ color: "#333" }}>
                New Password
              </label>
              <input
                type="password"
                className="form-control rounded-pill"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                style={{ borderColor: "#6b48ff", boxShadow: "none" }}
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold" style={{ color: "#333" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-control rounded-pill"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                style={{ borderColor: "#6b48ff", boxShadow: "none" }}
              />
            </div>
            {message && (
              <div
                className={`alert ${
                  message.includes("successfully")
                    ? "alert-success"
                    : "alert-danger"
                } text-center mb-3`}
                role="alert"
              >
                {message}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary w-100 rounded-pill py-2"
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #6b48ff, #00d2ff)",
                border: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              {loading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
          <p className="text-center mt-3 text-muted">
            Remembered your password?{" "}
            <a href="/login" className="text-primary fw-bold">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
