import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  Download,
  Calculator,
} from 'lucide-react';
import { ClassGroup, Course, Student } from '../types';
import { calculateStudentGPA, getAcademicClassification } from '../utils/calculations';
import { exportClassGradesToExcel } from '../utils/exportUtils';

interface CourseGradeListProps {
  classGroup: ClassGroup;
  courses: Course[];
  students: Student[];
  onAddCourse: (course: Partial<Course>) => void;
  onEditCourse: (courseId: string, updated: Partial<Course>) => void;
  onDeleteCourse: (courseId: string) => void;
  onUpdateGrade: (studentId: string, courseId: string, finalGrade: number | null) => void;
  onSelectStudentForDossier: (student: Student) => void;
}

export const CourseGradeList: React.FC<CourseGradeListProps> = ({
  classGroup,
  courses,
  students,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onUpdateGrade,
  onSelectStudentForDossier,
}) => {
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState(3);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Quick inline edit cell
  const [editingCell, setEditingCell] = useState<{
    studentId: string;
    courseId: string;
    value: string;
  } | null>(null);

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) return;

    if (editingCourse) {
      onEditCourse(editingCourse.id, {
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        credits: Number(credits) || 1,
      });
      setEditingCourse(null);
    } else {
      onAddCourse({
        id: `c-${Date.now()}`,
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        credits: Number(credits) || 1,
        semester: 'Học kỳ 1',
        academicYear: classGroup.academicYear,
        classId: classGroup.id,
      });
    }

    setCourseCode('');
    setCourseName('');
    setCredits(3);
    setShowAddCourseModal(false);
  };

  const handleCellBlur = (studentId: string, courseId: string, val: string) => {
    const trimmed = val.trim();
    if (trimmed === '' || isNaN(Number(trimmed))) {
      onUpdateGrade(studentId, courseId, null);
    } else {
      let num = parseFloat(trimmed);
      if (num < 0) num = 0;
      if (num > 10) num = 10;
      onUpdateGrade(studentId, courseId, Number(num.toFixed(1)));
    }
    setEditingCell(null);
  };

  // Class analytics
  const totalOwedCount = students.reduce((acc, st) => {
    const calc = calculateStudentGPA(st, courses);
    return acc + calc.owedCoursesCount;
  }, 0);

  const studentsWithOwed = students.filter(
    (st) => calculateStudentGPA(st, courses).owedCoursesCount > 0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Algorithm Explanation */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold">Môn học, Bảng điểm & Quản lý Nợ môn</h2>
          </div>
          <p className="text-xs text-blue-200 leading-relaxed max-w-2xl">
            <b>Thuật toán Điểm trung bình (GPA):</b> Lấy <code>(Điểm tổng kết x Tín chỉ)</code> của từng môn rồi cộng tất cả lại, sau đó chia cho <code>Tổng số tín chỉ</code>. Tất cả làm tròn 2 chữ số thập phân. Sinh viên có điểm tổng kết <b>&lt; 4.0</b> được tính là <b>Nợ môn</b>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingCourse(null);
              setCourseCode('');
              setCourseName('');
              setCredits(3);
              setShowAddCourseModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Môn học mới</span>
          </button>

          <button
            onClick={() => exportClassGradesToExcel(classGroup, students, courses)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Bảng điểm Excel</span>
          </button>
        </div>
      </div>

      {/* Courses Pill List */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Danh sách Môn học trong học kỳ ({courses.length} môn)
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            Tổng tín chỉ: <b className="text-blue-700">{courses.reduce((sum, c) => sum + c.credits, 0)} TC</b>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-blue-300 transition"
            >
              <div>
                <div className="font-mono text-xs font-bold text-blue-700">
                  {course.courseCode} ({course.credits} TC)
                </div>
                <div className="text-xs font-semibold text-slate-800 truncate max-w-[170px]" title={course.courseName}>
                  {course.courseName}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingCourse(course);
                    setCourseCode(course.courseCode);
                    setCourseName(course.courseName);
                    setCredits(course.credits);
                    setShowAddCourseModal(true);
                  }}
                  title="Sửa môn học"
                  className="p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteCourse(course.id)}
                  title="Xóa môn học"
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grade Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-slate-900">
              Bảng điểm Tổng kết & Thống kê Nợ môn
            </h3>
            <span className="text-xs text-slate-500">
              (Nhấp vào ô điểm để sửa nhanh)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />
              <span className="text-slate-600 font-medium">Nợ môn (&lt; 4.0)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
              <span className="text-slate-600 font-medium">Đạt (&ge; 4.0)</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 text-center w-10 sticky left-0 bg-slate-50 z-10">STT</th>
                <th className="py-3 px-3 min-w-[100px] sticky left-10 bg-slate-50 z-10">Mã SV</th>
                <th className="py-3 px-3 min-w-[160px] sticky left-36 bg-slate-50 z-10 border-r border-slate-200">
                  Họ và tên
                </th>
                {courses.map((course) => (
                  <th key={course.id} className="py-3 px-3 text-center min-w-[110px]">
                    <div>{course.courseCode}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {course.credits} TC
                    </div>
                  </th>
                ))}
                <th className="py-3 px-3 text-center min-w-[100px] bg-blue-50/50">
                  Điểm TB (GPA)
                </th>
                <th className="py-3 px-3 text-center min-w-[90px]">Xếp loại</th>
                <th className="py-3 px-3 text-center min-w-[100px] bg-red-50/50">
                  Môn nợ
                </th>
                <th className="py-3 px-3 text-center min-w-[90px]">
                  Tổng vắng
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6 + courses.length} className="py-8 text-center text-slate-400">
                    Chưa có sinh viên trong lớp này.
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => {
                  const calc = calculateStudentGPA(student, courses);
                  const classification = getAcademicClassification(calc.gpa);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition group">
                      {/* STT */}
                      <td className="py-3 px-3 text-center text-slate-400 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                        {idx + 1}
                      </td>

                      {/* Mã SV */}
                      <td className="py-3 px-3 font-mono font-bold text-blue-700 sticky left-10 bg-white group-hover:bg-slate-50 z-10">
                        <button
                          onClick={() => onSelectStudentForDossier(student)}
                          className="hover:underline text-left"
                        >
                          {student.studentCode}
                        </button>
                      </td>

                      {/* Họ tên */}
                      <td className="py-3 px-3 font-bold text-slate-900 sticky left-36 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200">
                        {student.fullName}
                      </td>

                      {/* Grades for each course */}
                      {courses.map((course) => {
                        const gradeInfo = student.grades?.[course.id];
                        const grade = gradeInfo?.finalGrade;
                        const isEditing =
                          editingCell?.studentId === student.id &&
                          editingCell?.courseId === course.id;
                        const isOwed = grade !== null && grade !== undefined && grade < 4.0;

                        return (
                          <td
                            key={course.id}
                            className={`py-2 px-2 text-center transition ${
                              isOwed ? 'bg-red-50/60 font-bold text-red-700' : ''
                            }`}
                          >
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                autoFocus
                                value={editingCell.value}
                                onChange={(e) =>
                                  setEditingCell({
                                    ...editingCell,
                                    value: e.target.value,
                                  })
                                }
                                onBlur={() =>
                                  handleCellBlur(
                                    student.id,
                                    course.id,
                                    editingCell.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCellBlur(
                                      student.id,
                                      course.id,
                                      editingCell.value
                                    );
                                  } else if (e.key === 'Escape') {
                                    setEditingCell(null);
                                  }
                                }}
                                className="w-16 px-1.5 py-1 text-center bg-white border-2 border-orange-500 rounded font-bold text-xs focus:outline-none"
                              />
                            ) : (
                              <button
                                onClick={() =>
                                  setEditingCell({
                                    studentId: student.id,
                                    courseId: course.id,
                                    value: grade !== null && grade !== undefined ? String(grade) : '',
                                  })
                                }
                                className={`w-full py-1.5 px-2 rounded hover:ring-1 hover:ring-orange-400 transition cursor-pointer font-bold ${
                                  grade !== null && grade !== undefined
                                    ? isOwed
                                      ? 'text-red-700 bg-red-100/70 border border-red-300'
                                      : 'text-slate-800 bg-slate-100/60'
                                    : 'text-slate-300 font-normal hover:bg-slate-100'
                                }`}
                                title="Bấm để sửa điểm"
                              >
                                {grade !== null && grade !== undefined ? grade : '-'}
                              </button>
                            )}
                          </td>
                        );
                      })}

                      {/* GPA */}
                      <td className="py-3 px-3 text-center bg-blue-50/40">
                        <span className="font-extrabold text-sm text-blue-700">
                          {calc.gpa !== null ? calc.gpa.toFixed(2) : '-'}
                        </span>
                      </td>

                      {/* Xếp loại */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${classification.badgeColor}`}>
                          {classification.rank}
                        </span>
                      </td>

                      {/* Môn nợ */}
                      <td className="py-3 px-3 text-center bg-red-50/40">
                        {calc.owedCoursesCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-300">
                            <AlertTriangle className="w-3 h-3" />
                            {calc.owedCoursesCount} môn
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold">0</span>
                        )}
                      </td>

                      {/* Tổng vắng */}
                      <td className="py-3 px-3 text-center">
                        {calc.totalAbsentPeriods > 0 ? (
                          <span className="font-bold text-orange-700">
                            {calc.totalAbsentPeriods} tiết
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">0</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-orange-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-sm">
                {editingCourse ? 'Sửa Môn học' : 'Thêm Môn học mới'}
              </h3>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã môn học (*):
                </label>
                <input
                  type="text"
                  required
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="Ví dụ: TIN101, TOAN202..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên môn học (*):
                </label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Ví dụ: Cấu trúc dữ liệu và Giải thuật"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số tín chỉ (*):
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Số tín chỉ dùng để tính điểm trung bình GPA theo trọng số.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {editingCourse ? 'Cập nhật' : 'Thêm môn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
