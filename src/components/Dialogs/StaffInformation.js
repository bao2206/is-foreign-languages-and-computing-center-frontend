import React, { useState, useEffect, use } from "react";
import { useTranslation } from "react-i18next";
import "bootstrap/dist/css/bootstrap.css";
import { Dialog } from "@headlessui/react";
import {
  fetchCertificatesById,
  updateUser,
  updateRole,
} from "../../services/ManagementStaffService";

import { fetchRoles } from "../../services/RoleService";
import { Button } from "../Button";

export default function StaffInformation(props) {
  const { t } = useTranslation();
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [showCertificates, setShowCertificates] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [editStaffMode, setEditStaffMode] = useState(false);
  const [editedStaff, setEditedStaff] = useState({});
  const [newCertificate, setNewCertificate] = useState({
    certificateName: "",
    receivedDate: "",
    expirationDate: "",
  });
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const fetchedRoles = await fetchRoles();
        setRoles(fetchedRoles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    loadRoles();
  }, []);

  useEffect(() => {
    console.log("StaffInformation props:", props);

    if (props.staff) {
      setSelectedStaff(props.staff);
      setEditedStaff(props.staff);
    }
  }, [props.staff]);

  useEffect(() => {
    const loadCertificates = async () => {
      if (selectedStaff?._id) {
        try {
          const certs = await fetchCertificatesById(selectedStaff._id);
          setCertificates(certs);
        } catch (error) {
          console.error("Error fetching certificates:", error);
        }
      }
    };
    loadCertificates();
  }, [selectedStaff]);

  const handleStaffFieldChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setEditedStaff((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setEditedStaff((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleViewCertificates = () => {
    setShowCertificates((prev) => !prev);
  };

  const handleNewCertChange = (e) => {
    const { name, value } = e.target;
    setNewCertificate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCertificate = () => {
    if (
      newCertificate.certificateName &&
      newCertificate.receivedDate &&
      newCertificate.expirationDate
    ) {
      setCertificates((prev) => [...prev, newCertificate]);
      setNewCertificate({
        certificateName: "",
        receivedDate: "",
        expirationDate: "",
      });
    }
  };

  const handleEditCertificate = (cert) => {
    setNewCertificate(cert);
  };

  const handleSaveEdit = async () => {
    try {
      // Cập nhật thông tin người dùng (name, email, phone, citizenID, address)
      const updatedStaff = await updateUser(selectedStaff._id, editedStaff);

      // Kiểm tra và cập nhật role nếu có thay đổi
      if (editedStaff.role && editedStaff.role !== selectedStaff.role) {
        await updateRole(selectedStaff._id, editedStaff.role);
      }

      setSelectedStaff(updatedStaff);
      setEditStaffMode(false);

      // Gọi callback để thông báo cập nhật thành công
      if (props.onUpdate) {
        props.onUpdate(updatedStaff); // Truyền dữ liệu nhân viên đã cập nhật
      }
    } catch (error) {
      alert(t("failedToUpdateUser"));
    }
  };

  const onClose = () => {
    setIsOpen(false);
    props.onClose();
  };

  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full">
            {selectedStaff && (
              <div>
                <h2 className="text-xl font-bold mb-2">{t("staffInfo")}</h2>
                <img
                  src={
                    selectedStaff.avatar || "https://via.placeholder.com/100"
                  }
                  className="w-24 h-24 rounded-full mb-2"
                  alt="avatar"
                />
                {editStaffMode ? (
                  <div className="space-y-2">
                    <input
                      name="name"
                      value={editedStaff.name}
                      onChange={handleStaffFieldChange}
                      className="w-full border px-3 py-2 rounded"
                      placeholder={t("staffName")}
                    />
                    <input
                      name="email"
                      value={editedStaff.email}
                      onChange={handleStaffFieldChange}
                      className="w-full border px-3 py-2 rounded"
                      placeholder={t("email")}
                    />
                    <input
                      name="phone"
                      value={editedStaff.phone}
                      onChange={handleStaffFieldChange}
                      className="w-full border px-3 py-2 rounded"
                      placeholder={t("phoneNumber")}
                    />
                    <input
                      name="citizenID"
                      value={editedStaff.citizenID}
                      onChange={handleStaffFieldChange}
                      className="w-full border px-3 py-2 rounded"
                      placeholder={t("citizenID")}
                    />
                    <input
                      name="address.street"
                      value={editedStaff.address?.street || ""}
                      onChange={handleStaffFieldChange}
                      className="w-full border px-3 py-2 rounded"
                      placeholder={t("street")}
                    />
                    <input
                      name="address.city"
                      value={editedStaff.address?.city || ""}
                      onChange={handleStaffFieldChange}
                      className="w-full border px-3 py-2 rounded"
                      placeholder={t("city")}
                    />
                    <input
                      name="address.country"
                      value={editedStaff.address?.country || ""}
                      onChange={handleStaffFieldChange}
                      className="w-full border px-3 py-2 rounded"
                      placeholder={t("country")}
                    />
                    <select
                      name="role"
                      value={editedStaff.role || ""}
                      onChange={handleStaffFieldChange}
                      className="w-full border px-3 py-2 rounded"
                    >
                      <option value="">{t("selectRole")}</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role.name}>
                          {t(role.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <p>
                      <strong>{t("staffName")}:</strong> {selectedStaff.name}
                    </p>
                    <p>
                      <strong>{t("email")}:</strong> {selectedStaff.email}
                    </p>
                    <p>
                      <strong>{t("phoneNumber")}:</strong>{" "}
                      {selectedStaff.phone || "N/A"}
                    </p>
                    <p>
                      <strong>{t("citizenID")}:</strong>{" "}
                      {selectedStaff.citizenID || "N/A"}
                    </p>
                    <p>
                      <strong>{t("address")}:</strong>{" "}
                      {`${selectedStaff.address?.street || ""}, ${
                        selectedStaff.address?.city || ""
                      }, ${selectedStaff.address?.country || ""}` || t("N/A")}
                    </p>
                    <p>
                      <strong>{t("role")}:</strong>{" "}
                      {t(selectedStaff.role) || t("N/A")}
                    </p>
                  </>
                )}
                <div className="mt-3 flex gap-2 text-white">
                  <Button onClick={handleViewCertificates}>
                    {showCertificates
                      ? t("hideCertificates")
                      : t("viewCertificates")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (editStaffMode) handleSaveEdit();
                      else setEditStaffMode(true);
                    }}
                  >
                    {editStaffMode ? t("save") : t("editInfo")}
                  </Button>
                </div>

                {showCertificates && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">
                      {t("certificateList")}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left border">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-2 py-1 whitespace-nowrap">
                              {t("certificateName")}
                            </th>
                            <th className="border px-2 py-1 whitespace-nowrap">
                              {t("receivedDate")}
                            </th>
                            <th className="border px-2 py-1 whitespace-nowrap">
                              {t("expirationDate")}
                            </th>
                            <th className="border px-2 py-1 whitespace-nowrap">
                              {t("action")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {certificates.map((cert, idx) => (
                            <tr
                              key={idx}
                              className={
                                new Date(cert.expirationDate) < new Date()
                                  ? "bg-red-100"
                                  : ""
                              }
                            >
                              <td className="border px-2 py-1 whitespace-nowrap">
                                {cert.certificateName}
                              </td>
                              <td className="border px-2 py-1 whitespace-nowrap">
                                {new Date(
                                  cert.receivedDate
                                ).toLocaleDateString()}
                              </td>
                              <td className="border px-2 py-1 whitespace-nowrap">
                                {new Date(
                                  cert.expirationDate
                                ).toLocaleDateString()}
                              </td>
                              <td className="border px-2 py-1 whitespace-nowrap">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCertificate(cert)}
                                >
                                  {t("edit")}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">
                        {t("addNewCertificate")}
                      </h4>
                      <div className="space-y-2">
                        <input
                          name="certificateName"
                          placeholder={t("certificateName")}
                          value={newCertificate.certificateName}
                          onChange={handleNewCertChange}
                          className="w-full border px-3 py-2 rounded"
                        />
                        <input
                          name="receivedDate"
                          type="date"
                          value={newCertificate.receivedDate}
                          onChange={handleNewCertChange}
                          className="w-full border px-3 py-2 rounded"
                        />
                        <input
                          name="expirationDate"
                          type="date"
                          value={newCertificate.expirationDate}
                          onChange={handleNewCertChange}
                          className="w-full border px-3 py-2 rounded"
                        />
                        <Button onClick={handleAddCertificate}>
                          {t("addCertificate")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 text-right text-white">
              <Button variant="outline" onClick={onClose}>
                {t("close")}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
