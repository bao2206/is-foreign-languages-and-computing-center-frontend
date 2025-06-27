import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
} from "lucide-react";
import { fetchCertificatesById } from "../../services/ManagementUserService";
import { getUserProfile, updateUserProfile } from "../../services/auth";
import { useTranslation } from "react-i18next";

const ProfileView = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      country: "",
    },
    department: "",
    studentId: "",
    employeeId: "",
    joinDate: "",
  });
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: {
            street: data.address?.street || "",
            city: data.address?.city || "",
            country: data.address?.country || "",
          },
          department: data.department || "",
          studentId: data.studentId || "",
          employeeId: data.authId.role.name === "teacher" ? data.citizenID : "",
          joinDate: data.createdAt.split("T")[0] || "",
        });

        // Fetch certificates by user id
        const certs = await fetchCertificatesById(data._id);
        setCertificates(certs || []);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "street" || name === "city" || name === "country") {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      // Gửi dữ liệu cập nhật
      await updateUserProfile({
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          country: formData.address.country,
        },
      });
      setIsEditing(false);
      setUser((prev) => ({
        ...prev,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          country: formData.address.country,
        },
      }));
    } catch (error) {
      alert("Update failed!");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        ...formData,
        email: user.email || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          country: user.address?.country || "",
        },
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-center">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("profile")}</h1>
            <p className="text-gray-600 mt-1">
              {t("manageYourPersonalInformation")}
            </p>
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t("saveChanges")}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t("cancel")}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                {t("editProfile")}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture and Basic Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={
                    user.avatar ||
                    require("../../components/Images/user_Img.png")
                  }
                  alt={user.name}
                  className="w-32 h-32 rounded-full mx-auto object-cover"
                />
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="mt-4">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="text-xl font-bold text-gray-900 text-center w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-gray-900">
                    {formData.name}
                  </h2>
                )}
                <p className="text-gray-600 mt-1 capitalize">
                  {user.authId.role.name}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {formData.department}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-3 text-gray-400" />
                <span>
                  {user.authId.role.name === "teacher"
                    ? "Employee ID"
                    : "Student ID"}
                  :{" "}
                  {user.authId.role.name === "teacher"
                    ? formData.employeeId
                    : formData.studentId}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                <span>
                  {t("joined")}:{" "}
                  {new Date(formData.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("contactInformation")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("email")}
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {formData.email}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("phone")}
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {formData.phone}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("address")}
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      name="street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("street")}
                    />
                    <input
                      type="text"
                      name="city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("city")}
                    />
                    <input
                      type="text"
                      name="country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("country")}
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-gray-900">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {[
                      formData.address.street,
                      formData.address.city,
                      formData.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
              </div>
            </div>

            {/* Certificates Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("certificateList")}
              </h3>
              {/* Table of certificates */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {t("certificateName")}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {t("certificateInformation")}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {t("receivedDate")}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {t("expirationDate")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {certificates && certificates.length > 0 ? (
                      certificates.map((cert, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {cert.certificateName}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                            {cert.information}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                            {cert.receivedDate
                              ? new Date(cert.receivedDate).toLocaleDateString()
                              : ""}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                            {cert.expirationDate
                              ? new Date(
                                  cert.expirationDate
                                ).toLocaleDateString()
                              : ""}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center text-gray-500 py-4"
                        >
                          {t("noCertificates")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
