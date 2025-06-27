import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Calendar, Clock, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchClassById } from "../../services/ClassService";
import { fetchScheduleByClass } from "../../services/ScheduleService";

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [classData, setClassData] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("ClassDetail");
  }, []);

  useEffect(() => {
    const fetchClassDetail = async () => {
      setLoading(true);
      try {
        const cls = await fetchClassById(classId);
        setClassData(cls);

        // Lấy thời khóa biểu của lớp
        const scheduleRes = await fetchScheduleByClass(classId);
        setSchedules(scheduleRes || []);
      } catch (err) {
        setClassData(null);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClassDetail();
  }, [classId]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-center">{t("loading")}</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("unknown_class")}
          </h2>
          <button
            onClick={() => navigate("/class")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("back_to_classes") || "Back to Classes"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate("/class/classes")}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {classData.classname}
          </h1>
          <p className="text-gray-600 mt-1">
            {classData.code} • {classData.students?.length || 0} {t("students")}
          </p>
        </div>
      </div>

      {/* Class Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium">{t("studentsEnrolled")}</span>
            </div>
            <div className="text-lg font-bold text-blue-700">
              {classData.students?.length || 0}
            </div>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <Calendar className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium">{t("course")}</span>
            </div>
            <div className="text-lg font-bold text-green-700">
              {classData.courseId?.description || t("noDescription")}
            </div>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="font-medium">{t("teachers")}</span>
            </div>
            <div className="text-lg font-bold text-yellow-700">
              {classData.teachers?.map((t) => t.name).join(", ") || t("N/A")}
            </div>
          </div>
        </div>
        <div className="mt-4 text-gray-700">
          <span className="font-semibold">{t("description")}:</span>{" "}
          {classData.description || t("noDescription")}
        </div>
      </div>

      {/* Schedule List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {t("class_schedule")}
        </h2>
        {schedules.length === 0 ? (
          <div className="text-gray-500">{t("no_schedule_found")}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("date")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("start_time")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("end_time")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("room")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("teacher")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.map((sch) => (
                <tr key={sch._id}>
                  <td className="px-4 py-2">
                    {sch.date ? new Date(sch.date).toLocaleDateString() : ""}
                  </td>
                  <td className="px-4 py-2">{sch.startTime}</td>
                  <td className="px-4 py-2">{sch.endTime}</td>
                  <td className="px-4 py-2">{sch.room || t("N/A")}</td>
                  <td className="px-4 py-2">{sch.teacher?.name || t("N/A")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClassDetail;
