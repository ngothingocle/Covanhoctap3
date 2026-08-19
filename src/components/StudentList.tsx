import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  FileText,
  Printer,
  Edit2,
  Trash2,
  Eye,
  UserCheck,
  Home,
  Building,
  Phone,
  AlertTriangle,
  FileDown,
  CheckCircle2,
  MessageSquarePlus,
} from 'lucide-react';
import { ClassGroup, CounselingLog, Course, Student } from '../types';
import { calculateStudentGPA, getAcademicClassification, getResidenceInfo } from '../utils/calculations';
import { exportClassGradesToExcel } from '../utils/exportUtils';

interface StudentListProps {
  classGroup: ClassGroup;
  students: Student[];
  courses: Course[];
  counselingLogs: CounselingLog[];
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onOpenImport: () => void;
  onSelectStudentForDossier: (student: Student) => void;
  onOpenCounselingForStudent: (student: Student) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  classGroup,
  students,
  courses,
  counselingLogs,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onOpenImport,
  onSelectStudentForDossier,
  onOpenCounselingForStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResidence, setFilterResidence] = useState<string>('all');
  const [filterOfficer, setFilterOfficer] = useState<string>('all');
  const [filterDebt, setFilterDebt] = useState<string>('all');

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      // Search term
      const matchesSearch =
        st.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.studentPhone.includes(searchTerm) ||
        st.permanentAddress.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Residence filter
      if (filterResidence !== 'all' && st.residenceType !== filterResidence) {
        return false;
      }

      // Officer filter
      if (filterOfficer === 'officer' && !st.isClassOfficer) return false;
      if (filterOfficer === 'regular' && st.isClassOfficer) return false;

      // Debt filter
      if (filterDebt !== 'all') {
        const calc = calculateStudentGPA(st, courses);
        if (filterDebt === 'debt' && calc.owedCoursesCount === 0) return false;
        if (filterDebt === 'passed' && calc.owedCoursesCount > 0) return false;
      }

      return true;
    });
  }, [students, searchTerm, filterResidence, filterOfficer, filterDebt, courses]);

  const handleExportClassExcel = () => {
    exportClassGradesToExcel(classGroup, students, courses);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Danh sách Sinh viên:</span>
            <span className="text-orange-600 font-black">{classGroup.name}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hiển thị {filteredStudents.length} / {students.length} sinh viên | Khóa: {classGroup.academicYear}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAddStudent}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-orange-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sinh viên</span>
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Nhập Excel / File</span>
          </button>

          <button
            onClick={handleExportClassExcel}
            title="Xuất bảng điểm & danh sách lớp ra file Excel"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Xuất Danh sách Excel</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã SV, Họ tên, SĐT, Quê quán..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Residence Filter */}
          <select
            value={filterResidence}
            onChange={(e) => setFilterResidence(e.target.value)}
            aria-label="Lọc hình thức cư trú"
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="all">Tất cả nơi ở</option>
            <option value="tro">🏠 Ở nhà trọ</option>
            <option value="ktx">🏢 Ở Ký túc xá (KTX)</option>
            <option value="nguoi_than">👥 Ở nhà người thân</option>
            <option value="nha_rieng">🏡 Nhà riêng / Gia đình</option>
          </select>

          {/* Class Officer Filter */}
          <select
            value={filterOfficer}
            onChange={(e) => setFilterOfficer(e.target.value)}
            aria-label="Lọc cán bộ lớp"
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="officer">⭐ Cán bộ lớp (Được cấp quyền)</option>
            <option value="regular">Sinh viên thường</option>
          </select>

          {/* Debt Filter */}
          <select
            value={filterDebt}
            onChange={(e) => setFilterDebt(e.target.value)}
            aria-label="Lọc tình trạng học tập"
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="all">Tất cả tình trạng học tập</option>
            <option value="debt">⚠️ Sinh viên Nợ môn (&lt;4.0)</option>
            <option value="passed">✓ Đã đạt tất cả các môn</option>
          </select>
        </div>
      </div>

      {/* Main Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center w-12">STT</th>
                <th className="py-3.5 px-3 min-w-[110px]">Mã SV</th>
                <th className="py-3.5 px-3 min-w-[180px]">Họ và tên</th>
                <th className="py-3.5 px-2.5 text-center min-w-[80px]">Giới tính</th>
                <th className="py-3.5 px-2.5 text-center min-w-[80px]">Năm sinh</th>
                <th className="py-3.5 px-3 min-w-[130px]">Liên hệ SV / Thân</th>
                <th className="py-3.5 px-3 min-w-[180px]">Tình trạng Cư trú</th>
                <th className="py-3.5 px-3 min-w-[140px] text-center">Học tập & Môn nợ</th>
                <th className="py-3.5 px-3 min-w-[120px] text-center">Cán bộ lớp</th>
                <th className="py-3.5 px-3 text-center min-w-[140px] sticky right-0 bg-slate-50/95 backdrop-blur-xs">
                  Thao tác & Hồ sơ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Không tìm thấy sinh viên nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const calc = calculateStudentGPA(student, courses);
                  const classification = getAcademicClassification(calc.gpa);
                  const resInfo = getResidenceInfo(student.residenceType);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-orange-50/30 transition-colors group"
                    >
                      {/* STT */}
                      <td className="py-3.5 px-3 text-center text-slate-400 font-semibold">
                        {idx + 1}
                      </td>

                      {/* Mã SV */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => onSelectStudentForDossier(student)}
                          className="font-mono font-bold text-blue-700 hover:text-orange-600 hover:underline flex items-center gap-1"
                          title="Bấm để xem & trích xuất hồ sơ đầy đủ"
                        >
                          <span>{student.studentCode}</span>
                        </button>
                      </td>

                      {/* Họ và tên & Quê quán */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 text-sm">
                          {student.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={student.permanentAddress}>
                          {student.permanentAddress}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Dân tộc: {student.ethnicity}
                        </div>
                      </td>

                      {/* Giới tính */}
                      <td className="py-3.5 px-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            student.gender === 'Nữ'
                              ? 'bg-pink-100 text-pink-700'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {student.gender}
                        </span>
                      </td>

                      {/* Năm sinh */}
                      <td className="py-3.5 px-2.5 text-center text-slate-600">
                        {student.birthYear}
                      </td>

                      {/* Liên hệ */}
                      <td className="py-3.5 px-3 space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                          <Phone className="w-3 h-3 text-orange-500 shrink-0" />
                          <span>{student.studentPhone || 'Chưa có SĐT'}</span>
                        </div>
                        {student.relativePhone && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[150px]" title={student.relativePhone}>
                            {student.relativePhone}
                          </div>
                        )}
                      </td>

                      {/* Tình trạng Cư trú */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${resInfo.badgeColor}`}
                          >
                            {student.residenceType === 'tro' && <Home className="w-3 h-3" />}
                            {student.residenceType === 'ktx' && <Building className="w-3 h-3" />}
                            {resInfo.label}
                          </span>
                        </div>

                        {student.residenceType === 'tro' && (
                          <div className="text-[11px] text-slate-600 leading-tight">
                            <span className="truncate block max-w-[180px]" title={student.boardingAddress}>
                              {student.boardingAddress || 'Chưa cập nhật địa chỉ trọ'}
                            </span>
                            {student.landlordPhone && (
                              <span className="text-[10px] text-slate-500 block">
                                SĐT chủ: {student.landlordPhone}
                              </span>
                            )}
                          </div>
                        )}

                        {student.residenceType === 'ktx' && (
                          <div className="text-[11px] font-semibold text-blue-700">
                            {student.dormRoom || 'Chưa cập nhật phòng'}
                          </div>
                        )}

                        {student.residenceType === 'nguoi_than' && (
                          <div className="text-[11px] text-purple-700 truncate max-w-[180px]" title={student.relativeAddress}>
                            {student.relativeAddress || 'Chưa cập nhật'}
                          </div>
                        )}
                      </td>

                      {/* Học tập & Môn nợ */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-bold text-slate-900 text-sm">
                          GPA: <span className="text-blue-700">{calc.gpa !== null ? calc.gpa : '-'}</span>
                        </div>
                        <div className="mt-0.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${classification.badgeColor}`}>
                            {classification.rank}
                          </span>
                        </div>
                        {calc.owedCoursesCount > 0 ? (
                          <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Nợ {calc.owedCoursesCount} môn</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                            ✓ Không nợ
                          </div>
                        )}
                      </td>

                      {/* Cán bộ lớp & Quyền truy cập */}
                      <td className="py-3.5 px-3 text-center">
                        {student.isClassOfficer ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                              <span>{student.officerPosition || 'Cán bộ lớp'}</span>
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                              TK: {student.studentCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Sinh viên</span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-3 text-center sticky right-0 bg-white group-hover:bg-orange-50/50 shadow-l transition">
                        <div className="flex items-center justify-center gap-1">
                          {/* Trích xuất hồ sơ cá nhân */}
                          <button
                            onClick={() => onSelectStudentForDossier(student)}
                            title="Xem & Trích xuất Hồ sơ cá nhân (PDF/Word/Excel)"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Thêm nhanh nhật ký trao đổi */}
                          <button
                            onClick={() => onOpenCounselingForStudent(student)}
                            title="Tạo buổi trò chuyện / tư vấn cho SV này"
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <MessageSquarePlus className="w-4 h-4" />
                          </button>

                          {/* Sửa */}
                          <button
                            onClick={() => onEditStudent(student)}
                            title="Chỉnh sửa thông tin sinh viên"
                            className="p-1.5 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Xóa */}
                          <button
                            onClick={() => onDeleteStudent(student.id)}
                            title="Xóa sinh viên khỏi danh sách"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
