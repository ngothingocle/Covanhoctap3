import React from 'react';
import {
  X,
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  AlertTriangle,
  User,
  Phone,
  Home,
  Building,
  GraduationCap,
  Calendar,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { ClassGroup, CounselingLog, Course, Student } from '../types';
import {
  calculateStudentGPA,
  getAcademicClassification,
  getResidenceInfo,
} from '../utils/calculations';
import {
  exportStudentToExcel,
  exportStudentToWord,
  printOrExportPDF,
} from '../utils/exportUtils';

interface StudentDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  classGroup: ClassGroup;
  courses: Course[];
  counselingLogs: CounselingLog[];
}

export const StudentDossierModal: React.FC<StudentDossierModalProps> = ({
  isOpen,
  onClose,
  student,
  classGroup,
  courses,
  counselingLogs,
}) => {
  if (!isOpen || !student) return null;

  const calc = calculateStudentGPA(student, courses);
  const classification = getAcademicClassification(calc.gpa);
  const resInfo = getResidenceInfo(student.residenceType);
  const studentLogs = counselingLogs.filter(
    (l) => l.studentId === student.id || l.studentCode === student.studentCode
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-orange-200 overflow-hidden my-6">
        {/* Dossier Header */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-blue-700 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl text-white shadow-inner">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Trích xuất Hồ sơ Sinh viên</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">{student.fullName}</h2>
              <p className="text-xs text-orange-100 font-mono">
                Mã SV: <b className="text-white">{student.studentCode}</b> | Lớp: {classGroup.name} ({classGroup.code})
              </p>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Print / PDF */}
            <button
              onClick={() => printOrExportPDF(student, classGroup, courses, counselingLogs)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-800 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              title="Xuất file PDF hoặc In trực tiếp"
            >
              <Printer className="w-4 h-4 text-red-600" />
              <span>In / Xuất PDF</span>
            </button>

            {/* Word .doc */}
            <button
              onClick={() => exportStudentToWord(student, classGroup, courses, counselingLogs)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              title="Tải xuống file Word (.doc)"
            >
              <FileText className="w-4 h-4" />
              <span>Xuất Word (.doc)</span>
            </button>

            {/* Excel .xlsx */}
            <button
              onClick={() => exportStudentToExcel(student, classGroup, courses, counselingLogs)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              title="Tải xuống file Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel (.xlsx)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
              <span className="text-[11px] font-bold text-blue-900 block">Điểm trung bình (GPA)</span>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {calc.gpa !== null ? calc.gpa : 'Chưa có'}
              </div>
              <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] ${classification.badgeColor}`}>
                {classification.rank}
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${calc.owedCoursesCount > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <span className={`text-[11px] font-bold block ${calc.owedCoursesCount > 0 ? 'text-red-900' : 'text-emerald-900'}`}>
                Tình trạng Môn nợ
              </span>
              <div className={`text-2xl font-black mt-1 ${calc.owedCoursesCount > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {calc.owedCoursesCount > 0 ? `${calc.owedCoursesCount} môn` : '0 môn'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                {calc.owedCoursesCount > 0 ? 'Điểm tổng kết < 4.0' : 'Đã qua tất cả môn'}
              </span>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
              <span className="text-[11px] font-bold text-amber-900 block">Tổng số tiết vắng</span>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {calc.totalAbsentPeriods} <span className="text-xs font-normal">tiết</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Theo dõi qua điểm danh
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-800 block">Số tín chỉ</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {calc.gradedCredits} / {calc.totalCredits}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Tín chỉ đã có điểm
              </span>
            </div>
          </div>

          {/* Section 1: Thông tin cá nhân & Liên hệ */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <User className="w-4 h-4 text-orange-600" />
              I. Thông tin Cá nhân & Liên hệ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Họ và tên:</span>
                <span className="font-bold text-slate-900 text-sm">{student.fullName}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Mã sinh viên:</span>
                <span className="font-mono font-bold text-blue-700 text-sm">{student.studentCode}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Lớp & Khóa:</span>
                <span className="font-bold text-slate-800">{classGroup.name} ({classGroup.academicYear})</span>
              </div>

              <div>
                <span className="text-slate-500 block">Giới tính:</span>
                <span className="font-semibold text-slate-800">{student.gender}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Năm sinh:</span>
                <span className="font-semibold text-slate-800">{student.birthYear}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Dân tộc:</span>
                <span className="font-semibold text-slate-800">{student.ethnicity}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Số điện thoại SV:</span>
                <span className="font-bold text-orange-700">{student.studentPhone || 'Chưa có'}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-500 block">Số điện thoại Người thân:</span>
                <span className="font-semibold text-slate-800">{student.relativePhone || 'Chưa có'}</span>
              </div>

              <div className="sm:col-span-3">
                <span className="text-slate-500 block">Địa chỉ thường trú:</span>
                <span className="font-medium text-slate-800">{student.permanentAddress}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Tình trạng cư trú */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Home className="w-4 h-4 text-blue-600" />
              II. Tình trạng Cư trú
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Hình thức:</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${resInfo.badgeColor}`}>
                {resInfo.label}
              </span>
            </div>

            {student.residenceType === 'tro' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <span className="text-slate-500 block">Địa chỉ nhà trọ:</span>
                  <span className="font-medium text-slate-800">{student.boardingAddress || 'Chưa có thông tin'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">SĐT Chủ nhà trọ:</span>
                  <span className="font-bold text-orange-700">{student.landlordPhone || 'Chưa có thông tin'}</span>
                </div>
              </div>
            )}

            {student.residenceType === 'ktx' && (
              <div className="text-xs pt-1">
                <span className="text-slate-500 block">Phòng Ký túc xá:</span>
                <span className="font-bold text-blue-800 text-sm">{student.dormRoom || 'Chưa có thông tin'}</span>
              </div>
            )}

            {student.residenceType === 'nguoi_than' && (
              <div className="text-xs pt-1">
                <span className="text-slate-500 block">Thông tin Nhà người thân:</span>
                <span className="font-medium text-purple-900">{student.relativeAddress || 'Chưa có thông tin'}</span>
              </div>
            )}
          </div>

          {/* Section 3: Môn học & Điểm số chi tiết */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5 text-orange-700">
                <BookOpen className="w-4 h-4 text-orange-600" />
                <span>III. Chi tiết Môn học, Điểm số & Số tiết vắng</span>
              </div>
              <div className="text-[11px] font-normal text-slate-500">
                Thuật toán GPA: Tổng (Điểm * Tín chỉ) / Tổng tín chỉ
              </div>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Mã môn</th>
                    <th className="py-2.5 px-3">Tên môn học</th>
                    <th className="py-2.5 px-3 text-center">Tín chỉ</th>
                    <th className="py-2.5 px-3 text-center">Điểm tổng kết</th>
                    <th className="py-2.5 px-3 text-center">Trọng số (Điểm x TC)</th>
                    <th className="py-2.5 px-3 text-center">Tình trạng</th>
                    <th className="py-2.5 px-3 text-center">Số tiết vắng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((course) => {
                    const gradeInfo = student.grades?.[course.id];
                    const grade = gradeInfo?.finalGrade;
                    const absent = gradeInfo?.absentPeriods || 0;
                    const isOwed = grade !== null && grade !== undefined && grade < 4.0;
                    const weight = grade !== null && grade !== undefined ? (grade * course.credits).toFixed(2) : '-';

                    return (
                      <tr key={course.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{course.courseCode}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{course.courseName}</td>
                        <td className="py-2.5 px-3 text-center font-semibold">{course.credits}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-sm text-slate-900">
                          {grade !== null && grade !== undefined ? grade : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600">{weight}</td>
                        <td className="py-2.5 px-3 text-center">
                          {isOwed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                              <AlertTriangle className="w-3 h-3" />
                              Nợ môn (&lt;4)
                            </span>
                          ) : grade !== null && grade !== undefined ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              ✓ Đạt
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Chưa nhập</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {absent > 0 ? (
                            <span className="text-orange-600">{absent} tiết</span>
                          ) : (
                            <span className="text-slate-400 font-normal">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Nhật ký trò chuyện & Tư vấn */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-2">
              <span>IV. Nhật ký Trò chuyện & Tư vấn của Cố vấn</span>
              <span className="text-[11px] font-semibold text-slate-500">
                {studentLogs.length} buổi tư vấn
              </span>
            </h3>

            {studentLogs.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-3 text-center">
                Chưa có buổi tư vấn nào được ghi nhận cho sinh viên này.
              </div>
            ) : (
              <div className="space-y-3">
                {studentLogs.map((log) => (
                  <div key={log.id} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span className="flex items-center gap-1.5 text-orange-700">
                        <Calendar className="w-3.5 h-3.5" />
                        Ngày trao đổi: {log.date}
                      </span>
                    </div>
                    <div>
                      <b className="text-slate-800">Vấn đề:</b> <span className="text-slate-700">{log.topic}</span>
                    </div>
                    <div>
                      <b className="text-blue-800">Phương án giải quyết:</b> <span className="text-slate-700">{log.solution}</span>
                    </div>
                    <div>
                      <b className="text-emerald-800">Kết quả:</b> <span className="text-slate-700">{log.result}</span>
                    </div>
                    {log.followUp && (
                      <div className="text-[11px] text-slate-500 italic">
                        Theo dõi thêm: {log.followUp}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <div>
            Cố vấn phụ trách: <b>{classGroup.advisorName}</b> - Hotline: <b>0948090287</b>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
