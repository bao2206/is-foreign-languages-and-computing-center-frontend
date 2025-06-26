import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
} from "lucide-react";
import { getClassForTeacher } from "../../services/ClassService";
import {
  getAttendanceByClassIdAndDate,
  createAttendanceRecord,
} from "../../services/AttendanceService";
import { getUserProfile } from "../../services/auth";

const AttendanceManagement = () => {
  const [user, setUser] = useState(null);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceData, setAttendanceData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (profile && profile._id) {
          setUser(profile);
          await fetchClasses(profile._id);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const fetchClasses = async (teacherId) => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const classes = await getClassForTeacher(teacherId, {
        limit: 9999,
        page: 1,
      });
      console.log("Teacher Classes:", classes);
      setTeacherClasses(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      if (selectedClass) {
        try {
          const attendance = await getAttendanceByClassIdAndDate(
            selectedClass,
            selectedDate
          );
          const initialAttendance = {};

          if (attendance.data && attendance.data.students) {
            attendance.data.students.forEach((student) => {
              if (student.studentId && student.studentId.name) {
                // Sử dụng studentId thay vì student
                const key = `${student.studentId._id}-${selectedClass}-${selectedDate}`;
                initialAttendance[key] = student.status || "present";
              }
            });
          }
          setAttendanceData(initialAttendance);
        } catch (error) {
          console.error("Error fetching attendance:", error);
        }
      }
    };
    fetchAttendance();
  }, [selectedClass, selectedDate]);

  const selectedClassData = teacherClasses.find(
    (cls) => cls._id === selectedClass
  );

  const getAttendanceStatus = (studentId, classId, date) => {
    const key = `${studentId}-${classId}-${date}`;
    return attendanceData[key] || "present";
  };

  const updateAttendance = (studentId, classId, date, status) => {
    const key = `${studentId}-${classId}-${date}`;
    setAttendanceData((prev) => ({
      ...prev,
      [key]: status,
    }));
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

  // Lọc sinh viên chỉ lấy những sinh viên có thông tin name
  const filteredStudents =
    selectedClassData?.students
      ?.filter((student) => student.student && student.student.name)
      .map((student) => ({
        _id: student.student._id,
        name: student.student.name,
        email: student.student.email,
        studentId: student.student._id, // Sử dụng _id làm studentId tạm thời
        avatar:
          student.student.avatar ||
          require("../../components/Images/user_Img.png"),
      })) || [];

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      if (filteredStudents.length === 0) {
        alert("No valid students to save attendance.");
        return;
      }

      const attendanceRecord = {
        id: `${selectedClass}-${selectedDate}`,
        teacherId: user?._id,
        students: filteredStudents.map((student) => ({
          studentId: student._id,
          status: getAttendanceStatus(student._id, selectedClass, selectedDate),
        })),
        classId: selectedClass,
        date: new Date(selectedDate),
      };

      await createAttendanceRecord(attendanceRecord); // Chỉ sử dụng create, server sẽ xử lý cập nhật
      alert("Attendance saved successfully!");
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Failed to save attendance.");
    } finally {
      setIsSaving(false);
    }
  };

  const getAttendanceStats = () => {
    if (!selectedClassData || filteredStudents.length === 0)
      return { present: 0, late: 0, absent: 0 };

    const stats = { present: 0, late: 0, absent: 0 };
    filteredStudents.forEach((student) => {
      const status = getAttendanceStatus(
        student._id,
        selectedClass,
        selectedDate
      );
      stats[status]++;
    });
    return stats;
  };

  const stats = getAttendanceStats();

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage student attendance
          </p>
        </div>
        <div className="flex space-x-3">
          {selectedClass && (
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving || filteredStudents.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Attendance"}
            </button>
          )}
        </div>
      </div>

      {/* Class and Date Selection */}
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
              <option value="">Choose a class...</option>
              {teacherClasses.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.classname} ({cls.courseId?.coursename || "No Course"})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {selectedClass && (
        <>
          {/* Attendance Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredStudents.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.present}
                  </p>
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
                    {stats.late}
                  </p>
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
                    {stats.absent}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-100">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedClassData?.classname} - Attendance
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      filteredStudents.forEach((student) => {
                        updateAttendance(
                          student._id,
                          selectedClass,
                          selectedDate,
                          "present"
                        );
                      });
                    }}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => {
                      filteredStudents.forEach((student) => {
                        updateAttendance(
                          student._id,
                          selectedClass,
                          selectedDate,
                          "late"
                        );
                      });
                    }}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                  >
                    Mark All Late
                  </button>
                  <button
                    onClick={() => {
                      filteredStudents.forEach((student) => {
                        updateAttendance(
                          student._id,
                          selectedClass,
                          selectedDate,
                          "absent"
                        );
                      });
                    }}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student, index) => {
                    const status = getAttendanceStatus(
                      student._id,
                      selectedClass,
                      selectedDate
                    );
                    return (
                      <tr
                        key={student._id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              status
                            )}`}
                          >
                            {getStatusIcon(status)}
                            <span className="ml-1 capitalize">{status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() =>
                                updateAttendance(
                                  student._id,
                                  selectedClass,
                                  selectedDate,
                                  "present"
                                )
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                status === "present"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-700"
                              }`}
                              title="Mark Present"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateAttendance(
                                  student._id,
                                  selectedClass,
                                  selectedDate,
                                  "late"
                                )
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                status === "late"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-700"
                              }`}
                              title="Mark Late"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateAttendance(
                                  student._id,
                                  selectedClass,
                                  selectedDate,
                                  "absent"
                                )
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                status === "absent"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-700"
                              }`}
                              title="Mark Absent"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No valid students found
                </h3>
                <p className="text-gray-600">
                  No students with valid details available for this class
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedClass && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Class
          </h3>
          <p className="text-gray-600">
            Choose a class from the dropdown above to start taking attendance
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
