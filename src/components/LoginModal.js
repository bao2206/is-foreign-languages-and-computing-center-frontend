import React from "react";
import { useTranslation } from "react-i18next";
import { loginUser } from "../services/auth"; // hoặc nơi bạn để file login
// import Cookies from 'js-cookie'; // nếu bạn muốn lưu token vào cookie

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Nhập đầy đủ email và mật khẩu");
    
    try {
      
      const result = await loginUser(email, password);
      console.log(email, password);
      // Lưu token vào localStorage hoặc cookie
      localStorage.setItem("token", result.token);
      // Cookies.set("token", result.token); // nếu bạn dùng cookie

      console.log("User:", result.user); // Thông tin người dùng
      alert(result.message || "Đăng nhập thành công");

      onLogin?.(result.user); // Gửi dữ liệu user lên cha nếu cần
      onClose();
    } catch (err) {
      console.error("Login failed", err.response?.data || err.message);
      alert(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 pointer-events-none">
      <div className="mt-16 bg-white p-4 rounded-xl shadow-lg w-80 animate-slideDown pointer-events-auto">
        <h2 className="text-lg font-semibold mb-3">Đăng nhập</h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            placeholder="Tên đăng nhập"
            className="w-full border px-3 py-2 rounded text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full border px-3 py-2 rounded text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded bg-gray-100 text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-blue-500 text-white text-sm"
            >
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
