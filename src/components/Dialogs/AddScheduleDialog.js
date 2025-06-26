import React from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../Button";

const AddScheduleDialog = ({
  open,
  onClose,
  t,
  scheduleType,
  setScheduleType,
  scheduleForm,
  handleScheduleFormChange,
  classItem,
  scheduleErrors,
  handleSubmitSchedule,
  handleCloseAddScheduleDialog,
  selectedDays,
  handleDayCheckbox,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    className="modal show d-block"
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
  >
    <Dialog.Panel className="modal-dialog modal-md">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">{t("addSchedule")}</h5>
          <button
            type="button"
            className="btn-close"
            onClick={handleCloseAddScheduleDialog}
          ></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label className="form-label">{t("scheduleType")}</label>
            <select
              className="form-select"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
            >
              <option value="create">{t("manualCreate")}</option>
              <option value="auto">{t("autoCreate")}</option>
            </select>
          </div>
          {scheduleType === "create" ? (
            <>
              <div className="mb-3">
                <label className="form-label">{t("teacher")}</label>
                <select
                  className="form-select"
                  name="teacher"
                  value={scheduleForm.teacher}
                  onChange={handleScheduleFormChange}
                >
                  <option value=""></option>
                  {classItem.teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">{t("room") || "Phòng"}</label>
                <input
                  type="text"
                  className="form-control"
                  name="room"
                  value={scheduleForm.room}
                  onChange={handleScheduleFormChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">{t("date") || "Ngày"}</label>
                <input
                  type="date"
                  className={`form-control ${
                    scheduleErrors.date ? "is-invalid" : ""
                  }`}
                  name="date"
                  value={scheduleForm.date}
                  onChange={handleScheduleFormChange}
                />
                {scheduleErrors.date && (
                  <div className="invalid-feedback">{scheduleErrors.date}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  {t("startTime") || "Giờ bắt đầu"}
                </label>
                <input
                  type="time"
                  className={`form-control ${
                    scheduleErrors.startTime ? "is-invalid" : ""
                  }`}
                  name="startTime"
                  value={scheduleForm.startTime}
                  onChange={handleScheduleFormChange}
                />
                {scheduleErrors.startTime && (
                  <div className="invalid-feedback">
                    {scheduleErrors.startTime}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  {t("endTime") || "Giờ kết thúc"}
                </label>
                <input
                  type="time"
                  className={`form-control ${
                    scheduleErrors.endTime ? "is-invalid" : ""
                  }`}
                  name="endTime"
                  value={scheduleForm.endTime}
                  onChange={handleScheduleFormChange}
                />
                {scheduleErrors.endTime && (
                  <div className="invalid-feedback">
                    {scheduleErrors.endTime}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  {t("status") || "Trạng thái"}
                </label>
                <select
                  className={`form-select ${
                    scheduleErrors.status ? "is-invalid" : ""
                  }`}
                  name="status"
                  value={scheduleForm.status}
                  onChange={handleScheduleFormChange}
                >
                  <option value="Scheduled">
                    {t("Scheduled") || "Đã lên lịch"}
                  </option>
                  <option value="Cancel">{t("Cancel") || "Hủy"}</option>
                  <option value="make up lesson">
                    {t("makeUpLesson") || "Bù"}
                  </option>
                </select>
                {scheduleErrors.status && (
                  <div className="invalid-feedback">
                    {scheduleErrors.status}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">
                  {t("teacher") || "Giáo viên"}
                </label>
                <select
                  className="form-select"
                  name="teacher"
                  value={scheduleForm.teacher}
                  onChange={handleScheduleFormChange}
                >
                  <option value="">{t("optional") || "Không chọn"}</option>
                  {classItem.teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">{t("room") || "Phòng"}</label>
                <input
                  type="text"
                  className="form-control"
                  name="room"
                  value={scheduleForm.room}
                  onChange={handleScheduleFormChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  {t("numberOfShifts") || "Số buổi"}
                </label>
                <input
                  type="number"
                  className={`form-control ${
                    scheduleErrors.numberOfShift ? "is-invalid" : ""
                  }`}
                  name="numberOfShift"
                  value={scheduleForm.numberOfShift}
                  onChange={handleScheduleFormChange}
                  min="1"
                />
                {scheduleErrors.numberOfShift && (
                  <div className="invalid-feedback">
                    {scheduleErrors.numberOfShift}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  {t("startDate") || "Ngày bắt đầu"}
                </label>
                <input
                  type="date"
                  className={`form-control ${
                    scheduleErrors.startDate ? "is-invalid" : ""
                  }`}
                  name="startDate"
                  value={scheduleForm.startDate}
                  onChange={handleScheduleFormChange}
                />
                {scheduleErrors.startDate && (
                  <div className="invalid-feedback">
                    {scheduleErrors.startDate}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  {t("startTime") || "Giờ bắt đầu"}
                </label>
                <input
                  type="time"
                  className={`form-control ${
                    scheduleErrors.startTime ? "is-invalid" : ""
                  }`}
                  name="startTime"
                  value={scheduleForm.startTime}
                  onChange={handleScheduleFormChange}
                />
                {scheduleErrors.startTime && (
                  <div className="invalid-feedback">
                    {scheduleErrors.startTime}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  {t("endTime") || "Giờ kết thúc"}
                </label>
                <input
                  type="time"
                  className={`form-control ${
                    scheduleErrors.endTime ? "is-invalid" : ""
                  }`}
                  name="endTime"
                  value={scheduleForm.endTime}
                  onChange={handleScheduleFormChange}
                />
                {scheduleErrors.endTime && (
                  <div className="invalid-feedback">
                    {scheduleErrors.endTime}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  {t("scheduleDays") || "Chọn ngày trong tuần"}
                </label>
                <div
                  style={{
                    maxHeight: "120px",
                    overflowY: "auto",
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    padding: "8px",
                  }}
                >
                  {["1", "2", "3", "4", "5", "6", "7"].map((day) => (
                    <div key={day} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`day-${day}`}
                        checked={selectedDays.includes(day)}
                        onChange={() => handleDayCheckbox(day)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`day-${day}`}
                      >
                        {t(`day${day}`) || `Thứ ${parseInt(day) - 1}`}
                      </label>
                    </div>
                  ))}
                </div>
                {scheduleErrors.scheduleDays && (
                  <div className="invalid-feedback">
                    {scheduleErrors.scheduleDays}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <Button className="btn btn-primary" onClick={handleSubmitSchedule}>
            {t("save") || "Lưu"}
          </Button>
          <Button
            className="btn btn-secondary"
            onClick={handleCloseAddScheduleDialog}
          >
            {t("cancel") || "Hủy"}
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
);

export default AddScheduleDialog;
