import React, { useState } from 'react';
import {
  X,
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  GraduationCap,
  Users,
} from 'lucide-react';
import { ClassGroup } from '../types';

interface ClassManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassGroup[];
  activeClassId: string;
  onSelectClass: (classId: string) => void;
  onAddClass: (classData: Partial<ClassGroup>) => void;
  onEditClass: (classId: string, updated: Partial<ClassGroup>) => void;
  onDeleteClass: (classId: string) => void;
}

export const ClassManagerModal: React.FC<ClassManagerModalProps> = ({
  isOpen,
  onClose,
  classes,
  activeClassId,
  onSelectClass,
  onAddClass,
  onEditClass,
  onDeleteClass,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('2024 - 2028');
  const [department, setDepartment] = useState('Khoa Công nghệ Thông tin');

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingClassId(null);
    setCode('');
    setName('');
    setAcademicYear('2024 - 2028');
    setDepartment('Khoa Công nghệ Thông tin');
    setIsAdding(true);
  };

  const handleStartEdit = (cls: ClassGroup) => {
    setEditingClassId(cls.id);
    setCode(cls.code);
    setName(cls.name);
    setAcademicYear(cls.academicYear);
    setDepartment(cls.department);
    setIsAdding(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    if (editingClassId) {
      onEditClass(editingClassId, {
        code: code.trim(),
        name: name.trim(),
        academicYear: academicYear.trim(),
        department: department.trim(),
      });
    } else {
      onAddClass({
        id: `class-${Date.now()}`,
        code: code.trim(),
        name: name.trim(),
        academicYear: academicYear.trim(),
        department: department.trim(),
        advisorName: 'Cố vấn học tập - Ngọc Lê',
        advisorPhone: '0948090287',
      });
    }

    setIsAdding(false);
    setEditingClassId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-orange-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Quản lý Danh sách Lớp Chủ nhiệm</h3>
              <p className="text-xs text-orange-100">Chọn lớp quản lý hoặc thêm lớp mới</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!isAdding ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Danh sách {classes.length} Lớp đang quản lý:
                </span>
                <button
                  onClick={handleStartAdd}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Lớp mới</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {classes.map((cls) => {
                  const isActive = cls.id === activeClassId;
                  return (
                    <div
                      key={cls.id}
                      className={`p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-orange-50/80 border-orange-400 ring-2 ring-orange-300'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-orange-200/80 text-orange-900 px-2 py-0.5 rounded">
                            {cls.code}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{cls.name}</span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          Khóa: {cls.academicYear} | {cls.department}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isActive && (
                          <button
                            onClick={() => {
                              onSelectClass(cls.id);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                          >
                            Chọn lớp này
                          </button>
                        )}

                        <button
                          onClick={() => handleStartEdit(cls)}
                          title="Sửa thông tin lớp"
                          className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-white rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {classes.length > 1 && (
                          <button
                            onClick={() => onDeleteClass(cls.id)}
                            title="Xóa lớp này"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveClass} className="space-y-3.5 text-xs">
              <h4 className="font-bold text-slate-800 text-sm border-b pb-2">
                {editingClassId ? 'Chỉnh sửa Thông tin Lớp' : 'Thêm Lớp học Mới'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã Lớp (*):
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ví dụ: DH24CNTT01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Khóa / Năm học:
                  </label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="Ví dụ: 2024 - 2028"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên đầy đủ của Lớp (*):
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Đại học Công nghệ Thông tin Khóa 24 - Nhóm 1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Khoa / Bộ môn:
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Khoa Công nghệ Thông tin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md"
                >
                  {editingClassId ? 'Lưu thay đổi' : 'Tạo lớp'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
