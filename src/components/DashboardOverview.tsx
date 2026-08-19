import React from 'react';
import {
  Users,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Home,
  Building,
  UserCheck,
  MessageSquare,
  FileSpreadsheet,
  Plus,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ClassGroup, CounselingLog, Course, Student } from '../types';
import { calculateStudentGPA } from '../utils/calculations';
import { TabType } from './Navbar';

interface DashboardOverviewProps {
  activeClass: ClassGroup;
  students: Student[];
  courses: Course[];
  counselingLogs: CounselingLog[];
  onNavigate: (tab: TabType) => void;
  onOpenAddStudent: () => void;
  onOpenImport: () => void;
  onSelectStudentForDossier: (student: Student) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  activeClass,
  students,
  courses,
  counselingLogs,
  onNavigate,
  onOpenAddStudent,
  onOpenImport,
  onSelectStudentForDossier,
}) => {
  // Statistics calculations
  const totalStudents = students.length;
  const officersCount = students.filter((s) => s.isClassOfficer).length;
  const boardersCount = students.filter((s) => s.residenceType === 'tro').length;
  const dormCount = students.filter((s) => s.residenceType === 'ktx').length;
  const relativesCount = students.filter((s) => s.residenceType === 'nguoi_than').length;
  const homeCount = students.filter((s) => s.residenceType === 'nha_rieng').length;

  // Students with debt (<4.0) or high absences (> 3 periods)
  const studentsWithDebt = students
    .map((s) => {
      const calc = calculateStudentGPA(s, courses);
      return { student: s, calc };
    })
    .filter((item) => item.calc.owedCoursesCount > 0);

  const studentsWithAbsence = students
    .map((s) => {
      const calc = calculateStudentGPA(s, courses);
      return { student: s, calc };
    })
    .filter((item) => item.calc.totalAbsentPeriods > 0)
    .sort((a, b) => b.calc.totalAbsentPeriods - a.calc.totalAbsentPeriods);

  const recentCounseling = counselingLogs
    .filter((l) => l.classId === activeClass.id)
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-900/10">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-orange-100">
              <GraduationCap className="w-4 h-4" />
              <span>Cố vấn học tập: {activeClass.advisorName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {activeClass.name}
            </h1>
            <p className="text-sm text-orange-100 max-w-xl leading-relaxed">
              Mã lớp: <b className="text-white">{activeClass.code}</b> | Khóa học:{' '}
              <b className="text-white">{activeClass.academicYear}</b> | Khoa:{' '}
              <b className="text-white">{activeClass.department}</b>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddStudent}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-orange-600" />
              <span>+ Thêm Sinh viên</span>
            </button>

            <button
              onClick={onOpenImport}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/30 hover:bg-orange-500/40 border border-white/30 text-white font-bold text-xs sm:text-sm rounded-xl backdrop-blur-md transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Nhập Excel / File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng sinh viên */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng số Sinh viên
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalStudents}</span>
            <span className="text-xs font-semibold text-slate-500">sinh viên</span>
          </div>
          <div className="mt-2 text-xs text-orange-700 font-medium flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{officersCount} cán bộ lớp được cấp quyền</span>
          </div>
        </div>

        {/* Card 2: Sinh viên Nợ môn */}
        <div
          onClick={() => onNavigate('grades')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-red-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sinh viên Nợ môn (&lt;4.0)
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-600">{studentsWithDebt.length}</span>
            <span className="text-xs font-semibold text-red-600/80">cần theo dõi</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Điểm môn &lt; 4.0 coi như nợ môn
          </div>
        </div>

        {/* Card 3: Môn học quản lý */}
        <div
          onClick={() => onNavigate('grades')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Môn học & Tín chỉ
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-700">{courses.length}</span>
            <span className="text-xs font-semibold text-slate-500">môn học</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Tổng {courses.reduce((sum, c) => sum + c.credits, 0)} tín chỉ trong kỳ
          </div>
        </div>

        {/* Card 4: Nhật ký trò chuyện */}
        <div
          onClick={() => onNavigate('counseling')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nhật ký Tư vấn SV
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">
              {counselingLogs.filter((l) => l.classId === activeClass.id).length}
            </span>
            <span className="text-xs font-semibold text-slate-500">lượt trao đổi</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Giải quyết khúc mắc & học tập
          </div>
        </div>
      </div>

      {/* Residence Breakdown Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Home className="w-4 h-4 text-orange-600" />
          Phân bố Tình trạng Cư trú Sinh viên ({totalStudents} SV)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500 text-white font-bold text-xs">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-amber-900">{boardersCount}</div>
              <div className="text-xs font-semibold text-amber-800">Ở Nhà Trọ</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/70 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white font-bold text-xs">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-blue-900">{dormCount}</div>
              <div className="text-xs font-semibold text-blue-800">Ký Túc Xá (KTX)</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200/70 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-600 text-white font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-purple-900">{relativesCount}</div>
              <div className="text-xs font-semibold text-purple-800">Nhà Người Thân</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600 text-white font-bold text-xs">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-emerald-900">{homeCount}</div>
              <div className="text-xs font-semibold text-emerald-800">Nhà Riêng / Gia Đình</div>
            </div>
          </div>
        </div>
      </div>

      {/* Split Section: At Risk Students & Recent Counseling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Students Needing Attention (Nợ môn hoặc Vắng nhiều) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">
                Sinh viên cần Cố vấn hỗ trợ (Nợ môn / Vắng)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('grades')}
              className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 space-y-3 flex-1">
            {studentsWithDebt.length === 0 && studentsWithAbsence.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                🎉 Không có sinh viên nào nợ môn hoặc có số tiết vắng đáng kể trong lớp.
              </div>
            ) : (
              <>
                {studentsWithDebt.map(({ student, calc }) => (
                  <div
                    key={student.id}
                    className="p-3 rounded-xl bg-red-50/60 border border-red-200/80 flex items-center justify-between gap-3 hover:bg-red-50 transition cursor-pointer"
                    onClick={() => onSelectStudentForDossier(student)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-200 text-red-800 font-bold flex items-center justify-center text-xs">
                        {student.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{student.fullName}</span>
                          <span className="font-mono text-[11px] text-slate-500 font-normal">
                            ({student.studentCode})
                          </span>
                        </div>
                        <div className="text-[11px] text-red-700 font-medium">
                          Nợ {calc.owedCoursesCount} môn: {calc.owedCourses.map((c) => c.courseName).join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-red-600 block">
                        GPA: {calc.gpa !== null ? calc.gpa : 'N/A'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        Vắng: {calc.totalAbsentPeriods} tiết
                      </span>
                    </div>
                  </div>
                ))}

                {studentsWithAbsence
                  .filter((item) => !studentsWithDebt.some((d) => d.student.id === item.student.id))
                  .slice(0, 3)
                  .map(({ student, calc }) => (
                    <div
                      key={student.id}
                      className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/80 flex items-center justify-between gap-3 hover:bg-orange-50 transition cursor-pointer"
                      onClick={() => onSelectStudentForDossier(student)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-200 text-orange-800 font-bold flex items-center justify-center text-xs">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <span>{student.fullName}</span>
                            <span className="font-mono text-[11px] text-slate-500 font-normal">
                              ({student.studentCode})
                            </span>
                          </div>
                          <div className="text-[11px] text-orange-700 font-medium">
                            Số tiết vắng: <b>{calc.totalAbsentPeriods} tiết</b>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-blue-700 block">
                          GPA: {calc.gpa !== null ? calc.gpa : 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-500">Xem hồ sơ</span>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>

        {/* Right: Recent Counseling Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">
                Nhật ký Trò chuyện & Tư vấn gần đây
              </h3>
            </div>
            <button
              onClick={() => onNavigate('counseling')}
              className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 space-y-3 flex-1">
            {recentCounseling.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                Chưa có buổi tư vấn nào được ghi trong lớp này.
              </div>
            ) : (
              recentCounseling.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {log.studentName} ({log.studentCode})
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {log.date}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 line-clamp-2">
                    <b className="text-orange-800">Vấn đề:</b> {log.topic}
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-1 line-clamp-1">
                    <b>Kết quả:</b> {log.result}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
