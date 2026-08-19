import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  LogOut,
  LogIn,
  KeyRound,
  Layers,
  Phone,
  Mail,
  HelpCircle,
  Wifi,
  Menu,
  X,
} from 'lucide-react';
import { ClassGroup, UserSession } from '../types';

interface HeaderProps {
  session: UserSession | null;
  classes: ClassGroup[];
  activeClassId: string;
  onSelectClass: (classId: string) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenClassManager: () => void;
  onOpenAccountManager: () => void;
  onOpenForgotPassword: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  classes,
  activeClassId,
  onSelectClass,
  onOpenLogin,
  onLogout,
  onOpenClassManager,
  onOpenAccountManager,
  onOpenForgotPassword,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0];
  const isAdvisor = session?.role === 'advisor';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-orange-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 p-0.5 shadow-md shadow-orange-500/20 flex items-center justify-center text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 via-orange-600 to-blue-700 bg-clip-text text-transparent">
                  Cố vấn học tập - Ngọc Lê
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                  v2.5
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Hệ thống Quản lý Cố vấn, Sinh viên & Điểm danh Học tập
              </p>
            </div>
          </div>

          {/* Center Class Selector (Advisor only) */}
          {isAdvisor && classes.length > 0 && (
            <div className="hidden md:flex items-center bg-orange-50/80 border border-orange-200 rounded-xl px-3 py-1.5 shadow-inner">
              <span className="text-xs font-semibold text-orange-900 mr-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-orange-600" />
                Lớp quản lý:
              </span>
              <select
                value={activeClassId}
                onChange={(e) => onSelectClass(e.target.value)}
                aria-label="Chọn lớp quản lý"
                className="text-sm font-bold text-slate-800 bg-white border border-orange-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-sm"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.code} - {cls.name}
                  </option>
                ))}
              </select>
              <button
                onClick={onOpenClassManager}
                title="Quản lý & Thêm lớp mới"
                className="ml-2 text-xs font-semibold text-orange-700 hover:text-orange-900 hover:underline px-1.5 py-0.5"
              >
                + Đổi/Thêm
              </button>
            </div>
          )}

          {/* Right Action & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Offline/Online Status Badge */}
            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Sẵn sàng Online & Offline</span>
            </div>

            {session ? (
              <div className="flex items-center gap-2">
                {/* Role Badge */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm ${
                    isAdvisor
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {isAdvisor ? (
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  )}
                  <div className="flex flex-col text-left">
                    <span className="leading-tight">{session.displayName}</span>
                    <span className="text-[10px] font-medium text-slate-500">
                      {isAdvisor ? 'Toàn quyền Quản trị' : `Cán bộ lớp (${session.username})`}
                    </span>
                  </div>
                </div>

                {/* Advisor Account Settings */}
                {isAdvisor && (
                  <button
                    onClick={onOpenAccountManager}
                    title="Quản lý Tài khoản & Phân quyền Cán bộ lớp"
                    className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition border border-slate-200"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                )}

                {/* Logout */}
                <button
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-slate-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Thoát</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl shadow-md shadow-orange-500/20 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown bar for class selector & quick contact */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-orange-100 space-y-3 bg-white">
            {isAdvisor && (
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                <label className="block text-xs font-bold text-orange-900 mb-1">
                  Đang chọn Lớp học:
                </label>
                <select
                  value={activeClassId}
                  onChange={(e) => {
                    onSelectClass(e.target.value);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-sm font-semibold text-slate-800 bg-white border border-orange-300 rounded-lg p-2"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.code} - {cls.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    onOpenClassManager();
                    setMobileMenuOpen(false);
                  }}
                  className="mt-2 text-xs font-bold text-orange-700 underline"
                >
                  + Quản lý danh sách lớp
                </button>
              </div>
            )}

            <div className="flex flex-col gap-1 text-xs text-slate-600 px-1">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Phone className="w-3.5 h-3.5 text-orange-600" />
                <span>Hotline Cố vấn: 0948090287</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Email: ngoclecyt@gmail.com</span>
              </div>
              <button
                onClick={() => {
                  onOpenForgotPassword();
                  setMobileMenuOpen(false);
                }}
                className="text-left text-xs font-semibold text-red-600 hover:underline pt-1 flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Quên mật khẩu Cố vấn?
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
