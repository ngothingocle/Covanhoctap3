import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Calendar,
  User,
  Search,
  Download,
  Trash2,
  Edit2,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ClassGroup, CounselingLog, Student } from '../types';
import { exportCounselingLogsToExcel } from '../utils/exportUtils';

interface CounselingJournalProps {
  classGroup: ClassGroup;
  students: Student[];
  counselingLogs: CounselingLog[];
  onAddLog: (log: Partial<CounselingLog>) => void;
  onEditLog: (logId: string, updated: Partial<CounselingLog>) => void;
  onDeleteLog: (logId: string) => void;
}

export const CounselingJournal: React.FC<CounselingJournalProps> = ({
  classGroup,
  students,
  counselingLogs,
  onAddLog,
  onEditLog,
  onDeleteLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState<CounselingLog | null>(null);

  // Form states
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState('');
  const [solution, setSolution] = useState('');
  const [result, setResult] = useState('');
  const [followUp, setFollowUp] = useState('');

  const classLogs = counselingLogs.filter((l) => l.classId === classGroup.id);

  const filteredLogs = classLogs.filter((log) => {
    if (selectedStudentFilter && log.studentId !== selectedStudentFilter) {
      return false;
    }
    if (
      searchTerm &&
      !log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.topic.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.solution.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.result.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingLog(null);
    setStudentId(students[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setTopic('');
    setSolution('');
    setResult('');
    setFollowUp('');
    setShowModal(true);
  };

  const handleOpenEdit = (log: CounselingLog) => {
    setEditingLog(log);
    setStudentId(log.studentId);
    setDate(log.date);
    setTopic(log.topic);
    setSolution(log.solution);
    setResult(log.result);
    setFollowUp(log.followUp || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === studentId);
    if (!st || !topic.trim()) return;

    if (editingLog) {
      onEditLog(editingLog.id, {
        studentId: st.id,
        studentCode: st.studentCode,
        studentName: st.fullName,
        date,
        topic: topic.trim(),
        solution: solution.trim(),
        result: result.trim(),
        followUp: followUp.trim(),
      });
    } else {
      onAddLog({
        id: `csl-${Date.now()}`,
        classId: classGroup.id,
        studentId: st.id,
        studentCode: st.studentCode,
        studentName: st.fullName,
        date,
        topic: topic.trim(),
        solution: solution.trim(),
        result: result.trim(),
        followUp: followUp.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-blue-800 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-300" />
            <h2 className="text-lg font-bold">Nhật ký Trò chuyện & Tư vấn Sinh viên</h2>
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            Ghi chép diễn biến, phương án giải quyết và kết quả đồng hành cùng sinh viên lớp{' '}
            <b>{classGroup.name}</b>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Thêm Buổi trò chuyện mới</span>
          </button>

          <button
            onClick={() => exportCounselingLogsToExcel(classGroup, classLogs)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-900/50 hover:bg-emerald-900/70 border border-emerald-400/40 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Nhật ký Excel</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên SV, mã SV, vấn đề, giải pháp..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            aria-label="Lọc theo sinh viên"
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none w-full sm:w-auto"
          >
            <option value="">Tất cả sinh viên</option>
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.studentCode} - {st.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Card List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-medium">
            Chưa có nhật ký trò chuyện nào được tìm thấy. Bấm nút <b>"Thêm Buổi trò chuyện mới"</b> để tạo ghi nhận đầu tiên.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-emerald-300 transition space-y-3"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    {log.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{log.studentName}</span>
                      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {log.studentCode}
                      </span>
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-600" />
                      <span>Ngày trao đổi: <b>{log.date}</b></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(log)}
                    title="Sửa nhật ký"
                    className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteLog(log.id)}
                    title="Xóa nhật ký"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body: Vấn đề, Giải pháp, Kết quả */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-orange-50/70 border border-orange-200/80 rounded-xl space-y-1">
                  <span className="font-bold text-orange-900 block flex items-center gap-1">
                    📌 Vấn đề trao đổi:
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {log.topic}
                  </p>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1">
                  <span className="font-bold text-blue-900 block flex items-center gap-1">
                    💡 Phương án giải quyết:
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {log.solution}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-900 block flex items-center gap-1">
                    ✅ Kết quả đạt được:
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {log.result}
                  </p>
                </div>
              </div>

              {log.followUp && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="font-bold text-slate-700">🔎 Kế hoạch theo dõi tiếp theo:</span>
                  <span>{log.followUp}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Counseling Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-emerald-200 overflow-hidden my-6">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>{editingLog ? 'Sửa Nhật ký Trò chuyện' : 'Thêm Buổi Trò chuyện Mới'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sinh viên được tư vấn (*):
                  </label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.studentCode} - {st.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ngày trò chuyện (*):
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-orange-900 mb-1">
                  1. Vấn đề trao đổi (*):
                </label>
                <textarea
                  required
                  rows={2}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ví dụ: Tìm hiểu lý do vắng học nhiều tiết, động viên học tập, nợ môn, định hướng nghề nghiệp..."
                  className="w-full px-3 py-2 bg-orange-50/50 border border-orange-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-blue-900 mb-1">
                  2. Phương án giải quyết (*):
                </label>
                <textarea
                  required
                  rows={2}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Ví dụ: Liên hệ gia đình, phân công cán bộ lớp kèm cặp, lập thời gian biểu học lại học kỳ tới..."
                  className="w-full px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-900 mb-1">
                  3. Kết quả đạt được (*):
                </label>
                <textarea
                  required
                  rows={2}
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder="Ví dụ: Sinh viên cam kết đi học chuyên cần, cải thiện điểm số và làm bài tập đầy đủ..."
                  className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  4. Kế hoạch theo dõi thêm:
                </label>
                <input
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra lại vào buổi sinh hoạt lớp tuần sau"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  {editingLog ? 'Lưu cập nhật' : 'Thêm nhật ký'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
