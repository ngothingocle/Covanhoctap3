import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  UserCheck,
  KeyRound,
  LogIn,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { AppState, UserRole, UserSession } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onLoginSuccess: (session: UserSession) => void;
  onOpenForgotPassword: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  appState,
  onLoginSuccess,
  onOpenForgotPassword,
}) => {
  const [role, setRole] = useState<UserRole>('advisor');
  const [username, setUsername] = useState(appState.advisorAccount.username);
  const [password, setPassword] = useState(appState.advisorAccount.password);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setError(null);
    if (newRole === 'advisor') {
      setUsername(appState.advisorAccount.username);
      setPassword(appState.advisorAccount.password);
    } else {
      // Find first officer as convenience placeholder or clean
      const firstOfficer = appState.students.find((s) => s.isClassOfficer);
      setUsername(firstOfficer ? firstOfficer.studentCode : '');
      setPassword(firstOfficer ? firstOfficer.officerPassword || firstOfficer.studentCode : '');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mã đăng nhập!');
      return;
    }

    if (role === 'advisor') {
      // Check advisor credentials
      if (
        cleanUsername === appState.advisorAccount.username &&
        cleanPassword === appState.advisorAccount.password
      ) {
        onLoginSuccess({
          role: 'advisor',
          username: appState.advisorAccount.username,
          displayName: appState.advisorAccount.fullName,
        });
        onClose();
      } else {
        setError('Tên đăng nhập hoặc mã đăng nhập Cố vấn học tập không chính xác!');
      }
    } else {
      // Check class officer credentials
      const student = appState.students.find(
        (s) =>
          s.studentCode.toUpperCase() === cleanUsername.toUpperCase() &&
          s.isClassOfficer === true
      );

      if (!student) {
        setError(
          'Không tìm thấy tài khoản Cán bộ lớp tương ứng với Mã SV này, hoặc sinh viên này chưa được cấp quyền Cán bộ lớp!'
        );
        return;
      }

      const expectedPassword = student.officerPassword || student.studentCode;
      if (cleanPassword === expectedPassword || cleanPassword === student.studentCode) {
        const studentClass = appState.classes.find((c) => c.id === student.classId);
        onLoginSuccess({
          role: 'class_officer',
          username: student.studentCode,
          displayName: `${student.fullName} (${student.officerPosition || 'Cán bộ lớp'})`,
          classId: student.classId,
          studentId: student.id,
          position: student.officerPosition,
        });
        onClose();
      } else {
        setError('Mã đăng nhập của Cán bộ lớp không chính xác!');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-orange-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-blue-700 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Đăng nhập Hệ thống</h3>
              <p className="text-xs text-orange-100">Cố vấn học tập - Ngọc Lê</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => handleRoleChange('advisor')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition ${
                role === 'advisor'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Cố vấn học tập</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('class_officer')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition ${
                role === 'class_officer'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Cán bộ lớp</span>
            </button>
          </div>

          {/* Role Description */}
          <div
            className={`p-3 rounded-xl mb-4 text-xs ${
              role === 'advisor'
                ? 'bg-orange-50 border border-orange-200 text-orange-950'
                : 'bg-blue-50 border border-blue-200 text-blue-950'
            }`}
          >
            {role === 'advisor' ? (
              <div>
                <b>Quyền Cố vấn học tập:</b> Toàn quyền quản lý danh sách lớp, thông tin sinh viên, bảng điểm, nợ môn, điểm danh và nhật ký trò chuyện.
              </div>
            ) : (
              <div>
                <b>Quyền Cán bộ lớp:</b> Chỉ được cấp quyền truy cập để <b>Điểm danh sinh viên vắng học</b> theo từng môn. Các chức năng khác bị khóa.
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {role === 'advisor' ? 'Tên đăng nhập (Số điện thoại):' : 'Tên đăng nhập (Mã Sinh viên):'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === 'advisor' ? '0948090287' : 'Ví dụ: SV220101'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                {role === 'advisor'
                  ? 'Mặc định: 0948090287'
                  : 'Sử dụng Mã SV của Cán bộ lớp (ví dụ: SV220101)'}
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  {role === 'advisor' ? 'Mã đăng nhập (Mật khẩu):' : 'Mã đăng nhập:'}
                </label>
                {role === 'advisor' && (
                  <button
                    type="button"
                    onClick={onOpenForgotPassword}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={role === 'advisor' ? 'sekoyeuanh' : 'Mã đăng nhập'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                {role === 'advisor'
                  ? 'Mặc định: sekoyeuanh'
                  : 'Mặc định trùng với Mã SV (ví dụ: SV220101)'}
              </span>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                role === 'advisor'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-orange-500/20'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/20'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập với quyền {role === 'advisor' ? 'Cố vấn' : 'Cán bộ lớp'}</span>
            </button>
          </form>

          {/* Quick autofill helpers for testing */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <div className="text-[11px] text-slate-500 mb-2 flex items-center justify-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Thử nhanh tài khoản:
            </div>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('advisor');
                  setUsername('0948090287');
                  setPassword('sekoyeuanh');
                }}
                className="px-2.5 py-1 text-[11px] font-semibold bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition"
              >
                Cố vấn: 0948090287
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('class_officer');
                  setUsername('SV220101');
                  setPassword('SV220101');
                }}
                className="px-2.5 py-1 text-[11px] font-semibold bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
              >
                Cán bộ lớp: SV220101
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
