import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "../../components/Button";
import { fetchClasses, fetchSchedule } from "../../services/ScheduleService";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Thiết lập localizer cho react-big-calendar
const locales = {
  "en-US": require("date-fns/locale/en-US"),
  "vi-VN": require("date-fns/locale/vi"),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const SchedulePage = () => {
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  // Load lịch học/dạy và danh sách lớp
  useEffect(() => {
    const loadData = async () => {
      setLoading(true); // Bắt đầu loading
      try {
        // Lấy lịch học/dạy
        const scheduleData = await fetchSchedule(userId, userRole);
        const formattedSchedule = scheduleData.map((event) => {
          const startDateTime = new Date(event.date);
          const endDateTime = new Date(event.date);
          const [startHours, startMinutes] = event.startTime.split(":");
          const [endHours, endMinutes] = event.endTime.split(":");
          startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));
          endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

          return {
            ...event,
            start: startDateTime,
            end: endDateTime,
            title: `${event.classId.classname} (${event.startTime} - ${
              event.endTime
            }${event.room ? `, ${event.room}` : ""})`,
          };
        });
        setSchedule(formattedSchedule);

        // Lấy danh sách lớp
        const classesData = await fetchClasses(userId, userRole);
        setClasses(classesData);
      } catch (error) {
        console.error("Error loading data:", error);
        setSchedule([]); // Đặt lại lịch trống khi có lỗi
        setClasses([]); // Đặt lại danh sách lớp trống khi có lỗi
      } finally {
        setLoading(false); // Kết thúc loading
      }
    };
    loadData();
  }, [userId, userRole]);

  // Xử lý khi click vào sự kiện trên lịch
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  // Định dạng sự kiện trên lịch
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor:
        event.status === "Scheduled"
          ? "#4CAF50"
          : event.status === "Cancel"
          ? "#EF4444"
          : "#F59E0B", // make up lesson
      borderRadius: "5px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return { style };
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Tiêu đề */}
      <h1 className="text-2xl font-bold mb-6 text-center">
        {userRole === "student" ? t("studySchedule") : t("teachingSchedule")}
      </h1>

      {/* Lịch học/dạy */}
      <div className="mb-8 rounded-lg shadow-md p-4 bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-500">
            <p className="text-gray-500">{t("loading")}</p>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={schedule}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            className="w-full"
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            messages={{
              allDay: t("allDay"),
              previous: t("previous"),
              next: t("next"),
              today: t("today"),
              month: t("month"),
              week: t("week"),
              day: t("day"),
              agenda: t("agenda"),
              date: t("date"),
              time: t("time"),
              event: t("event"),
              noEventsInRange: t("noEventsInRange"),
            }}
          />
        )}
      </div>

      {/* Danh sách lớp tham gia */}
      <h2 className="text-xl font-semibold mb-4 text-center">
        {t("classesParticipating")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-gray-500">
            {t("loading")}
          </p>
        ) : classes.length > 0 ? (
          classes.map((classItem) => (
            <div
              key={classItem._id}
              className="border border-gray-300 rounded-xl p-4 shadow-md bg-white hover:shadow-lg transition-shadow duration-200"
            >
              <h3 className="text-lg font-semibold text-center mb-2">
                {classItem.classname}
              </h3>
              <p className="text-gray-700">
                {t("course")}:{" "}
                <span className="font-medium">
                  {classItem.courseId?.coursename || t("N/A")}
                </span>
              </p>
              <p className="text-gray-700">
                {t("teachers")}:{" "}
                <span className="font-medium">
                  {classItem.teachers?.map((t) => t.name).join(", ") ||
                    t("N/A")}
                </span>
              </p>
              <p className="text-gray-700">
                {t("quantity")}:{" "}
                <span className="font-medium">{classItem.quantity}</span>
              </p>
              <p className="text-gray-700">
                {t("status")}:{" "}
                <span className="font-medium">{t(classItem.status)}</span>
              </p>
              {classItem.daybegin && (
                <p className="text-gray-700">
                  {t("dayBegin")}:{" "}
                  <span className="font-medium">
                    {format(new Date(classItem.daybegin), "dd/MM/yyyy")}
                  </span>
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            {t("noClassesFound")}
          </p>
        )}
      </div>

      {/* Dialog chi tiết sự kiện */}
      {selectedEvent && (
        <Transition appear show={isDialogOpen} as={React.Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={() => setIsDialogOpen(false)}
          >
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h5"
                      className="text-lg font-medium leading-6 text-gray-900 mb-4"
                    >
                      {t("eventDetails")}
                    </Dialog.Title>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-700">
                        <strong>{t("class")}:</strong>{" "}
                        {selectedEvent.classId.classname}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>{t("date")}:</strong>{" "}
                        {format(new Date(selectedEvent.date), "dd/MM/yyyy")}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>{t("startTime")}:</strong>{" "}
                        {selectedEvent.startTime}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>{t("endTime")}:</strong> {selectedEvent.endTime}
                      </p>
                      {selectedEvent.teacher && (
                        <p className="text-sm text-gray-700">
                          <strong>{t("teacher")}:</strong>{" "}
                          {selectedEvent.teacher.name || t("N/A")}
                        </p>
                      )}
                      {selectedEvent.room && (
                        <p className="text-sm text-gray-700">
                          <strong>{t("room")}:</strong> {selectedEvent.room}
                        </p>
                      )}
                      <p className="text-sm text-gray-700">
                        <strong>{t("status")}:</strong>{" "}
                        {t(selectedEvent.status)}
                      </p>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        {t("close")}
                      </Button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
};

export default SchedulePage;
