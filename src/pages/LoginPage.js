// pages/LoginPage.js
import React from "react";
import LoginModal from "../components/LoginModal";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (user) => {
    // Check user role and redirect accordingly
    const userRole = user.role;
    
    // Check if the role ObjectId matches admin or staff roles
    if (userRole === '6800d06932b289b2fe5b0409' || // admin role ID
        userRole === '6800d06932b289b2fe5b0406' ||
        userRole === '6800d06a32b289b2fe5b040c' ||
        userRole === '6800d06a32b289b2fe5b040f' ||
        userRole === '6800d06a32b289b2fe5b0412'

      ) { // staff role ID
      // Redirect to admin dashboard for admin and staff users
      navigate("/management/staff");
    } else {
      // Redirect to client interface for other users
      navigate("/");
    }
  };

  const handleClose = () => {
    // Redirect to homepage when modal is closed
    navigate("/");
  };

  return <LoginModal isOpen={true} onLogin={handleLogin} onClose={handleClose} />;
}
