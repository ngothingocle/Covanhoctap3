import React, { useState } from 'react';
import {
  CalendarCheck,
  Calendar,
  BookOpen,
  UserCheck,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import { AbsenceLogEntry, ClassGroup, Course, Student, UserSession } from '../types';

interface AttendanceTrackerProps {
  classGroup: ClassGroup;
  courses: Course[];
  students: Student[];
  session: UserSession | null;
  onRecordAbsence: (
    studentId: string,
    courseId: string,
    periods: number,
    date: string,
    reason: string
  ) => void;
  onDeleteAbsenceLog: (studentId: string, courseId: string, logId: string) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  classGroup,
  courses,
  students,
  session,
  onRecordAbsence,
  onDeleteAbsenceLog,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || ''
  );
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [periods, setPeriods] = useState<number>(2);
  const [reason, setReason] = useState<string>('Vắng không phép');
  const [customReason, setCustomReason] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isOfficer = session?.role === 'class_officer';
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId) return;

    const finalReason = reason === 'Khác' ? customReason : reason;

    onRecordAbsence(
      selectedStudentId,
      selectedCourseId,
      periods,
      attendanceDate,
      finalReason || 'Vắng học'
    );

    const st = students.find((s) => s.id === selectedStudentId);
    setSuccessMessage(
      `Đã ghi nhận vắng ${periods} tiết cho sinh viên ${st?.fullName || ''} môn ${selectedCourse?.courseName || ''}!`
    );

    // Reset inputs
    setSelectedStudentId('');
    setPeriods(2);
    setCustomReason('');

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Compile all absence logs for this class & course
  const allLogs: Array<{
    log: AbsenceLogEntry;
    student: Student;
    course: Course;
  }> = [];

  students.forEach((st) => {
    courses.forEach((c) => {
      const logs = st.grades?.[c.id]?.absenceLogs || [];
      logs.forEach((log) => {
        if (!selectedCourseId || c.id === selectedCourseId) {
          allLogs.push({ log, student: st, course: c });
        }
      });
    });
  });

  // Sort logs by date descending
  allLogs.sort(
    (a, b) =>
      new Date(b.log.date).getTime() - new Date(a.log.date).getTime() ||
      new Date(b.log.createdAt).getTime() - new Date(a.log.createdAt).getTime()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-blue-700 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            <h2 className="text-lg font-bold">
              {isOfficer
                ? 'Sổ Điểm danh & Báo vắng - Dành cho Cán bộ lớp'
                : 'Quản lý Điểm danh Sinh viên vắng học theo Môn'}
            </h2>
          </div>
          <p className="text-xs text-orange-100 mt-1">
            Lớp: <b>{classGroup.name} ({classGroup.code})</b> | Người thực hiện:{' '}
            <b>{session?.displayName || 'Cán bộ lớp'}</b>
          </p>
        </div>

        {isOfficer && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 text-xs font-bold text-white backdrop-blur-xs">
            <UserCheck className="w-4 h-4 text-white" />
            <span>Tài khoản Cán bộ lớp: {session.username}</span>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Form Left, Log Table Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Record Form */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Plus className="w-4 h-4 text-orange-600" />
            Ghi nhận Sinh viên Vắng học
          </h3>

          <form onSubmit={handleSaveAttendance} className="space-y-3.5 text-xs">
            {/* Pick Course */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Chọn Môn học (*):
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseCode} - {c.courseName} ({c.credits} TC)
                  </option>
                ))}
              </select>
            </div>

            {/* Pick Date */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Ngày vắng (*):
              </label>
              <input
                type="date"
                required
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Pick Student */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Chọn Sinh viên vắng (*):
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
              >
                <option value="">-- Bấm để chọn Sinh viên --</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.studentCode} - {st.fullName} ({st.gender})
                  </option>
                ))}
              </select>
            </div>

            {/* Periods count */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Số tiết vắng (tiết):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setPeriods(num)}
                    className={`py-1.5 rounded-lg border text-center font-bold transition ${
                      periods === num
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num} tiết
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Lý do vắng học:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              >
                <option value="Vắng không phép">Vắng không phép</option>
                <option value="Bị bệnh / Cảm sốt (Có phép)">Bị bệnh / Cảm sốt (Có phép)</option>
                <option value="Đi thi Olympic / NCKH">Đi thi Olympic / NCKH</option>
                <option value="Bận việc gia đình có đơn xin">Bận việc gia đình có đơn xin</option>
                <option value="Trễ giờ / Ngủ quên">Trễ giờ / Ngủ quên</option>
                <option value="Khác">Lý do khác (Tự nhập)</option>
              </select>

              {reason === 'Khác' && (
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Nhập lý do cụ thể..."
                  className="w-full mt-2 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ghi nhận Điểm danh</span>
            </button>
          </form>
        </div>

        {/* Attendance Summary & Log Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Course bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">Lọc theo môn:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
              >
                <option value="">Tất cả các môn</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseCode} - {c.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Tổng số lượt vắng đã ghi: <b className="text-orange-700">{allLogs.length} lượt</b>
            </div>
          </div>

          {/* Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Lịch sử Điểm danh Sinh viên vắng
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Ngày</th>
                    <th className="py-2.5 px-3">Mã SV & Họ tên</th>
                    <th className="py-2.5 px-3">Môn học</th>
                    <th className="py-2.5 px-3 text-center">Số tiết</th>
                    <th className="py-2.5 px-3">Lý do</th>
                    <th className="py-2.5 px-3">Người ghi nhận</th>
                    {!isOfficer && <th className="py-2.5 px-3 text-center">Xóa</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Chưa có dữ liệu vắng học nào cho môn này.
                      </td>
                    </tr>
                  ) : (
                    allLogs.map(({ log, student, course }) => (
                      <tr key={log.id} className="hover:bg-orange-50/30 transition">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {log.date}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{student.fullName}</div>
                          <div className="text-[10px] text-blue-700 font-mono">
                            {student.studentCode}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {course.courseName}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-orange-700">
                          {log.periods} tiết
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{log.reason}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              log.recordedRole === 'advisor'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {log.recordedBy}
                          </span>
                        </td>
                        {!isOfficer && (
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() =>
                                onDeleteAbsenceLog(student.id, course.id, log.id)
                              }
                              title="Xóa lượt vắng này"
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
