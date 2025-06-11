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
          {/* ...copy phần nội dung dialog thêm lịch học ở đây... */}
          {/* Sử dụng props truyền vào thay vì state nội bộ */}
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
