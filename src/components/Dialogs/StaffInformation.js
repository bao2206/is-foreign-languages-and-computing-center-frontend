import React, { useState, useEffect, use } from "react";
import { useTranslation } from "react-i18next";
import "bootstrap/dist/css/bootstrap.css";
import { Dialog } from "@headlessui/react";
import {
  fetchCertificatesById,
  updateUser,
  updateRole,
  addCertificate,
  updateCertificate,
  deleteCertificate,
} from "../../services/ManagementUserService";

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
    information: "",
    receivedDate: "",
    expirationDate: "",
  });
  const [roles, setRoles] = useState([]);

  // State for editing certificate dialog
  const [editCertDialogOpen, setEditCertDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [editingCertData, setEditingCertData] = useState({
    certificateName: "",
    information: "",
    receivedDate: "",
    expirationDate: "",
  });

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
      newCertificate.information &&
      newCertificate.receivedDate &&
      newCertificate.expirationDate
    ) {
      addCertificate(selectedStaff._id, newCertificate)
        .then((addedCertificate) => {
          setCertificates((prev) => [...prev, newCertificate]);
          setNewCertificate({
            certificateName: "",
            information: "",
            receivedDate: "",
            expirationDate: "",
          });
        })
        .catch((error) => {
          console.error("Error adding certificate:", error);
          alert(t("failedToAddCertificate"));
        });
    }
  };

  // Open edit certificate dialog
  const handleEditCertificate = (cert) => {
    setEditingCertificate(cert);
    setEditingCertData({
      certificateName: cert.certificateName || "",
      information: cert.information || "",
      receivedDate: cert.receivedDate ? cert.receivedDate.slice(0, 10) : "",
      expirationDate: cert.expirationDate
        ? cert.expirationDate.slice(0, 10)
        : "",
    });
    setEditCertDialogOpen(true);
  };

  // Handle change in edit certificate dialog
  const handleEditingCertChange = (e) => {
    const { name, value } = e.target;
    setEditingCertData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save edited certificate
  const handleSaveEditCertificate = async () => {
    try {
      // You should have an updateCertificate API in your service
      if (!editingCertificate || !editingCertificate._id) return;
      const updatedCert = {
        ...editingCertificate,
        ...editingCertData,
      };
      // Call your updateCertificate API here

      await updateCertificate(updatedCert);
      // Update local state
      setCertificates((prev) =>
        prev.map((c) =>
          c._id === editingCertificate._id ? { ...c, ...editingCertData } : c
        )
      );
      setEditCertDialogOpen(false);
      setEditingCertificate(null);
      console.log("Certificate updated successfully");
    } catch (error) {
      alert(t("failedToUpdateCertificate"));
    }
  };

  const handleSaveEdit = async () => {
    try {
      // Cập nhật thông tin người dùng (name, email, phone, citizenID, address)
      const updatedStaff = await updateUser(selectedStaff._id, editedStaff);

      // Không cho phép cập nhật role ở đây
      // if (editedStaff.role && editedStaff.role !== selectedStaff.role) {
      //   await updateRole(selectedStaff._id, editedStaff.role);
      // }

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

  // State for delete certificate dialog
  const [deleteCertDialogOpen, setDeleteCertDialogOpen] = useState(false);
  const [deletingCertificate, setDeletingCertificate] = useState(null);

  // Open delete certificate dialog
  const handleDeleteCertificate = (cert) => {
    setDeletingCertificate(cert);
    setDeleteCertDialogOpen(true);
  };

  // Confirm delete certificate
  const handleConfirmDeleteCertificate = async () => {
    if (!deletingCertificate || !deletingCertificate._id) return;
    try {
      await deleteCertificate(deletingCertificate._id);
      setCertificates((prev) =>
        prev.filter((c) => c._id !== deletingCertificate._id)
      );
      setDeleteCertDialogOpen(false);
      setDeletingCertificate(null);
    } catch (error) {
      alert(t("failedToDeleteCertificate"));
    }
  };

  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-4xl">
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
                    {/* Không cho phép chỉnh sửa role */}
                    <select
                      name="role"
                      value={editedStaff.role || ""}
                      className="w-full border px-3 py-2 rounded"
                      disabled
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
                <div className="mt-3 flex gap-2">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleViewCertificates}
                  >
                    {showCertificates
                      ? t("hideCertificates")
                      : t("viewCertificates")}
                  </Button>
                  <Button
                    className={
                      editStaffMode
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-yellow-500 hover:bg-yellow-600 text-white"
                    }
                    onClick={() => {
                      if (editStaffMode) handleSaveEdit();
                      else setEditStaffMode(true);
                    }}
                  >
                    {editStaffMode ? t("save") : t("editInfo")}
                  </Button>
                </div>

                {/* {NOTE: Show Certificates} */}
                {showCertificates && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">
                      {t("certificateList")}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-[900px] w-full text-sm text-left border">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-2 py-1 whitespace-nowrap">
                              {t("certificateName")}
                            </th>
                            <th className="border px-2 py-1 whitespace-nowrap">
                              {t("certificateInformation")}
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
                              key={cert._id || idx}
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
                                {cert.information}
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
                              <td className="border px-2 py-1 whitespace-nowrap flex gap-2">
                                <Button
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                  size="sm"
                                  onClick={() => handleEditCertificate(cert)}
                                >
                                  {t("edit")}
                                </Button>
                                <Button
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  size="sm"
                                  onClick={() => handleDeleteCertificate(cert)}
                                >
                                  {t("delete")}
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
                          name="information"
                          placeholder={t("certificateInformation")}
                          value={newCertificate.information}
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
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={handleAddCertificate}
                        >
                          {t("addCertificate")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 text-right">
              <Button
                className="bg-gray-500 hover:bg-gray-600 text-white"
                onClick={onClose}
              >
                {t("close")}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Edit Certificate Dialog */}
      <Dialog
        open={editCertDialogOpen}
        onClose={() => setEditCertDialogOpen(false)}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4">
              {t("editCertificate")}
            </Dialog.Title>
            <div className="space-y-2">
              <input
                name="certificateName"
                placeholder={t("certificateName")}
                value={editingCertData.certificateName}
                onChange={handleEditingCertChange}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                name="information"
                placeholder={t("certificateInformation")}
                value={editingCertData.information}
                onChange={handleEditingCertChange}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                name="receivedDate"
                type="date"
                value={editingCertData.receivedDate}
                onChange={handleEditingCertChange}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                name="expirationDate"
                type="date"
                value={editingCertData.expirationDate}
                onChange={handleEditingCertChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <Button
                className="bg-gray-500 hover:bg-gray-600 text-white"
                onClick={() => setEditCertDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSaveEditCertificate}
              >
                {t("save")}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Certificate Confirmation Dialog */}
      <Dialog
        open={deleteCertDialogOpen}
        onClose={() => setDeleteCertDialogOpen(false)}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4">
              {t("deleteCertificate")}
            </Dialog.Title>
            <div className="mb-4">{t("confirmDeleteCertificate")}</div>
            {deletingCertificate && (
              <div className="mb-4 text-sm text-gray-700">
                <div>
                  <strong>{t("certificateName")}:</strong>{" "}
                  {deletingCertificate.certificateName}
                </div>
                <div>
                  <strong>{t("certificateInformation")}:</strong>{" "}
                  {deletingCertificate.information}
                </div>
                <div>
                  <strong>{t("receivedDate")}:</strong>{" "}
                  {new Date(
                    deletingCertificate.receivedDate
                  ).toLocaleDateString()}
                </div>
                <div>
                  <strong>{t("expirationDate")}:</strong>{" "}
                  {new Date(
                    deletingCertificate.expirationDate
                  ).toLocaleDateString()}
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                className="bg-gray-500 hover:bg-gray-600 text-white"
                onClick={() => setDeleteCertDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmDeleteCertificate}
              >
                {t("delete")}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
