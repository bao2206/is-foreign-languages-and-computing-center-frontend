import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "../../components/Button";
import {
  getScheduleByTeacherId,
  getScheduleByStudentId,
} from "../../services/ScheduleService";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  getClassForTeacher,
  getClassForStudent,
} from "../../services/ClassService";

import ScheduleHeader from "../../components/Headers/ScheduleHeader";

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

const fetchSchedule = async () => {
  const role = localStorage.getItem("userRole");
  if (role === "6800d06932b289b2fe5b0409") {
    return await getScheduleByTeacherId();
  } else if (role === "6800d06932b289b2fe5b0403") {
    return await getScheduleByStudentId();
  }
  return [];
};

const fetchClasses = async () => {
  const role = localStorage.getItem("userRole");
  if (role === "6800d06932b289b2fe5b0409") {
    return await getClassForTeacher();
  } else if (role === "6800d06932b289b2fe5b0403") {
    return await getClassForStudent();
  }
  return [];
};

const SchedulePage = () => {
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const scheduleData = await fetchSchedule();
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

        const classesData = await fetchClasses();

        setClasses(classesData);
      } catch (error) {
        console.error("Error loading data:", error);
        setSchedule([]);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId, userRole]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor:
        event.status === "Scheduled"
          ? "#4CAF50"
          : event.status === "Cancel"
          ? "#EF4444"
          : "#F59E0B",
      borderRadius: "5px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return { style };
  };

  // Custom toolbar for navigation and view switching
  const CustomToolbar = (toolbar) => (
    <div className="flex items-center justify-between mb-4">
      <div>
        <button
          className="px-2 py-1 mr-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => toolbar.onNavigate("PREV")}
        >
          {t("previous")}
        </button>
        <button
          className="px-2 py-1 mr-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => toolbar.onNavigate("TODAY")}
        >
          {t("today")}
        </button>
        <button
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => toolbar.onNavigate("NEXT")}
        >
          {t("next")}
        </button>
      </div>
      <span className="font-semibold text-lg">{toolbar.label}</span>
      <div>
        <button
          className={`px-2 py-1 mr-2 rounded ${
            toolbar.view === "month"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => toolbar.onView("month")}
        >
          {t("month")}
        </button>
        <button
          className={`px-2 py-1 mr-2 rounded ${
            toolbar.view === "week"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => toolbar.onView("week")}
        >
          {t("week")}
        </button>
        <button
          className={`px-2 py-1 rounded ${
            toolbar.view === "day"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => toolbar.onView("day")}
        >
          {t("day")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <ScheduleHeader
        userRole={userRole}
        t={t}
        view={view}
        setView={setView}
        date={date}
        setDate={setDate}
        CustomToolbar={CustomToolbar}
      />
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
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            components={{
              toolbar: CustomToolbar,
            }}
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
