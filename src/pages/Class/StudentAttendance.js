import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import { getAttendanceByStudentId } from "../../services/AttendanceService";
import { getUserProfile } from "../../services/auth";

const StudentAttendance = () => {
  const [user, setUser] = useState(null);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [viewMode, setViewMode] = useState("summary");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        fetchAttendance(profile);
        setUser(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to fetch user profile.");
      }
    };
    fetchUserProfile();
  }, []);

  const fetchAttendance = async (user) => {
    setLoading(true);
    setError(null);
    try {
      if (user?._id) {
        const data = await getAttendanceByStudentId(user._id);
        console.log("Attendance data fetched:", data.data);
        setAttendanceData(data.data); // Lưu toàn bộ dữ liệu từ API
      }
    } catch (err) {
      setError("Failed to fetch attendance data.");
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật studentClasses dựa trên dữ liệu thực tế từ attendanceData
  const studentClasses = attendanceData.map((item) => ({
    id: item.classId,
    name: item.className,
    code: item.className, // Có thể tùy chỉnh code nếu cần
  }));

  // Làm phẳng và lọc attendanceRecords từ attendanceData
  const getFilteredAttendance = (classId = null) => {
    const allAttendances = attendanceData.flatMap((item) => item.attendances);
    if (classId && classId !== "all") {
      const selectedClassData = attendanceData.find(
        (item) => item.classId === classId
      );
      return selectedClassData ? selectedClassData.attendances : [];
    }
    return allAttendances;
  };

  const attendanceRecordsFiltered = getFilteredAttendance(selectedClass);

  const getAttendanceStats = () => {
    const stats = { present: 0, late: 0, absent: 0, total: 0 };
    attendanceRecordsFiltered.forEach((record) => {
      stats[record.status]++;
      stats.total++;
    });
    return stats;
  };

  const getAttendancePercentage = () => {
    const stats = getAttendanceStats();
    if (stats.total === 0) return 0;
    return Math.round(((stats.present + stats.late * 0.5) / stats.total) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700 border-green-300";
      case "late":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "absent":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4" />;
      case "late":
        return <AlertCircle className="w-4 h-4" />;
      case "absent":
        return <XCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getClassAttendanceStats = () => {
    return studentClasses.map((cls) => {
      const classRecords =
        attendanceData.find((item) => item.classId === cls.id)?.attendances ||
        [];
      const stats = { present: 0, late: 0, absent: 0, total: 0 };
      classRecords.forEach((record) => {
        stats[record.status]++;
        stats.total++;
      });
      const percentage =
        stats.total > 0
          ? Math.round(((stats.present + stats.late * 0.5) / stats.total) * 100)
          : 0;
      return {
        ...cls,
        ...stats,
        percentage,
      };
    });
  };

  const classStats = getClassAttendanceStats();
  const overallStats = getAttendanceStats();
  const overallPercentage = getAttendancePercentage();

  const getAttendanceGrade = (percentage) => {
    if (percentage >= 95)
      return { grade: "Excellent", color: "text-green-600" };
    if (percentage >= 85) return { grade: "Good", color: "text-blue-600" };
    if (percentage >= 70)
      return { grade: "Satisfactory", color: "text-yellow-600" };
    return { grade: "Needs Improvement", color: "text-red-600" };
  };

  const attendanceGrade = getAttendanceGrade(overallPercentage);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-center">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-1">
            Track your class attendance and performance
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("summary")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "summary"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "detailed"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Classes</option>
              {studentClasses.map((cls) => (
                <option key={cls._id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="semester">This Semester</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === "summary" ? (
        <>
          {/* Overall Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Overall Attendance
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {overallPercentage}%
                  </p>
                  <p className={`text-sm font-medium ${attendanceGrade.color}`}>
                    {attendanceGrade.grade}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">
                    {overallStats.present}
                  </p>
                  <p className="text-xs text-gray-500">Classes attended</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {overallStats.late}
                  </p>
                  <p className="text-xs text-gray-500">Late arrivals</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-100">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {overallStats.absent}
                  </p>
                  <p className="text-xs text-gray-500">Classes missed</p>
                </div>
                <div className="p-3 rounded-lg bg-red-100">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Class-wise Attendance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Class-wise Attendance
              </h3>
              <p className="text-sm text-gray-600">
                Your attendance record for each enrolled class
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance %
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Present
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Late
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absent
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Classes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classStats.map((cls, index) => {
                    const grade = getAttendanceGrade(cls.percentage);
                    return (
                      <tr
                        key={cls.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {cls.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {cls.code}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <div className="text-lg font-bold text-gray-900">
                              {cls.percentage || 0}%
                            </div>
                          </div>
                          <div className={`text-xs font-medium ${grade.color}`}>
                            {grade.grade}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-green-600">
                            {cls.present || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-yellow-600">
                            {cls.late || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-red-600">
                            {cls.absent || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">
                            {cls.total || 0}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Detailed View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Detailed Attendance Record
            </h3>
            <p className="text-sm text-gray-600">
              {selectedClass === "all"
                ? "All classes"
                : studentClasses.find((c) => c.id === selectedClass)?.name}{" "}
              - Chronological attendance history
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecordsFiltered
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((record, index) => {
                    const classData = studentClasses.find(
                      (c) => c.id === record.class
                    );
                    const date = new Date(record.date);
                    return (
                      <tr
                        key={`${record.date}-${record.class}`}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {date.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {classData?.name || record.class}
                            </div>
                            <div className="text-sm text-gray-500">
                              {classData?.code || ""}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              record.status
                            )}`}
                          >
                            {getStatusIcon(record.status)}
                            <span className="ml-1 capitalize">
                              {record.status}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.teacher || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {date.toLocaleDateString("en-US", {
                            weekday: "long",
                          })}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {attendanceRecordsFiltered.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No attendance records
              </h3>
              <p className="text-gray-600">
                No attendance data available for the selected criteria
              </p>
            </div>
          )}
        </div>
      )}

      {/* Attendance Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Attendance Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                Maintain 85%+ Attendance
              </h4>
              <p className="text-sm text-gray-600">
                Most institutions require minimum 85% attendance for exam
                eligibility
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Arrive on Time</h4>
              <p className="text-sm text-gray-600">
                Being punctual shows respect and helps you catch important
                announcements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
