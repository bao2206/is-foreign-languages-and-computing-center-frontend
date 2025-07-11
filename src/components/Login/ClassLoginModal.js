import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, Transition } from "@headlessui/react";
import { GraduationCap, User, Lock, Eye, EyeOff } from "lucide-react";
import { loginUser } from "../../services/auth";
import axios from "axios";

const ClassLoginModal = ({ onLogin, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

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
      alert(result.message || t("loginSuccessful"));

      if (onLogin) {
        onLogin(result.user);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t("loginFailedPleaseTryAgain")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage("");
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}users/forgot-password`,
        { username: forgotUsername }
      );
      setForgotMessage(
        res.data.message || t("checkYourEmailForResetInstructions")
      );
    } catch (err) {
      setForgotMessage(
        err.response?.data?.message || t("errorSendingResetEmail")
      );
    } finally {
      setForgotLoading(false);
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
                {!showForgot ? (
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
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        className="text-blue-600 text-sm hover:underline"
                        onClick={() => setShowForgot(true)}
                      >
                        {t("Forgot Password")}
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? t("signingIn") : t("signIn")}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div>
                      <label
                        htmlFor="forgot-username"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t("username")}
                      </label>
                      <input
                        id="forgot-username"
                        type="text"
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t("enterYourUsername")}
                        required
                      />
                    </div>
                    {forgotMessage && (
                      <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg text-sm">
                        {forgotMessage}
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        className="text-gray-600 text-sm hover:underline"
                        onClick={() => setShowForgot(false)}
                      >
                        {t("backToLogin")}
                      </button>
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {forgotLoading ? t("sending") : t("sendResetEmail")}
                      </button>
                    </div>
                  </form>
                )}
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
