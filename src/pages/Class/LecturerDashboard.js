import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  FileText,
  BookOpen,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getClassForTeacher } from "../../services/ClassService";
import { getAssignments } from "../../services/AssignmentService";
import { getUserProfile } from "../../services/auth";
import { getScheduleByTeacherId } from "../../services/ScheduleService";

const LecturerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user, classes, assignments, schedules
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profile = await getUserProfile();
        setUser(profile);

        const classesData = await getClassForTeacher({
          authId: profile.authId,
        });
        setClasses(classesData || []);

        const assignmentRes = await getAssignments({
          action: "getByTeacherId",
          authId: profile.authId,
          limit: 100,
        });
        setAssignments(assignmentRes.data.data || []);

        // Lấy schedule theo giáo viên
        const scheduleRes = await getScheduleByTeacherId(profile.authId);

        setSchedules(Array.isArray(scheduleRes) ? scheduleRes : []);
      } catch (error) {
        setClasses([]);
        setAssignments([]);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stats
  const totalStudents = classes.reduce(
    (acc, cls) => acc + (cls.students?.length || 0),
    0
  );
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(
    (a) => a.status === "published"
  ).length;
  const avgGrade = (() => {
    const grades = assignments.flatMap((a) =>
      (a.submissions || [])
        .map((s) => s.grade)
        .filter((g) => g !== undefined && g !== null)
    );
    if (!grades.length) return "N/A";
    return (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1);
  })();

  const today = new Date();
  const todaySchedules = schedules.filter(
    (s) => new Date(s.date).toDateString() === today.toDateString()
  );

  // 5 most recent submissions
  const recentSubmissions = assignments
    .flatMap((a) =>
      (a.submissions || []).map((s) => ({
        ...s,
        assignmentTitle: a.title,
        className:
          classes.find((cls) => cls._id === (a.classId?._id || a.classId))
            ?.classname || "",
      }))
    )
    .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
    .slice(0, 5);

  const stats = [
    {
      title: t("totalClasses") || "Total Classes",
      value: classes.length,
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      title: t("totalStudents") || "Total Students",
      value: totalStudents,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: t("activeAssignments") || "Active Assignments",
      value: activeAssignments,
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: t("avgStudentGrade") || "Avg. Grade",
      value: avgGrade,
      icon: TrendingUp,
      color: "bg-orange-500",
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
            {t("heresWhatsHappeningWithYourClassesToday")}
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

      {/* Stats */}
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
        {/* Today's Schedule */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("todaysSchedule")}
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
                      {sch.className || sch.classname} (
                      {sch.classCode || sch.classCode})
                    </p>
                    <p className="text-xs text-gray-500">
                      {sch.startTime} - {sch.endTime} • {sch.room}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">
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

        {/* Recent Submissions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("recentSubmissions")}
            </h2>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((sub, idx) => (
                <div
                  key={sub._id || idx}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {sub.studentId?.name || t("unknown_student")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sub.assignmentTitle} • {sub.className}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(sub.submissionDate).toLocaleDateString()}
                  </div>
                  <div className="ml-4">
                    {sub.grade !== undefined && sub.grade !== null ? (
                      <span className="text-green-600 font-semibold">
                        {sub.grade}
                      </span>
                    ) : (
                      <span className="text-gray-400">{t("not_graded")}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                {t("noRecentSubmissions")}
              </p>
            )}
          </div>
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
            onClick={() => navigate("/class/assignments")}
          >
            <Plus className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">
              {t("createAssignment")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("addANewAssignmentForYourClasses")}
            </p>
          </button>
          <button
            className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            onClick={() => navigate("/class/assignments")}
          >
            <Users className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">
              {t("gradeSubmissions")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("reviewAndGradeStudentWork")}
            </p>
          </button>
          <button
            className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            onClick={() => navigate("/class/schedule")}
          >
            <Calendar className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">{t("scheduleClass")}</h3>
            <p className="text-sm text-gray-600">{t("See Schedule")}</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
