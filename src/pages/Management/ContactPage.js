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
  getConsultation 
} from "../../services/ContactService";
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
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    courseInterest: "",
    consultationContent: "",
    status: "pending",
    notes: ""
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
    notes: ""
  });

  const { t } = useTranslation();

  // Email and phone validation regex
  const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchContacts({
          search: searchTerm,
          status: filter !== "" ? filter : undefined,
          page,
          limit,
        });
        console.log('API Response:', response);
        
        if (response.success) {
          setContacts(response.data || []);
          setFilteredContacts(response.data || []);
          setTotal(response.pagination?.total || 0);
          setTotalPages(response.pagination?.pages || 1);
          setPage(response.pagination?.page || 1);
        } else {
          console.error('API returned unsuccessful response:', response);
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
    if (newContact.phone && !phoneRegex.test(newContact.phone)) newErrors.phone = t("invalidPhone");
    if (!newContact.consultationContent.trim()) newErrors.consultationContent = t("messageRequired");
    if (!newContact.status) newErrors.status = t("statusRequired");
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
        courseInterest: "",
        consultationContent: "",
        status: "pending",
        notes: ""
      });
      setErrors({});
    } catch (error) {
      console.error("Error creating contact:", error);
      // Display the error message from the backend
      setErrors({
        submit: error.message || t("failedToCreateContact")
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
        notes: response.data.notes || ""
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
      setContacts(prev => 
        prev.map(contact => 
          contact._id === selectedContact._id ? response.data : contact
        )
      );
      setFilteredContacts(prev => 
        prev.map(contact => 
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
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteContact = async () => {
    if (window.confirm(t("confirmDeleteContact"))) {
      try {
        await deleteConsultation(selectedContact._id);
        // Remove the contact from the lists
        setContacts(prev => prev.filter(contact => contact._id !== selectedContact._id));
        setFilteredContacts(prev => prev.filter(contact => contact._id !== selectedContact._id));
        setIsViewDialogOpen(false);
      } catch (error) {
        console.error("Error deleting contact:", error);
        alert(error.message || t("failedToDeleteContact"));
      }
    }
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
                      <span className={`badge ${contact.status === 'processed' ? 'bg-success' : 
                        contact.status === 'cancelled' ? 'bg-danger' : 
                        contact.status === 'class_assigned' ? 'bg-info' : 'bg-secondary'}`}>
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
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
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
                  className={`page-item ${page === index + 1 ? 'active' : ''}`}
                >
                  <button
                    className="page-link btn-outline-primary"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
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
        onClose={() => setIsAddDialogOpen(false)}
        className="modal fade show"
        style={{ display: isAddDialogOpen ? 'block' : 'none' }}
      >
        <div className="modal-dialog">
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
              <form>
                <div className="mb-3">
                  <label className="form-label">{t("name")}</label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    name="name"
                    value={newContact.name}
                    onChange={handleNewContactChange}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">{t("email")}</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    name="email"
                    value={newContact.email}
                    onChange={handleNewContactChange}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">{t("phone")}</label>
                  <input
                    type="tel"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    name="phone"
                    value={newContact.phone}
                    onChange={handleNewContactChange}
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">{t("message")}</label>
                  <textarea
                    className={`form-control ${errors.consultationContent ? 'is-invalid' : ''}`}
                    name="consultationContent"
                    value={newContact.consultationContent}
                    onChange={handleNewContactChange}
                    rows="4"
                  ></textarea>
                  {errors.consultationContent && (
                    <div className="invalid-feedback">{errors.consultationContent}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">{t("status")}</label>
                  <select
                    className="form-select"
                    name="status"
                    value={newContact.status}
                    onChange={handleNewContactChange}
                  >
                    <option value="pending">{t("pending")}</option>
                    <option value="processed">{t("processed")}</option>
                    <option value="cancelled">{t("cancelled")}</option>
                    <option value="class_assigned">{t("class_assigned")}</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">{t("notes")}</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    value={newContact.notes}
                    onChange={handleNewContactChange}
                    rows="2"
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <Button
                className="btn btn-outline-secondary"
                onClick={() => setIsAddDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button 
                className="btn btn-outline-primary"
                onClick={handleAddContact}
              >
                {t("save")}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* View/Edit Contact Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setIsEditing(false);
        }}
        className="modal fade show"
        style={{ display: isViewDialogOpen ? 'block' : 'none' }}
      >
        <div className="modal-dialog modal-lg">
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
              {selectedContact && (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("name")}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditFormChange}
                      />
                    ) : (
                      <p className="form-control-plaintext">{selectedContact.name}</p>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("email")}</label>
                    {isEditing ? (
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditFormChange}
                      />
                    ) : (
                      <p className="form-control-plaintext">{selectedContact.email}</p>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("phone")}</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditFormChange}
                      />
                    ) : (
                      <p className="form-control-plaintext">{selectedContact.phone}</p>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("status")}</label>
                    {isEditing ? (
                      <select
                        className="form-select"
                        name="status"
                        value={editForm.status}
                        onChange={handleEditFormChange}
                      >
                        <option value="pending">{t("pending")}</option>
                        <option value="processed">{t("processed")}</option>
                        <option value="cancelled">{t("cancelled")}</option>
                        <option value="class_assigned">{t("class_assigned")}</option>
                      </select>
                    ) : (
                      <p className="form-control-plaintext">
                        <span className={`badge ${selectedContact.status === 'processed' ? 'bg-success' : 
                          selectedContact.status === 'cancelled' ? 'bg-danger' : 
                          selectedContact.status === 'class_assigned' ? 'bg-info' : 'bg-secondary'}`}>
                          {t(selectedContact.status)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">{t("message")}</label>
                    {isEditing ? (
                      <textarea
                        className="form-control"
                        name="consultationContent"
                        value={editForm.consultationContent}
                        onChange={handleEditFormChange}
                        rows="4"
                      ></textarea>
                    ) : (
                      <p className="form-control-plaintext">{selectedContact.consultationContent}</p>
                    )}
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">{t("notes")}</label>
                    {isEditing ? (
                      <textarea
                        className="form-control"
                        name="notes"
                        value={editForm.notes}
                        onChange={handleEditFormChange}
                        rows="2"
                      ></textarea>
                    ) : (
                      <p className="form-control-plaintext">{selectedContact.notes || "-"}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button
                className="btn btn-outline-danger me-auto"
                onClick={handleDeleteContact}
              >
                {t("delete")}
              </Button>
              <Button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setIsEditing(false);
                }}
              >
                {t("close")}
              </Button>
              {!isEditing ? (
                <Button
                  className="btn btn-outline-primary"
                  onClick={() => setIsEditing(true)}
                >
                  {t("edit")}
                </Button>
              ) : (
                <Button
                  className="btn btn-outline-success"
                  onClick={handleEditSubmit}
                >
                  {t("save")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ContactPage; 