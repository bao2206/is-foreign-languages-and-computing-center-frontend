import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../../components/Button";
import { useTranslation } from "react-i18next";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import {
  getAllConsultations as fetchContacts,
  createAdminConsultation as createContact,
  updateConsultation,
  deleteConsultation,
  getConsultation,
} from "../../services/ContactService";
import { fetchCourses } from "../../services/ManagementCourse";
import "bootstrap/dist/css/bootstrap.css";

const ContactPage = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    consultationContent: "",
    status: "pending",
    notes: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    assignedCourse: ""
  });
  const [errors, setErrors] = useState({});
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    consultationContent: "",
    status: "",
    notes: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    assignedCourse: ""
  });

  const { t } = useTranslation();

  // Email and phone validation regex
  const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await fetchCourses();
        if (coursesData && Array.isArray(coursesData)) {
          setCourses(coursesData);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchContacts({
          search: searchTerm,
          status: filter !== "" ? filter : undefined,
          page,
          limit,
        });
        console.log("API Response:", response);

        if (response.success) {
          setContacts(response.data || []);
          setFilteredContacts(response.data || []);
          setTotal(response.pagination?.total || 0);
          setTotalPages(response.pagination?.pages || 1);
          setPage(response.pagination?.page || 1);
        } else {
          console.error("API returned unsuccessful response:", response);
          setContacts([]);
          setFilteredContacts([]);
          setTotal(0);
          setTotalPages(1);
          setPage(1);
        }
      } catch (error) {
        console.error("Error loading contacts:", error);
        setContacts([]);
        setFilteredContacts([]);
        setTotal(0);
        setTotalPages(1);
        setPage(1);
      }
    };
    loadData();
  }, [searchTerm, filter, page, limit]);

  const validateForm = () => {
    const newErrors = {};
    if (!newContact.name.trim()) newErrors.name = t("nameRequired");
    if (!emailRegex.test(newContact.email)) newErrors.email = t("invalidEmail");
    if (newContact.phone && !phoneRegex.test(newContact.phone))
      newErrors.phone = t("invalidPhone");
    if (!newContact.consultationContent.trim())
      newErrors.consultationContent = t("messageRequired");
    if (!newContact.status) newErrors.status = t("statusRequired");
    if (newContact.parentEmail && !emailRegex.test(newContact.parentEmail))
      newErrors.parentEmail = t("invalidEmail");
    if (newContact.parentPhone && !phoneRegex.test(newContact.parentPhone))
      newErrors.parentPhone = t("invalidPhone");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddContact = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const createdContact = await createContact(newContact);
      setContacts((prev) => [...prev, createdContact.data]);
      setFilteredContacts((prev) => [...prev, createdContact.data]);
      setIsAddDialogOpen(false);
      setNewContact({
        name: "",
        email: "",
        phone: "",
        consultationContent: "",
        status: "pending",
        notes: "",
        parentName: "",
        parentPhone: "",
        parentEmail: "",
        assignedCourse: ""
      });
      setErrors({});
    } catch (error) {
      console.error("Error creating contact:", error);
      // Display the error message from the backend
      setErrors({
        submit: error.message || t("failedToCreateContact"),
      });
      // You might want to add a toast notification here
      alert(error.message || t("failedToCreateContact"));
    }
  };

  const handleNewContactChange = (e) => {
    const { name, value } = e.target;
    setNewContact((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleViewContact = async (contactId) => {
    try {
      const response = await getConsultation(contactId);
      setSelectedContact(response.data);
      setEditForm({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        consultationContent: response.data.consultationContent,
        status: response.data.status,
        notes: response.data.notes || "",
        parentName: response.data.parentName || "",
        parentPhone: response.data.parentPhone || "",
        parentEmail: response.data.parentEmail || "",
        assignedCourse: response.data.assignedCourse || ""
      });
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error("Error fetching contact details:", error);
      alert(error.message || t("failedToFetchContact"));
    }
  };

  const handleEditSubmit = async () => {
    try {
      const response = await updateConsultation(selectedContact._id, editForm);
      // Update the contact in the list
      setContacts((prev) =>
        prev.map((contact) =>
          contact._id === selectedContact._id ? response.data : contact
        )
      );
      setFilteredContacts((prev) =>
        prev.map((contact) =>
          contact._id === selectedContact._id ? response.data : contact
        )
      );
      setIsEditing(false);
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error("Error updating contact:", error);
      alert(error.message || t("failedToUpdateContact"));
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteContact = async () => {
    if (window.confirm(t("confirmDeleteContact"))) {
      try {
        await deleteConsultation(selectedContact._id);
        // Remove the contact from the lists
        setContacts((prev) =>
          prev.filter((contact) => contact._id !== selectedContact._id)
        );
        setFilteredContacts((prev) =>
          prev.filter((contact) => contact._id !== selectedContact._id)
        );
        setIsViewDialogOpen(false);
      } catch (error) {
        console.error("Error deleting contact:", error);
        alert(error.message || t("failedToDeleteContact"));
      }
    }
  };

  // Add this function after the useEffect hooks
  const getCourseName = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    return course ? course.coursename : t("selectCourse");
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          <h2>{t("contactManagement")}</h2>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder={t("searchContacts")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="input-group-text">
              <Search size={20} />
            </span>
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">{t("allStatus")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="processed">{t("processed")}</option>
            <option value="cancelled">{t("cancelled")}</option>
            <option value="class_assigned">{t("class_assigned")}</option>
          </select>
        </div>
        <div className="col-md-3 text-end">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="btn btn-outline-primary"
          >
            {t("addNewContact")}
          </Button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="row">
        <div className="col">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>{t("contactForm.name")}</th>
                  <th>{t("contactForm.email")}</th>
                  <th>{t("contactForm.phone")}</th>
                  {/* <th>{t("contactForm.subject")}</th> */}
                  <th>{t("contactForm.status")}</th>
                  {/* <th>{t("actions")}</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact._id}>
                    <td>{contact.name}</td>
                    <td>{contact.email}</td>
                    <td>{contact.phone}</td>
                    {/* <td>{contact.subject}</td> */}
                    <td>
                      <span
                        className={`badge ${
                          contact.status === "processed"
                            ? "bg-success"
                            : contact.status === "cancelled"
                            ? "bg-danger"
                            : contact.status === "class_assigned"
                            ? "bg-info"
                            : "bg-secondary"
                        }`}
                      >
                        {t(contact.status)}
                      </span>
                    </td>
                    <td>
                      <Button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleViewContact(contact._id)}
                      >
                        {t("view")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="row mt-4">
        <div className="col">
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link btn-outline-primary"
                  onClick={() => handlePageChange(page - 1)}
                >
                  {t("previous")}
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li
                  key={index + 1}
                  className={`page-item ${page === index + 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link btn-outline-primary"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link btn-outline-primary"
                  onClick={() => handlePageChange(page + 1)}
                >
                  {t("next")}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Add Contact Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setNewContact({
            name: "",
            email: "",
            phone: "",
            consultationContent: "",
            status: "pending",
            notes: "",
            parentName: "",
            parentPhone: "",
            parentEmail: "",
            assignedCourse: ""
          });
          setErrors({});
        }}
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Dialog.Panel className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("addNewContact")}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsAddDialogOpen(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                {/* Student Information */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("name")}</label>
                  <input
                    type="text"
                    name="name"
                    value={newContact.name}
                    onChange={handleNewContactChange}
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    required
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("email")}</label>
                  <input
                    type="email"
                    name="email"
                    value={newContact.email}
                    onChange={handleNewContactChange}
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("phone")}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newContact.phone}
                    onChange={handleNewContactChange}
                    className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                    required
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("assignedCourse")}</label>
                  <select
                    name="assignedCourse"
                    value={newContact.assignedCourse}
                    onChange={handleNewContactChange}
                    className="form-select"
                  >
                    <option value="">{t("selectCourse")}</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.coursename}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Parent Information */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("parentName")}</label>
                  <input
                    type="text"
                    name="parentName"
                    value={newContact.parentName}
                    onChange={handleNewContactChange}
                    className="form-control"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("parentPhone")}</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={newContact.parentPhone}
                    onChange={handleNewContactChange}
                    className={`form-control ${errors.parentPhone ? "is-invalid" : ""}`}
                  />
                  {errors.parentPhone && (
                    <div className="invalid-feedback">{errors.parentPhone}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("parentEmail")}</label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={newContact.parentEmail}
                    onChange={handleNewContactChange}
                    className={`form-control ${errors.parentEmail ? "is-invalid" : ""}`}
                  />
                  {errors.parentEmail && (
                    <div className="invalid-feedback">{errors.parentEmail}</div>
                  )}
                </div>

                {/* Consultation Details */}
                <div className="col-12 mb-3">
                  <label className="form-label">{t("contactForm.consultationContent")}</label>
                  <textarea
                    name="consultationContent"
                    value={newContact.consultationContent}
                    onChange={handleNewContactChange}
                    className={`form-control ${errors.consultationContent ? "is-invalid" : ""}`}
                    rows="4"
                    required
                  />
                  {errors.consultationContent && (
                    <div className="invalid-feedback">{errors.consultationContent}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("status")}</label>
                  <select
                    name="status"
                    value={newContact.status}
                    onChange={handleNewContactChange}
                    className={`form-select ${errors.status ? "is-invalid" : ""}`}
                    required
                  >
                    <option value="pending">{t("pending")}</option>
                    <option value="processed">{t("processed")}</option>
                    <option value="cancelled">{t("cancelled")}</option>
                    <option value="class_assigned">{t("class_assigned")}</option>
                  </select>
                  {errors.status && (
                    <div className="invalid-feedback">{errors.status}</div>
                  )}
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">{t("notes")}</label>
                  <textarea
                    name="notes"
                    value={newContact.notes}
                    onChange={handleNewContactChange}
                    className="form-control"
                    rows="3"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button className="btn btn-primary" onClick={handleAddContact}>
                {t("add")}
              </Button>
              <Button
                className="btn btn-secondary"
                onClick={() => setIsAddDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* View/Edit Contact Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setIsEditing(false);
        }}
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Dialog.Panel className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEditing ? t("editContact") : t("viewContact")}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setIsEditing(false);
                }}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                {/* Student Information */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("name")}</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("email")}</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("phone")}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditFormChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("assignedCourse")}</label>
                  <select
                    name="assignedCourse"
                    value={editForm.assignedCourse}
                    onChange={handleEditFormChange}
                    className="form-select"
                    disabled={!isEditing}
                  >
                    <option value="">{t("selectCourse")}</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.coursename}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Parent Information */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("parentName")}</label>
                  <input
                    type="text"
                    name="parentName"
                    value={editForm.parentName}
                    onChange={handleEditFormChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("parentPhone")}</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={editForm.parentPhone}
                    onChange={handleEditFormChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("parentEmail")}</label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={editForm.parentEmail}
                    onChange={handleEditFormChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>

                {/* Consultation Details */}
                <div className="col-12 mb-3">
                  <label className="form-label">{t("contactForm.consultationContent")}</label>
                  <textarea
                    name="consultationContent"
                    value={editForm.consultationContent}
                    onChange={handleEditFormChange}
                    className="form-control"
                    rows="4"
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("assignedCourse")}</label>
                  <div className="form-control bg-light">
                    {getCourseName(editForm.assignedCourse)}
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("status")}</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditFormChange}
                    className="form-select"
                    disabled={!isEditing}
                  >
                    <option value="pending">{t("pending")}</option>
                    <option value="processed">{t("processed")}</option>
                    <option value="cancelled">{t("cancelled")}</option>
                    <option value="class_assigned">{t("class_assigned")}</option>
                  </select>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">{t("notes")}</label>
                  <textarea
                    name="notes"
                    value={editForm.notes}
                    onChange={handleEditFormChange}
                    className="form-control"
                    rows="3"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {isEditing ? (
                <>
                  <Button className="btn btn-primary" onClick={handleEditSubmit}>
                    {t("save")}
                  </Button>
                  <Button
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    {t("cancel")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    {t("edit")}
                  </Button>
                  <Button
                    className="btn btn-danger"
                    onClick={handleDeleteContact}
                  >
                    {t("delete")}
                  </Button>
                  <Button
                    className="btn btn-secondary"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    {t("close")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

export default ContactPage;
