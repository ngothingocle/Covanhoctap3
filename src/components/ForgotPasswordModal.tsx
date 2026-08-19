import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { AppState } from '../types';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onFillCredentials?: (username: string, pass: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  appState,
  onFillCredentials,
}) => {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const advisor = appState.advisorAccount;

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-orange-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Khôi phục Tài khoản Cố vấn</h3>
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

        {/* Content */}
        <div className="p-6">
          {!isSent ? (
            <form onSubmit={handleSendRecovery} className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 text-xs text-orange-950 leading-relaxed">
                Hệ thống sẽ gửi lại chính xác <b>Tên đăng nhập</b> và <b>Mã đăng nhập</b> của Cố vấn học tập về số điện thoại hoặc email chính chủ đã đăng ký.
              </div>

              {/* Method Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('phone')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-xs font-bold ${
                    method === 'phone'
                      ? 'border-orange-500 bg-orange-50 text-orange-800 ring-2 ring-orange-400'
                      : 'border-slate-200 hover:border-orange-300 text-slate-600'
                  }`}
                >
                  <Phone className="w-5 h-5 text-orange-600" />
                  <span>Qua SĐT (SMS)</span>
                  <span className="text-[11px] font-normal text-slate-500">{advisor.phone}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-xs font-bold ${
                    method === 'email'
                      ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-400'
                      : 'border-slate-200 hover:border-blue-300 text-slate-600'
                  }`}
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>Qua Gmail</span>
                  <span className="text-[11px] font-normal text-slate-500 truncate max-w-full">
                    {advisor.email}
                  </span>
                </button>
              </div>

              {/* Destination preview */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="text-xs text-slate-500 block mb-1">
                  Đích nhận thông tin khôi phục:
                </span>
                <div className="font-mono font-bold text-slate-800 text-sm flex items-center gap-2">
                  {method === 'phone' ? (
                    <>
                      <Phone className="w-4 h-4 text-orange-600" />
                      <span>{advisor.phone}</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>{advisor.email}</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 transition cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gửi lại thông tin tài khoản ngay</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Thông tin đã được xác nhận!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Hệ thống đã chuẩn bị thông tin đăng nhập dành cho Cố vấn học tập:
                </p>
              </div>

              {/* Information display */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Tên đăng nhập (SĐT):</span>
                  <span className="font-mono font-bold text-orange-700 bg-orange-100/60 px-2 py-0.5 rounded">
                    {advisor.username}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Mã đăng nhập (Mật khẩu):</span>
                  <span className="font-mono font-bold text-red-700 bg-red-100/60 px-2 py-0.5 rounded">
                    {advisor.password}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2">
                  <span className="text-slate-500">Gmail liên kết:</span>
                  <span className="text-slate-700 font-medium">{advisor.email}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onFillCredentials) {
                      onFillCredentials(advisor.username, advisor.password);
                    }
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Tự động điền & Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
