import React, { useState, useEffect } from "react";
import { Calendar, Users, FileText, BookOpen, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getClassForTeacher } from "../../services/ClassService";
import { getUserProfile } from "../../services/auth";

const LecturerDashboard = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profile = await getUserProfile();
        setUser(profile.data);

        const classesData = await getClassForTeacher(profile.id);
        setClasses(classesData);
      } catch (error) {
        console.error("Error loading data:", error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const todayClasses = classes.flatMap((cls) =>
    cls.schedule
      .filter(
        (s) =>
          s.day === new Date().toLocaleDateString("en-US", { weekday: "long" })
      )
      .map((schedule) => ({
        ...schedule,
        className: cls.classname,
        classCode: cls.code,
      }))
  );

  const stats = [
    {
      title: "Total Classes",
      value: classes.length,
      icon: BookOpen,
      color: "bg-blue-500",
      change: "+2 this semester",
    },
    {
      title: "Total Students",
      value: classes.reduce((acc, cls) => acc + (cls.students?.length || 0), 0),
      icon: Users,
      color: "bg-green-500",
      change: "+15 this month",
    },
    {
      title: "Active Assignments",
      value: 0, // Placeholder, tạm thời vô hiệu hóa
      icon: FileText,
      color: "bg-purple-500",
      change: "N/A",
    },
    {
      title: "Avg. Grade",
      value: "N/A", // Placeholder, tạm thời vô hiệu hóa
      icon: TrendingUp,
      color: "bg-orange-500",
      change: "N/A",
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
            {new Date().toLocaleDateString("en-US", {
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
        {/* Today's Schedule */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("todaysSchedule")}
            </h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {todayClasses.length > 0 ? (
              todayClasses.map((cls, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {cls.className} ({cls.classCode})
                    </p>
                    <p className="text-xs text-gray-500">
                      {cls.startTime} - {cls.endTime} • {cls.room}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">
                    {cls.type}
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

        {/* Recent Submissions - Tạm thời vô hiệu hóa */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("recentSubmissions")}
            </h2>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <p className="text-gray-500 text-center py-4">
              {t("featureDisabledTemporarily")}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t("quickActions")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">
              {t("createAssignment")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("addANewAssignmentForYourClasses")}
            </p>
          </button>
          <button className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Users className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">
              {t("gradeSubmissions")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("reviewAndGradeStudentWork")}
            </p>
          </button>
          <button className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Calendar className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">{t("scheduleClass")}</h3>
            <p className="text-sm text-gray-600">
              {t("addOrModifyClassSchedules")}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
