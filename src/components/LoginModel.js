import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LoginModal({ isOpen, onClose, onLogin }) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (email && password) {
        onLogin(email, password);
        onClose();
      } else {
        alert('Nhập đầy đủ email và mật khẩu');
      }
    };

    return (
      <div className="fixed inset-0 flex items-start justify-center z-50 pointer-events-none">
        <div className="mt-16 bg-white p-4 rounded-xl shadow-lg w-80 animate-slideDown pointer-events-auto">
          <h2 className="text-lg font-semibold mb-3">Đăng nhập</h2>
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="email"
              placeholder="Email"
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
              <button type="button" onClick={onClose} className="px-3 py-1 rounded bg-gray-100 text-sm">Hủy</button>
              <button type="submit" className="px-3 py-1 rounded bg-blue-500 text-white text-sm">Đăng nhập</button>
            </div>
          </form>
        </div>
      </div>
    );
}
