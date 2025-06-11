import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../../components/Button";
import { useTranslation } from "react-i18next";
import { Search, Download, Filter, Plus } from "lucide-react";
import {
  getFinancialSummary,
  getFinancialRecords,
  getFinancialRecord,
  createPayment,
  updatePayment,
  deletePayment,
  downloadInvoice
} from "../../services/FinanceService";
import "bootstrap/dist/css/bootstrap.css";

const FinancePage = () => {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for financial data
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    monthlyAverage: 0
  });
  const [financialRecords, setFinancialRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // State for new payment form
  const [newPayment, setNewPayment] = useState({
    studentName: "",
    course: "",
    amount: "",
    paymentDate: "",
    status: "pending",
    paymentMethod: "",
    notes: ""
  });

  // Add validation state
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [searchTerm, selectedStatus, selectedDateRange, page]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load summary data
      const summaryData = await getFinancialSummary();
      setSummary(summaryData);

      // Load financial records
      const recordsData = await getFinancialRecords({
        search: searchTerm,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate,
        page,
        limit
      });

      setFinancialRecords(recordsData.data);
      setTotalPages(recordsData.pagination?.pages || 1);
    } catch (err) {
      setError(err.message || t("errorLoadingData"));
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = async (id) => {
    try {
      const record = await getFinancialRecord(id);
      setSelectedRecord(record);
      setIsViewDialogOpen(true);
    } catch (err) {
      setError(err.message || t("errorLoadingRecord"));
    }
  };

  const handleDownloadInvoice = async (id) => {
    try {
      const blob = await downloadInvoice(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || t("errorDownloadingInvoice"));
    }
  };

  // Validation function
  const validateForm = (formData) => {
    const errors = {};
    
    if (!formData.studentName.trim()) {
      errors.studentName = t("studentNameRequired");
    }
    
    if (!formData.course.trim()) {
      errors.course = t("courseRequired");
    }
    
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = t("amountRequired");
    }
    
    if (!formData.paymentDate) {
      errors.paymentDate = t("paymentDateRequired");
    }
    
    if (!formData.paymentMethod) {
      errors.paymentMethod = t("paymentMethodRequired");
    }

    return errors;
  };

  // Update handleAddPayment with validation
  const handleAddPayment = async () => {
    const errors = validateForm(newPayment);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await createPayment(newPayment);
      setIsAddDialogOpen(false);
      setNewPayment({
        studentName: "",
        course: "",
        amount: "",
        paymentDate: "",
        status: "pending",
        paymentMethod: "",
        notes: ""
      });
      setFormErrors({});
      loadData();
    } catch (err) {
      setError(err.message || t("errorCreatingPayment"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update handleNewPaymentChange to clear errors
  const handleNewPaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for the field being changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Add delete functionality
  const handleDeletePayment = async (id) => {
    if (window.confirm(t("confirmDeletePayment"))) {
      try {
        setError(null);
        await deletePayment(id);
        loadData();
      } catch (err) {
        setError(err.message || t("errorDeletingPayment"));
      }
    }
  };

  return (
    <div className="container-fluid">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col">
          <h2>{t("financeManagement")}</h2>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">{t("totalRevenue")}</h6>
              <h3 className="card-title">{summary.totalRevenue.toLocaleString('vi-VN')} VND</h3>
              <p className="card-text text-success">+15% from last month</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">{t("pendingPayments")}</h6>
              <h3 className="card-title">{summary.pendingPayments.toLocaleString('vi-VN')} VND</h3>
              <p className="card-text text-warning">3 payments pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">{t("overduePayments")}</h6>
              <h3 className="card-title">{summary.overduePayments.toLocaleString('vi-VN')} VND</h3>
              <p className="card-text text-danger">2 payments overdue</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">{t("monthlyAverage")}</h6>
              <h3 className="card-title">{summary.monthlyAverage.toLocaleString('vi-VN')} VND</h3>
              <p className="card-text text-info">Last 6 months</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder={t("searchPayments")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="input-group-text">
              <Search size={20} />
            </span>
          </div>
        </div>
        <div className="col-md-3">
          <Button
            className="btn btn-outline-secondary w-100"
            onClick={() => setIsFilterDialogOpen(true)}
          >
            <Filter size={20} className="me-2" />
            {t("filter")}
          </Button>
        </div>
        <div className="col-md-3 text-end">
          <Button
            className="btn btn-outline-primary"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus size={20} className="me-2" />
            {t("addPayment")}
          </Button>
        </div>
      </div>

      {/* Financial Records Table */}
      <div className="row">
        <div className="col">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>{t("invoiceNumber")}</th>
                  <th>{t("studentName")}</th>
                  <th>{t("course")}</th>
                  <th>{t("amount")}</th>
                  <th>{t("paymentDate")}</th>
                  <th>{t("status")}</th>
                  <th>{t("paymentMethod")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {financialRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.invoiceNumber}</td>
                    <td>{record.studentName}</td>
                    <td>{record.course}</td>
                    <td>{record.amount.toLocaleString('vi-VN')} VND</td>
                    <td>{record.paymentDate}</td>
                    <td>
                      <span className={`badge ${
                        record.status === 'paid' ? 'bg-success' :
                        record.status === 'pending' ? 'bg-warning' :
                        'bg-danger'
                      }`}>
                        {t(record.status)}
                      </span>
                    </td>
                    <td>{record.paymentMethod}</td>
                    <td>
                      <Button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => handleViewRecord(record.id)}
                      >
                        {t("view")}
                      </Button>
                      <Button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleDownloadInvoice(record.id)}
                      >
                        <Download size={16} />
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

      {/* Update Add Payment Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setFormErrors({});
        }}
        className="modal fade show"
        style={{ display: isAddDialogOpen ? 'block' : 'none' }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("addPayment")}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setFormErrors({});
                }}
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">{t("studentName")}</label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.studentName ? 'is-invalid' : ''}`}
                    name="studentName"
                    value={newPayment.studentName}
                    onChange={handleNewPaymentChange}
                    required
                  />
                  {formErrors.studentName && (
                    <div className="invalid-feedback">{formErrors.studentName}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">{t("course")}</label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.course ? 'is-invalid' : ''}`}
                    name="course"
                    value={newPayment.course}
                    onChange={handleNewPaymentChange}
                    required
                  />
                  {formErrors.course && (
                    <div className="invalid-feedback">{formErrors.course}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">{t("amount")}</label>
                  <input
                    type="number"
                    className={`form-control ${formErrors.amount ? 'is-invalid' : ''}`}
                    name="amount"
                    value={newPayment.amount}
                    onChange={handleNewPaymentChange}
                    required
                    min="0"
                  />
                  {formErrors.amount && (
                    <div className="invalid-feedback">{formErrors.amount}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">{t("paymentDate")}</label>
                  <input
                    type="date"
                    className={`form-control ${formErrors.paymentDate ? 'is-invalid' : ''}`}
                    name="paymentDate"
                    value={newPayment.paymentDate}
                    onChange={handleNewPaymentChange}
                    required
                  />
                  {formErrors.paymentDate && (
                    <div className="invalid-feedback">{formErrors.paymentDate}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">{t("status")}</label>
                  <select
                    className="form-select"
                    name="status"
                    value={newPayment.status}
                    onChange={handleNewPaymentChange}
                    required
                  >
                    <option value="pending">{t("pending")}</option>
                    <option value="paid">{t("paid")}</option>
                    <option value="overdue">{t("overdue")}</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">{t("paymentMethod")}</label>
                  <select
                    className={`form-select ${formErrors.paymentMethod ? 'is-invalid' : ''}`}
                    name="paymentMethod"
                    value={newPayment.paymentMethod}
                    onChange={handleNewPaymentChange}
                    required
                  >
                    <option value="">{t("selectPaymentMethod")}</option>
                    <option value="cash">{t("cash")}</option>
                    <option value="bank_transfer">{t("bankTransfer")}</option>
                    <option value="credit_card">{t("creditCard")}</option>
                  </select>
                  {formErrors.paymentMethod && (
                    <div className="invalid-feedback">{formErrors.paymentMethod}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">{t("notes")}</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    value={newPayment.notes}
                    onChange={handleNewPaymentChange}
                    rows="3"
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <Button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setFormErrors({});
                }}
                disabled={isSubmitting}
              >
                {t("cancel")}
              </Button>
              <Button
                className="btn btn-outline-primary"
                onClick={handleAddPayment}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {t("saving")}
                  </>
                ) : (
                  t("save")
                )}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Update View Record Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        className="modal fade show"
        style={{ display: isViewDialogOpen ? 'block' : 'none' }}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("paymentDetails")}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsViewDialogOpen(false)}
              ></button>
            </div>
            <div className="modal-body">
              {selectedRecord && (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("invoiceNumber")}</label>
                    <p className="form-control-plaintext">{selectedRecord.invoiceNumber}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("studentName")}</label>
                    <p className="form-control-plaintext">{selectedRecord.studentName}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("course")}</label>
                    <p className="form-control-plaintext">{selectedRecord.course}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("amount")}</label>
                    <p className="form-control-plaintext">{selectedRecord.amount.toLocaleString('vi-VN')} VND</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("paymentDate")}</label>
                    <p className="form-control-plaintext">{selectedRecord.paymentDate}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("status")}</label>
                    <p className="form-control-plaintext">
                      <span className={`badge ${
                        selectedRecord.status === 'paid' ? 'bg-success' :
                        selectedRecord.status === 'pending' ? 'bg-warning' :
                        'bg-danger'
                      }`}>
                        {t(selectedRecord.status)}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("paymentMethod")}</label>
                    <p className="form-control-plaintext">{t(selectedRecord.paymentMethod)}</p>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">{t("notes")}</label>
                    <p className="form-control-plaintext">{selectedRecord.notes || "-"}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button
                className="btn btn-outline-danger me-auto"
                onClick={() => handleDeletePayment(selectedRecord?.id)}
              >
                {t("delete")}
              </Button>
              <Button
                className="btn btn-outline-secondary"
                onClick={() => setIsViewDialogOpen(false)}
              >
                {t("close")}
              </Button>
              <Button
                className="btn btn-outline-primary"
                onClick={() => handleDownloadInvoice(selectedRecord?.id)}
              >
                <Download size={16} className="me-2" />
                {t("downloadInvoice")}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        className="modal fade show"
        style={{ display: isFilterDialogOpen ? 'block' : 'none' }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("filterPayments")}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsFilterDialogOpen(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">{t("dateRange")}</label>
                <div className="row">
                  <div className="col">
                    <input
                      type="date"
                      className="form-control"
                      value={selectedDateRange.startDate}
                      onChange={(e) => setSelectedDateRange(prev => ({
                        ...prev,
                        startDate: e.target.value
                      }))}
                    />
                  </div>
                  <div className="col">
                    <input
                      type="date"
                      className="form-control"
                      value={selectedDateRange.endDate}
                      onChange={(e) => setSelectedDateRange(prev => ({
                        ...prev,
                        endDate: e.target.value
                      }))}
                    />
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">{t("status")}</label>
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">{t("allStatus")}</option>
                  <option value="paid">{t("paid")}</option>
                  <option value="pending">{t("pending")}</option>
                  <option value="overdue">{t("overdue")}</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <Button
                className="btn btn-outline-secondary"
                onClick={() => setIsFilterDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                className="btn btn-outline-primary"
                onClick={() => {
                  setIsFilterDialogOpen(false);
                  loadData();
                }}
              >
                {t("apply")}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default FinancePage; 