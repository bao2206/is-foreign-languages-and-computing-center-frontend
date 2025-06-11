import React from "react";

const ScheduleHeader = ({
  userRole,
  t,
  view,
  setView,
  date,
  setDate,
  CustomToolbar,
}) => (
  <div className="mb-6">
    <h1 className="text-2xl font-bold mb-6 text-center">
      {userRole === "6800d06932b289b2fe5b0403"
        ? t("studySchedule")
        : t("teachingSchedule")}
    </h1>
    {/* Nếu muốn dùng CustomToolbar riêng, có thể render ở đây */}
    {/* <CustomToolbar ...props /> */}
  </div>
);

export default ScheduleHeader;
