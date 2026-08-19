import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Users,
  Home,
  ShieldCheck,
} from 'lucide-react';
import { ClassGroup, Student } from '../types';
import {
  downloadStudentImportTemplate,
  ParsedStudentRow,
  parseFileToStudents,
} from '../utils/importUtils';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classGroup: ClassGroup;
  onImportStudents: (students: Partial<Student>[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  classGroup,
  onImportStudents,
}) => {
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);
    setFileName(file.name);

    try {
      const students = await parseFileToStudents(file);
      if (students.length === 0) {
        setError('Không đọc được dữ liệu sinh viên nào từ file. Vui lòng kiểm tra cấu trúc cột.');
      } else {
        setParsedRows(students);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi đọc file. Vui lòng tải file mẫu để kiểm tra.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    const payload: Partial<Student>[] = parsedRows.map((r) => ({
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      studentCode: r.studentCode,
      fullName: r.fullName,
      classId: classGroup.id,
      birthYear: r.birthYear,
      gender: r.gender,
      ethnicity: r.ethnicity,
      permanentAddress: r.permanentAddress,
      studentPhone: r.studentPhone,
      relativePhone: r.relativePhone,
      residenceType: r.residenceType,
      boardingAddress: r.boardingAddress,
      landlordPhone: r.landlordPhone,
      dormRoom: r.dormRoom,
      relativeAddress: r.relativeAddress,
      isClassOfficer: r.isClassOfficer,
      officerPosition: r.officerPosition,
      officerPassword: r.isClassOfficer ? r.studentCode : undefined,
      grades: {},
      notes: 'Nhập tự động từ file',
    }));

    onImportStudents(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-orange-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Nhập Tự động Danh sách Sinh viên</h3>
              <p className="text-xs text-emerald-100">
                Hỗ trợ file Excel (.xlsx, .xls), CSV, Word | Lớp: {classGroup.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Action Step 1: Download Template */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                <span>Bước 1: Tải file Excel mẫu chuẩn</span>
              </h4>
              <p className="text-emerald-800 mt-0.5">
                File mẫu có sẵn các cột: Mã SV, Họ tên, Giới tính, Năm sinh, Địa chỉ, SĐT SV, SĐT Người thân, Nơi ở (Trọ, KTX, Người thân), Cán bộ lớp.
              </p>
            </div>
            <button
              onClick={downloadStudentImportTemplate}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải file Excel mẫu</span>
            </button>
          </div>

          {/* Action Step 2: Upload */}
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/60 transition cursor-pointer relative">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                {fileName ? `File đã chọn: ${fileName}` : 'Kéo thả hoặc bấm vào đây để chọn file Excel / File danh sách'}
              </div>
              <div className="text-xs text-slate-500">
                Hỗ trợ định dạng .xlsx, .xls, .csv
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Đã đọc được {parsedRows.length} sinh viên từ file:
                </h4>
                <span className="text-slate-500 font-semibold">
                  Kiểm tra trước khi lưu vào hệ thống
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2 px-3">Mã SV</th>
                      <th className="py-2 px-3">Họ và tên</th>
                      <th className="py-2 px-2 text-center">Giới tính</th>
                      <th className="py-2 px-2 text-center">Năm sinh</th>
                      <th className="py-2 px-3">SĐT SV / Người thân</th>
                      <th className="py-2 px-3">Cư trú</th>
                      <th className="py-2 px-3 text-center">Cán bộ lớp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-blue-700">
                          {r.studentCode}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">{r.fullName}</td>
                        <td className="py-2 px-2 text-center">{r.gender}</td>
                        <td className="py-2 px-2 text-center">{r.birthYear}</td>
                        <td className="py-2 px-3 text-[11px]">
                          <div>SV: {r.studentPhone || '-'}</div>
                          <div className="text-slate-400">Thân: {r.relativePhone || '-'}</div>
                        </td>
                        <td className="py-2 px-3 text-[11px]">
                          <span className="font-semibold text-slate-800">
                            {r.residenceType === 'tro'
                              ? '🏠 Trọ'
                              : r.residenceType === 'ktx'
                              ? '🏢 KTX'
                              : r.residenceType === 'nguoi_than'
                              ? '👥 Người thân'
                              : '🏡 Nhà riêng'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {r.isClassOfficer ? (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                              {r.officerPosition || 'Cán bộ'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">SV</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl"
          >
            Hủy
          </button>
          <button
            disabled={parsedRows.length === 0 || isLoading}
            onClick={handleConfirmImport}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Thêm {parsedRows.length} Sinh viên vào Lớp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
