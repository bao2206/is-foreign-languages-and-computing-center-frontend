import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getUserProfile } from "../../services/auth";
import {
  getScheduleByTeacherId,
  getScheduleByStudentId,
} from "../../services/ScheduleService";

const ScheduleView = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // 'day', 'week', 'month', 'year'
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        fetchSchedules(profile);
        setUser(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch schedules based on user role
  const fetchSchedules = async (user) => {
    setLoading(true);
    try {
      if (user?.authId?.role?.name === "teacher") {
        const schedulesData = await getScheduleByTeacherId(user.id);
        setSchedules(schedulesData);
      } else if (user?.authId?.role?.name === "student") {
        const schedulesData = await getScheduleByStudentId(user.id);
        setSchedules(schedulesData);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Convert date string to weekday name
  const getDayNameFromDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const getScheduleForDay = (dateObj) => {
    return schedules
      .filter((schedule) => {
        if (!schedule.date) return false;
        const scheduleDate = new Date(schedule.date);
        return (
          scheduleDate.getFullYear() === dateObj.getFullYear() &&
          scheduleDate.getMonth() === dateObj.getMonth() &&
          scheduleDate.getDate() === dateObj.getDate()
        );
      })
      .map((schedule) => ({
        ...schedule,
        day: dateObj.toLocaleDateString("en-US", { weekday: "long" }),
        className: schedule.classId?.classname || t("Unnamed Class"),
        classCode: schedule.classId?._id || "N/A",
        lecturerName: schedule.teacher?.name || "N/A",
        type: schedule.type || "lecture",
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "lecture":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "tutorial":
        return "bg-green-100 border-green-300 text-green-800";
      case "lab":
        return "bg-purple-100 border-purple-300 text-purple-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "year":
        newDate.setFullYear(
          newDate.getFullYear() + (direction === "next" ? 1 : -1)
        );
        break;
    }
    setCurrentDate(newDate);
  };

  const getDateRangeText = () => {
    switch (viewMode) {
      case "day":
        return currentDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "week":
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${weekEnd.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      case "month":
        return currentDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        });
      case "year":
        return currentDate.getFullYear().toString();
      default:
        return "";
    }
  };

  const getWeekDays = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const renderDayView = () => {
    const dayName = currentDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const daySchedule = getScheduleForDay(currentDate);
    const timeSlots = Array.from({ length: 14 }, (_, i) => {
      const hour = i + 7; // Start from 7 AM
      return `${hour.toString().padStart(2, "0")}:00`;
    });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-xl font-semibold text-gray-900">{t(dayName)}</h3>
          <p className="text-gray-600">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t("Loading...")}</p>
            </div>
          ) : daySchedule.length > 0 ? (
            <div className="space-y-4">
              {timeSlots.map((time) => {
                const classesAtTime = daySchedule.filter(
                  (cls) => time >= cls.startTime && time < cls.endTime
                );

                return (
                  <div key={time} className="flex">
                    <div className="w-20 text-sm text-gray-500 pt-2">
                      {time}
                    </div>
                    <div className="flex-1 min-h-[60px] border-l-2 border-gray-100 pl-4">
                      {classesAtTime.map((cls, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 ${getTypeColor(
                            cls.type
                          )} mb-2`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {cls.className}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {cls.classCode}
                              </p>
                              {user?.authId?.role?.name === "student" && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {cls.lecturerName}
                                </p>
                              )}
                            </div>
                            <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded capitalize">
                              {t(cls.type)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mt-2 space-x-4">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {cls.startTime} - {cls.endTime}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {cls.room}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {t("No classes scheduled for this day")}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const timeSlots = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 8; // Start from 8 AM
      return `${hour.toString().padStart(2, "0")}:00`;
    });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 bg-gray-50 font-medium text-gray-900">
            {t("Time")}
          </div>
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className="p-4 bg-gray-50 font-medium text-gray-900 text-center"
            >
              <div className="text-sm">
                {t(day.toLocaleDateString("en-US", { weekday: "short" }))}
              </div>
              <div className="text-lg font-bold">{day.getDate()}</div>
            </div>
          ))}
        </div>

        <div className="relative max-h-auto overflow-y-auto">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="grid grid-cols-8 border-b border-gray-100 min-h-[60px]"
            >
              <div className="p-4 bg-gray-50 text-sm text-gray-600 border-r border-gray-200">
                {time}
              </div>
              {weekDays.map((day) => {
                const dayName = day.toLocaleDateString("en-US", {
                  weekday: "long",
                });
                const daySchedule = getScheduleForDay(day);
                const classesAtTime = daySchedule.filter(
                  (cls) => time >= cls.startTime && time < cls.endTime
                );

                return (
                  <div
                    key={`${day.toISOString()}-${time}`}
                    className="p-2 border-r border-gray-100 relative"
                  >
                    {classesAtTime.map((cls, clsIndex) => (
                      <div
                        key={`${cls._id}-${clsIndex}`}
                        className={`p-2 rounded-lg border-l-4 ${getTypeColor(
                          cls.type
                        )} mb-1 text-xs`}
                      >
                        <div className="font-medium truncate">
                          {cls.className}
                        </div>
                        <div className="opacity-75 truncate">{cls.room}</div>
                        <div className="text-xs text-gray-500">
                          {cls.startTime} - {cls.endTime}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDays = getMonthDays();
    const currentMonth = currentDate.getMonth();

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="p-4 bg-gray-50 font-medium text-gray-900 text-center"
            >
              {t(day)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {monthDays.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isToday = day.toDateString() === new Date().toDateString();
            const dayName = day.toLocaleDateString("en-US", {
              weekday: "long",
            });
            const daySchedule = getScheduleForDay(day);

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-100 ${
                  !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                } ${isToday ? "bg-blue-50" : ""}`}
              >
                <div
                  className={`text-sm font-medium mb-2 ${
                    isToday ? "text-blue-600" : ""
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {daySchedule.slice(0, 2).map((cls, clsIndex) => (
                    <div
                      key={clsIndex}
                      className={`text-xs p-1 rounded ${getTypeColor(
                        cls.type
                      )} truncate`}
                    >
                      {cls.className}
                    </div>
                  ))}
                  {daySchedule.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{daySchedule.length - 2} {t("more")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map((month, index) => {
          const monthSchedule = schedules.filter(
            (schedule) => new Date(schedule.date).getMonth() === index
          );
          const hasClasses = monthSchedule.length > 0;

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setCurrentDate(month);
                setViewMode("month");
              }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t(monthNames[index])}
              </h3>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-gray-400 font-medium p-1"
                  >
                    {day}
                  </div>
                ))}
                {Array.from(
                  { length: new Date(year, index + 1, 0).getDate() },
                  (_, i) => (
                    <div key={i} className="text-center p-1 text-gray-600">
                      {i + 1}
                    </div>
                  )
                )}
              </div>
              {hasClasses && (
                <div className="mt-3 flex items-center text-xs text-blue-600">
                  <Calendar className="w-3 h-3 mr-1" />
                  {t("Classes scheduled")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (viewMode) {
      case "day":
        return renderDayView();
      case "week":
        return renderWeekView();
      case "month":
        return renderMonthView();
      case "year":
        return renderYearView();
      default:
        return renderWeekView();
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("Schedule")}</h1>
          <p className="text-gray-600 mt-1">
            {user?.authId?.role?.name === "lecturer"
              ? t("Your teaching schedule")
              : t("Your class schedule")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* View Mode Selector */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {["day", "week", "month", "year"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  viewMode === mode
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t(mode)}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDate("prev")}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {getDateRangeText()}
            </div>
            <button
              onClick={() => navigateDate("next")}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={() => setCurrentDate(new Date())}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {t("Today")}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="transition-all duration-300 ease-in-out">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default ScheduleView;
