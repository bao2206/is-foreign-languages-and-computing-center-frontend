import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../../components/Button";
import { useTranslation } from "react-i18next";
import StaffInformation from "../../components/Dialogs/StaffInformation";
import {
  fetchStaffs,
  createStaff,
} from "../../services/ManagementStaffService";
import { fetchRoles } from "../../services/RoleService";
import uploadImages from "../../services/UploadFile";
import "bootstrap/dist/css/bootstrap.css";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

// Regex từ schema
const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
const citizenIDRegex = /^\d{12}$/;

const UserPage = () => {
  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);

  // State cho tìm kiếm, filter, phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState([]);
  const [roleFilter, setRoleFilter] = useState(""); // Lọc theo role
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Đặt limit mặc định
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { t } = useTranslation();
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isShowDialog, setIsShowDialog] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    sex: "male",
    email: "",
    citizenId: "", // Thay citizenID thành citizenId để khớp với API
    phone: "",
    address: { street: "", city: "", country: "" },
    status: "active",
    role: "academic", // Đảm bảo role khớp với API
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Load data
  useEffect(() => {
    const loadRoles = async () => {
      console.log("Fetching roles...");
      try {
        const rolesData = await fetchRoles();
        console.log("Fetched roles:", rolesData);
        setRoles(rolesData);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };
    loadRoles();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const statusFilter = filter !== "" ? filter : undefined;

      const { users, total, currentPage, totalPages } = await fetchStaffs({
        role: roleFilter, // Lọc theo role
        search: searchTerm, // Tìm kiếm theo tên
        status: statusFilter, // Lọc theo trạng thái
        sex: undefined, // Chưa hỗ trợ lọc theo sex, có thể thêm sau
        page,
        limit,
      });
      setStaffs(users);
      setFilteredStaffs(users);
      setTotal(total);
      setTotalPages(totalPages);
      setPage(currentPage);
    };
    loadData();
  }, [searchTerm, roleFilter, filter, page, limit]);

  const validateForm = () => {
    const newErrors = {};
    if (!newStaff.name.trim()) newErrors.name = t("nameRequired");
    if (!emailRegex.test(newStaff.email)) newErrors.email = t("invalidEmail");
    if (!citizenIDRegex.test(newStaff.citizenId))
      newErrors.citizenId = t("invalidCitizenID"); // Thay citizenID thành citizenId
    if (newStaff.phone && !phoneRegex.test(newStaff.phone))
      newErrors.phone = t("invalidPhone");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openStaffDialog = (staff) => {
    setSelectedStaff(staff);
    setIsShowDialog(true);
  };

  const handleAddStaff = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let avatarUrl = "";
      if (avatarFile) {
        const images = await uploadImages(avatarFile, false);
        avatarUrl = images.imageUrls[0] || "";
      }

      const staffData = {
        ...newStaff,
        citizenId: newStaff.citizenId, // Đảm bảo khớp với API
        avatar: avatarUrl,
      };

      const createdStaff = await createStaff(staffData);
      setStaffs((prev) => [...prev, createdStaff.user]);
      setIsAddDialogOpen(false);
      setNewStaff({
        name: "",
        sex: "male",
        email: "",
        citizenId: "",
        phone: "",
        address: { street: "", city: "", country: "" },
        status: "active",
        role: "academic",
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      setErrors({});
    } catch (error) {
      alert(t("failedToCreateStaff"));
    }
  };

  const handleNewStaffChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setNewStaff((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setNewStaff((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePageInputChange = (e) => {
    const value = Number(e.target.value);
    if (value >= 1 && value <= totalPages) {
      setPage(value);
    }
  };

  // Callback để cập nhật danh sách khi có thay đổi từ StaffInformation
  const handleStaffUpdate = (updatedStaff) => {
    setStaffs((prev) =>
      prev.map((staff) =>
        staff._id === updatedStaff._id ? updatedStaff : staff
      )
    );
    setFilteredStaffs((prev) =>
      prev.map((staff) =>
        staff._id === updatedStaff._id ? updatedStaff : staff
      )
    );
    setSelectedStaff(null); // Đóng dialog sau khi cập nhật
    setIsShowDialog(false);
  };

  return (
    <div className="container-fluid mt-4 px-3">
      {/* Thanh tìm kiếm, filter, page input và nút thêm nhân viên */}
      <div className="row mb-4 g-2 flex-wrap flex-md-nowrap align-items-center">
        <div className="col-12 col-md-4 col-lg-3">
          <div className="position-relative">
            <Search
              className="position-absolute"
              style={{
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6c757d",
              }}
              size={18}
            />
            <input
              type="text"
              placeholder={t("searchStaff")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control ps-5"
              style={{ height: "38px" }}
            />
          </div>
        </div>
        <div className="col-12 col-md-3 col-lg-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-select"
            style={{ height: "38px" }}
          >
            <option value="">{t("allRoles")}</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {t(role.name)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-3 col-lg-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
            style={{ height: "38px" }}
          >
            <option value="">{t("status")}</option>
            <option value="active">{t("active")}</option>
            <option value="inactive">{t("inactive")}</option>
          </select>
        </div>
        <div className="col-6 col-md-2 col-lg-2">
          <div className="input-group" style={{ height: "38px" }}>
            <input
              type="number"
              value={page}
              onChange={handlePageInputChange}
              min="1"
              max={totalPages}
              className="form-control"
              style={{ height: "38px", width: "60px" }}
            />
            <button
              className="btn btn-outline-secondary"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              style={{ height: "38px" }}
            >
              <ChevronDown size={18} />
            </button>
            <button
              className="btn btn-outline-secondary"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              style={{ height: "38px" }}
            >
              <ChevronUp size={18} />
            </button>
          </div>
        </div>
        <div className="col-6 col-md-2 col-lg-3">
          <Button
            className="btn btn-primary w-100"
            onClick={() => setIsAddDialogOpen(true)}
          >
            {t("addStaff")}
          </Button>
        </div>
      </div>

      {/* Danh sách nhân viên */}
      <div className="row px-1">
        {filteredStaffs.map((staff) => (
          <div key={staff._id} className="col-12 col-md-6 col-lg-3 mb-4">
            <div className="border border-gray-300 rounded-xl p-4 shadow">
              <img
                src={staff.avatar}
                alt={staff.name}
                className="w-24 h-24 rounded-full object-cover mb-2 mx-auto"
              />
              <h2 className="text-lg font-semibold text-center">
                {staff.name}
              </h2>
              <p>
                {t("email")}: {staff.email}
              </p>
              <p>
                {t("phoneNumber")}: {staff.phone}
              </p>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <p className="mb-0">{t(staff.role)}</p>
                <Button
                  className="btn btn-outline-primary text-blue-600"
                  onClick={() => openStaffDialog(staff)}
                >
                  {t("seeMore")}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div>
            {t("showing")} {filteredStaffs.length} {t("of")} {total}{" "}
            {t("staffs")}
          </div>
          <div className="d-flex gap-2">
            <Button
              className="btn btn-outline-primary"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              {t("previous")}
            </Button>
            <select
              value={page}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="form-select"
              style={{ width: "100px", height: "38px" }}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  {t("page")} {p}
                </option>
              ))}
            </select>
            <Button
              className="btn btn-outline-primary"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}

      {/* Dialog thông tin nhân viên */}
      {isShowDialog && (
        <StaffInformation
          staff={selectedStaff}
          onClose={() => {
            setSelectedStaff(null);
            setIsShowDialog(false);
          }}
          onUpdate={handleStaffUpdate} // Truyền callback
        />
      )}

      {/* Dialog thêm nhân viên */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setNewStaff({
            name: "",
            sex: "male",
            email: "",
            citizenId: "",
            phone: "",
            address: { street: "", city: "", country: "" },
            status: "active",
            role: "academic",
          });
          setAvatarFile(null);
          setAvatarPreview(null);
          setErrors({});
        }}
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Dialog.Panel className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("addNewStaff")}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewStaff({
                    name: "",
                    sex: "male",
                    email: "",
                    citizenId: "",
                    phone: "",
                    address: { street: "", city: "", country: "" },
                    status: "active",
                    role: "academic",
                  });
                  setAvatarFile(null);
                  setAvatarPreview(null);
                  setErrors({});
                }}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                {avatarPreview && (
                  <div className="mt-2 d-flex justify-content-center align-items-center">
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  </div>
                )}
                <label className="form-label">{t("avatar")}</label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="form-control"
                  style={{ height: "38px" }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">{t("staffName")}</label>
                <input
                  type="text"
                  name="name"
                  value={newStaff.name}
                  onChange={handleNewStaffChange}
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  style={{ height: "38px" }}
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">{t("sex")}</label>
                <select
                  name="sex"
                  value={newStaff.sex}
                  onChange={handleNewStaffChange}
                  className="form-select"
                  style={{ height: "38px" }}
                >
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">{t("email")}</label>
                <input
                  type="email"
                  name="email"
                  value={newStaff.email}
                  onChange={handleNewStaffChange}
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  style={{ height: "38px" }}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">{t("citizenID")}</label>
                <input
                  type="text"
                  name="citizenId"
                  value={newStaff.citizenId}
                  onChange={handleNewStaffChange}
                  className={`form-control ${
                    errors.citizenId ? "is-invalid" : ""
                  }`}
                  style={{ height: "38px" }}
                />
                {errors.citizenId && (
                  <div className="invalid-feedback">{errors.citizenId}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">{t("phoneNumber")}</label>
                <input
                  type="text"
                  name="phone"
                  value={newStaff.phone}
                  onChange={handleNewStaffChange}
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  style={{ height: "38px" }}
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">{t("street")}</label>
                <input
                  type="text"
                  name="address.street"
                  value={newStaff.address.street}
                  onChange={handleNewStaffChange}
                  className="form-control"
                  style={{ height: "38px" }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">{t("city")}</label>
                <input
                  type="text"
                  name="address.city"
                  value={newStaff.address.city}
                  onChange={handleNewStaffChange}
                  className="form-control"
                  style={{ height: "38px" }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">{t("country")}</label>
                <input
                  type="text"
                  name="address.country"
                  value={newStaff.address.country}
                  onChange={handleNewStaffChange}
                  className="form-control"
                  style={{ height: "38px" }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">{t("status")}</label>
                <select
                  name="status"
                  value={newStaff.status}
                  onChange={handleNewStaffChange}
                  className="form-select"
                  style={{ height: "38px" }}
                >
                  <option value="active">{t("active")}</option>
                  <option value="inactive">{t("inactive")}</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">{t("role")}</label>
                <select
                  name="role"
                  value={newStaff.role}
                  onChange={handleNewStaffChange}
                  className="form-select"
                  style={{ height: "38px" }}
                >
                  <option value="academic">{t("academic")}</option>
                  <option value="consultant">{t("consultant")}</option>
                  <option value="teacher">{t("teacher")}</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <Button className="btn btn-primary" onClick={handleAddStaff}>
                {t("add")}
              </Button>
              <Button
                className="btn btn-secondary"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewStaff({
                    name: "",
                    sex: "male",
                    email: "",
                    citizenId: "",
                    phone: "",
                    address: { street: "", city: "", country: "" },
                    status: "active",
                    role: "academic",
                  });
                  setAvatarFile(null);
                  setAvatarPreview(null);
                  setErrors({});
                }}
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

export default UserPage;
