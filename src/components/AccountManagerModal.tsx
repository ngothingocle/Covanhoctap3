import React, { useState } from 'react';
import {
  X,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Edit2,
  Save,
  RotateCcw,
  Download,
  Upload,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { AppState, Student } from '../types';

interface AccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onUpdateAdvisorAccount: (accountData: AppState['advisorAccount']) => void;
  onUpdateOfficerPassword: (studentId: string, newPassword: string) => void;
  onRestoreBackup: (state: AppState) => void;
}

export const AccountManagerModal: React.FC<AccountManagerModalProps> = ({
  isOpen,
  onClose,
  appState,
  onUpdateAdvisorAccount,
  onUpdateOfficerPassword,
  onRestoreBackup,
}) => {
  const [activeTab, setActiveTab] = useState<'advisor' | 'officers' | 'backup'>('advisor');

  // Advisor form state
  const [username, setUsername] = useState(appState.advisorAccount.username);
  const [password, setPassword] = useState(appState.advisorAccount.password);
  const [phone, setPhone] = useState(appState.advisorAccount.phone);
  const [email, setEmail] = useState(appState.advisorAccount.email);
  const [fullName, setFullName] = useState(appState.advisorAccount.fullName);

  // Officer editing state
  const [editingOfficerId, setEditingOfficerId] = useState<string | null>(null);
  const [officerNewPassword, setOfficerNewPassword] = useState('');

  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const officers = appState.students.filter((s) => s.isClassOfficer);

  const handleSaveAdvisor = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdvisorAccount({
      username: username.trim(),
      password: password.trim(),
      phone: phone.trim(),
      email: email.trim(),
      fullName: fullName.trim(),
    });
    setMessage('Đã cập nhật thông tin tài khoản Cố vấn học tập thành công!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveOfficerPassword = (studentId: string) => {
    if (!officerNewPassword.trim()) return;
    onUpdateOfficerPassword(studentId, officerNewPassword.trim());
    setEditingOfficerId(null);
    setOfficerNewPassword('');
    setMessage('Đã cập nhật mật khẩu cho Cán bộ lớp thành công!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Sao_Luu_Co_Van_Hoc_Tap_Ngoc_Le_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.students && parsed.classes) {
            onRestoreBackup(parsed);
            setMessage('Đã phục hồi dữ liệu từ bản sao lưu thành công!');
            setTimeout(() => setMessage(null), 3000);
          } else {
            alert('File sao lưu không đúng định dạng!');
          }
        } catch (err) {
          alert('Lỗi khi đọc file sao lưu JSON!');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-orange-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-blue-700 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Quản lý Tài khoản & Phân quyền</h3>
              <p className="text-xs text-orange-100">Cố vấn học tập - Ngọc Lê</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'advisor'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Tài khoản Cố vấn</span>
          </button>

          <button
            onClick={() => setActiveTab('officers')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'officers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Tài khoản Cán bộ lớp ({officers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Sao lưu & Khôi phục</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Tab 1: Advisor Account Form */}
          {activeTab === 'advisor' && (
            <form onSubmit={handleSaveAdvisor} className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-orange-50/80 border border-orange-200 rounded-xl text-orange-950">
                Tài khoản Cố vấn học tập có toàn quyền quản trị và chỉnh sửa mọi thông tin trong hệ thống.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên hiển thị Cố vấn:
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên đăng nhập (SĐT):
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã đăng nhập (Mật khẩu):
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số điện thoại nhận khôi phục:
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Gmail nhận lại thông tin tài khoản:
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thông tin Cố vấn</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Class Officers Accounts */}
          {activeTab === 'officers' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed">
                Tài khoản Cán bộ lớp có tên đăng nhập và mật khẩu mặc định là <b>Mã Sinh viên</b>. Bạn có thể đổi mật khẩu riêng cho từng cán bộ tại đây.
              </div>

              {officers.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  Chưa có sinh viên nào được đánh dấu là Cán bộ lớp. Hãy vào mục <b>"Thông tin Sinh viên"</b> và bật tùy chọn <b>"Cán bộ lớp"</b>.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {officers.map((st) => (
                    <div
                      key={st.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{st.fullName}</span>
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                            {st.officerPosition || 'Cán bộ lớp'}
                          </span>
                        </div>
                        <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                          Tên đăng nhập: <b>{st.studentCode}</b> | Mật khẩu hiện tại:{' '}
                          <b className="text-red-700">{st.officerPassword || st.studentCode}</b>
                        </div>
                      </div>

                      {editingOfficerId === st.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Mật khẩu mới"
                            value={officerNewPassword}
                            onChange={(e) => setOfficerNewPassword(e.target.value)}
                            className="w-28 px-2 py-1 bg-white border border-blue-400 rounded-lg text-xs font-mono"
                          />
                          <button
                            onClick={() => handleSaveOfficerPassword(st.id)}
                            className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => setEditingOfficerId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingOfficerId(st.id);
                              setOfficerNewPassword(st.officerPassword || st.studentCode);
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition"
                            title="Đổi mật khẩu"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              onUpdateOfficerPassword(st.id, st.studentCode);
                              setMessage(`Đã đặt lại mật khẩu của ${st.fullName} về mặc định (${st.studentCode})!`);
                              setTimeout(() => setMessage(null), 3000);
                            }}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-white rounded-lg transition"
                            title="Đặt lại về mật khẩu mặc định (Mã SV)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Backup & Restore */}
          {activeTab === 'backup' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  Sao lưu toàn bộ dữ liệu ứng dụng
                </h4>
                <p className="text-slate-600">
                  Tải xuống toàn bộ danh sách lớp, thông tin sinh viên, bảng điểm, số tiết vắng và nhật ký trò chuyện thành file dự phòng <code>.json</code> an toàn trên máy tính của bạn.
                </p>
                <button
                  onClick={handleExportBackup}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải file sao lưu (.JSON)</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Phục hồi dữ liệu từ bản sao lưu
                </h4>
                <p className="text-slate-600">
                  Chọn file <code>.json</code> đã sao lưu trước đó để phục hồi lại nguyên trạng ứng dụng.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
