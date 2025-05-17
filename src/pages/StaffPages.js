import React, { useEffect, useState } from "react";
// import axios from 'axios';
import { Dialog } from "@headlessui/react";
import { Button } from "../components/Button";

import { useTranslation } from "react-i18next";

import StaffInformation from "../components/Dialogs/StaffInformation";

import { fetchStaffs } from "../services/ManagementStaffService";

import "bootstrap/dist/css/bootstrap.css";

const StaffPages = (props) => {
  const [Staffs, setStaffs] = useState([]);
  const [t, i18n] = useTranslation();
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isShowDialog, setIsShowDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const staffs = await fetchStaffs();
      setStaffs(staffs);
    };
    loadData();
  }, []);

  const openStaffDialog = (staff) => {
    setSelectedStaff(staff);
    setIsShowDialog(true);
  };

  return (
    <div className="row">
      {Staffs.map((Staff) => (
        <div key={Staff._id} className="col-12 col-md-6 col-lg-4 mb-4">
          <div className="border border-gray-300 rounded-xl p-4 shadow">
            <img
              src={Staff.avatar || "https://via.placeholder.com/100"}
              alt={Staff.name}
              className="w-24 h-24 rounded-full object-cover mb-2"
            />
            <h2 className="text-lg font-semibold">{Staff.name}</h2>
            <p>
              {t("email")}: {Staff.email}
            </p>
            <p>
              {t("phoneNumber")}: {Staff.phone}
            </p>
            <Button className="mt-2" onClick={() => openStaffDialog(Staff)}>
              {t("seeMore")}
            </Button>
          </div>
        </div>
      ))}

      {isShowDialog && (
        <StaffInformation
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
        />
      )}
    </div>
  );
};

export default StaffPages;
