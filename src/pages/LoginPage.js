import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const [loginType, setLoginType] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Luôn render HomePage phía sau
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* HomePage background */}
      <div style={{ filter: loginType ? "blur(2px)" : "none" }}>
        {/* Import trực tiếp HomePage component */}
        {require("./HomePage").default()}
      </div>

      {/* Overlay chọn loại đăng nhập */}
      {!loginType && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => navigate("/")} // Thêm sự kiện click ra nền để quay lại trang chủ
        >
          <div
            className="bg-white p-8 rounded shadow-md w-full max-w-xs"
            onClick={(e) => e.stopPropagation()} // Ngăn sự kiện nổi bọt khi click vào box
          >
            <h2 className="text-xl font-bold mb-6 text-center">
              {t("login.selectType", "Chọn loại đăng nhập")}
            </h2>
            <button
              className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setLoginType("staff")}
            >
              {t("login.staff", "Đăng nhập nhân viên")}
            </button>
            <button
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setLoginType("class")}
            >
              {t("login.class", "Đăng nhập giáo viên hoặc học viên")}
            </button>
          </div>
        </div>
      )}

      {/* Modal đăng nhập staff */}
      {loginType === "staff" && (
        <LoginModal
          isOpen={true}
          onLogin={(user) => {
            const userRole = user.role;
            if (
              userRole === "6800d06932b289b2fe5b0409" ||
              userRole === "6800d06932b289b2fe5b0406" ||
              userRole === "6800d06a32b289b2fe5b040c" ||
              userRole === "6800d06a32b289b2fe5b040f" ||
              userRole === "6800d06a32b289b2fe5b0412"
            ) {
              navigate("/management/staff");
            } else {
              navigate("/");
            }
          }}
          onClose={() => setLoginType(null)}
        />
      )}

      {/* Điều hướng sang trang login giáo viên/học viên */}
      {loginType === "class" &&
        (() => {
          navigate("/class/login");
          return null;
        })()}
    </div>
  );
}
