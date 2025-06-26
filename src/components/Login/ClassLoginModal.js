import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, Transition } from "@headlessui/react";
import { GraduationCap, User, Lock, Eye, EyeOff } from "lucide-react";
import { loginUser } from "../../services/auth";

const ClassLoginModal = ({ onLogin, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      setError(t("pleaseEnterUsernameAndPassword"));
      setIsLoading(false);
      return;
    }

    try {
      const result = await loginUser(username, password);

      // Lưu thông tin vào localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem("username", result.user.username);
      localStorage.setItem("userRole", result.user.role);
      localStorage.setItem("userId", result.user.id);
      console.log("Login successful:", result);

      console.log("User logged in:", result.user);
      alert(result.message || t("loginSuccessful"));

      if (onLogin) {
        onLogin(result.user);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("loginFailedPleaseTryAgain")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle closing modal with escape key or backdrop click
  const handleCloseModal = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(location.state?.from || "/");
    }
  };

  return (
    <Transition appear show={true} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="div" className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {t("classLogin")}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {t("signInToYourClassAccount")}
                  </p>
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("username")}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t("enterYourUsername")}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("password")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t("enterYourPassword")}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? t("signingIn") : t("signIn")}
                  </button>
                </form>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                  >
                    {t("close")}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ClassLoginModal;
