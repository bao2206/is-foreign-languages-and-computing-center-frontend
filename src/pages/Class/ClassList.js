import React, { useState, useEffect } from "react";
import { Users, Calendar, MapPin, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  getClassForTeacher,
  getClassForStudent,
} from "../../services/ClassService";
import { getUserProfile } from "../../services/auth";
import {
  getScheduleByTeacherId,
  getScheduleByStudentId,
} from "../../services/ScheduleService";

const ClassList = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Thêm dòng này

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        console.log("User profile:", profile);

        await fetchClasses(profile);
        setUser(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);
  const fetchClasses = async (user) => {
    if (!user?._id || !user?.authId?.role?.name) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const fetchFunction =
        user.authId.role.name === "teacher"
          ? getClassForTeacher
          : getClassForStudent;
      const classesData = await fetchFunction({ limit: 100 });
      console.log("Classes data:", classesData);

      setClasses(classesData);
    } catch (error) {
      console.error("Error loading classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-center">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.authId?.role?.name === "teacher"
              ? t("myClasses")
              : t("enrolledClasses")}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.authId?.role?.name === "teacher"
              ? t("manageYourTeachingClassesAndStudents")
              : t("viewYourEnrolledClassesAndSchedules")}
          </p>
        </div>
        {/* Removed "Add New Class" button */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {classes.map((cls) => (
          <div
            key={cls._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {cls.classname}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{cls.code}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {t(cls.status)}
                </span>
              </div>

              <p className="text-gray-700 mb-4">
                {cls.courseId.description || t("noDescription")}
              </p>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    {cls.students?.length || 0} {t("studentsEnrolled")}
                  </span>
                </div>

                {/* Bỏ phần schedule */}

                {user?.authId?.role?.name === "student" &&
                  cls.teachers &&
                  cls.teachers.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        {t("instructor")}: {cls.teachers[0].name || t("N/A")}
                      </span>
                    </div>
                  )}
              </div>

              {/* Bỏ phần hiển thị weeklySchedule */}

              <div className="mt-6 flex space-x-3">
                <button
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  onClick={() => navigate(`/class/detail/${cls._id}`)}
                >
                  {t("viewDetails")}
                </button>
                {user?.authId?.role?.name === "teacher" && (
                  <button
                    className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    onClick={() => navigate(`/class/${cls._id}/assignments`)}
                  >
                    {t("manage")}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {user?.authId?.role?.name === "teacher"
              ? t("noClassesAssigned")
              : t("notEnrolledInAnyClasses")}
          </h3>
          <p className="text-gray-600">
            {user?.authId?.role?.name === "teacher"
              ? t("startByCreatingYourFirstClass")
              : t("contactYourAdvisorToEnrollInClasses")}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassList;
