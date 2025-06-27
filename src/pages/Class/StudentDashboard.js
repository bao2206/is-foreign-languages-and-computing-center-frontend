import React, { useState, useEffect } from "react";
import {
  Calendar,
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle,
  Award,
  Eye,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getClassForStudent } from "../../services/ClassService";
import { getUserProfile } from "../../services/auth";
import { getScheduleByStudentId } from "../../services/ScheduleService";
import { getAssignments } from "../../services/AssignmentService";

const StudentDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profile = await getUserProfile();
        setUser(profile);

        const classesData = await getClassForStudent(profile.id);
        setClasses(classesData);

        const schedulesData = await getScheduleByStudentId(profile.id);
        setSchedules(Array.isArray(schedulesData) ? schedulesData : []);

        // Lấy assignment cho student
        const assignmentRes = await getAssignments({
          action: "getByStudentId",
          authId: profile.authId,
          limit: 5,
        });
        setAssignments(assignmentRes.data.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
        setClasses([]);
        setSchedules([]);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lọc các lớp mà sinh viên thực sự tham gia
  const studentClasses = classes.filter((cls) =>
    cls.students.some((student) => student.id === user?.id)
  );

  // Lấy lịch học hôm nay từ schedules API
  const today = new Date();
  const todaySchedules = schedules.filter(
    (s) => new Date(s.date).toDateString() === today.toDateString()
  );

  const stats = [
    {
      title: t("enrolledClasses") || "Enrolled Classes",
      value: studentClasses.length,
      icon: BookOpen,
      color: "bg-blue-500",
      change: t("thisSemester"),
    },
    {
      title: t("pendingAssignments") || "Pending Assignments",
      value: assignments.filter((a) => {
        console.log(a);

        if (!a.dueDate) return false;
        const dueDate = new Date(a.dueDate);
        const now = new Date(); // so sánh cả ngày và giờ hiện tại
        const threeDaysBeforeDue = new Date(dueDate);
        threeDaysBeforeDue.setDate(dueDate.getDate() - 3);

        // Chỉ lấy bài tập chưa nộp, còn hạn và trong phạm vi 3 ngày trước hạn nộp (so sánh cả giờ)
        return (
          now >= threeDaysBeforeDue &&
          now <= dueDate &&
          !(a.submissions || []).some(
            (s) =>
              s.studentId === user?._id ||
              s.studentId?._id === user?._id ||
              s.studentId === user?._id
          )
        );
      }).length,
      icon: Clock,
      color: "bg-orange-500",
      change: t("dueSoon"),
    },
    {
      title: t("Assignment completed") || "Completed",
      value: assignments.filter((a) =>
        (a.submissions || []).some(
          (s) =>
            (s.studentId === user?.id || s.studentId?._id === user?._id) &&
            s.grade !== null &&
            s.grade !== undefined
        )
      ).length,
      icon: CheckCircle,
      color: "bg-green-500",
      change: t("thisTerm"),
    },
    {
      title: t("averageGrade") || "Average Grade",
      value: (() => {
        // Lấy tất cả điểm đã chấm của user
        const grades = assignments.flatMap((a) =>
          (a.submissions || [])
            .filter(
              (s) =>
                (s.studentId === user?.id || s.studentId?._id === user?._id) &&
                typeof s.grade === "number"
            )
            .map((s) => s.grade)
        );
        if (!grades.length) return "N/A";
        return (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1);
      })(),
      icon: Award,
      color: "bg-purple-500",
      change: "",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <p className="text-gray-500 text-center">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("welcomeBack")}, {user?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("readyToContinueYourLearningJourney")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{t("today")}</p>
          <p className="text-lg font-semibold text-gray-900">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("todaysClasses")}
            </h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {todaySchedules.length > 0 ? (
              todaySchedules.map((sch, index) => (
                <div
                  key={sch._id || index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {sch.className || sch.classname} ({sch.classCode || ""})
                    </p>
                    <p className="text-xs text-gray-500">
                      {sch.startTime} - {sch.endTime} • {sch.room}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 capitalize bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {sch.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                {t("noClassesScheduledForToday")}
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("assignments")}
            </h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {assignments.length > 0 ? (
              assignments.map((assignment) => {
                const dueDate = new Date(assignment.dueDate);
                const isOverdue = dueDate < today;
                const hasSubmission = assignment.submissions?.some(
                  (s) => s.studentId === user?.id
                );

                return (
                  <div
                    key={assignment._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {assignment.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("due")}: {dueDate.toLocaleDateString()}
                        {isOverdue && (
                          <span className="ml-1 text-red-500 text-xs">
                            ({t("overdue")})
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center text-sm font-medium"
                      onClick={() => navigate("/class/assignments")}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {t("view_details")}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">
                {t("no_assignments_found")}
              </p>
            )}
            <button
              className="w-full bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-2 flex items-center justify-center space-x-2 transition-colors mt-2"
              onClick={() => navigate("/class/assignments")}
            >
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-700">
                {t("view_all_assignments")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Grades - Tạm thời vô hiệu hóa */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t("recentGrades")}
        </h2>
        <div className="space-y-3">
          <p className="text-gray-500 text-center py-4">
            {t("featureDisabledTemporarily")}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t("quickActions")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            onClick={() => navigate("/class")}
          >
            <BookOpen className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">{t("viewClasses")}</h3>
            <p className="text-sm text-gray-600">
              {t("checkYourEnrolledClasses")}
            </p>
          </button>
          <button
            className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            onClick={() => navigate("/class/assignments")}
          >
            <Clock className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">
              {t("submitAssignment")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("uploadYourCompletedWork")}
            </p>
          </button>
          <button
            className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            onClick={() => navigate("/class/schedule")}
          >
            <Calendar className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">{t("viewSchedule")}</h3>
            <p className="text-sm text-gray-600">
              {t("checkYourWeeklyTimetable")}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
