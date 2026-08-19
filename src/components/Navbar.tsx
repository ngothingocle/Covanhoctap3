import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpenCheck,
  CalendarCheck2,
  MessageSquareQuote,
  Lock,
} from 'lucide-react';
import { UserRole } from '../types';

export type TabType = 'dashboard' | 'students' | 'grades' | 'attendance' | 'counseling';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  userRole: UserRole;
  studentCount?: number;
  courseCount?: number;
  counselingCount?: number;
  owedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  userRole,
  studentCount = 0,
  courseCount = 0,
  counselingCount = 0,
  owedCount = 0,
}) => {
  const isAdvisor = userRole === 'advisor';

  const advisorNavItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Tổng quan Lớp học',
      icon: LayoutDashboard,
    },
    {
      id: 'students',
      label: 'Thông tin Sinh viên',
      icon: Users,
      badge: studentCount,
      badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'grades',
      label: 'Môn học & Bảng điểm',
      icon: BookOpenCheck,
      badge: owedCount > 0 ? `${owedCount} nợ môn` : courseCount ? `${courseCount} môn` : undefined,
      badgeColor: owedCount > 0 ? 'bg-red-100 text-red-700 font-bold animate-pulse' : 'bg-blue-100 text-blue-800',
    },
    {
      id: 'attendance',
      label: 'Điểm danh SV vắng',
      icon: CalendarCheck2,
    },
    {
      id: 'counseling',
      label: 'Nhật ký trò chuyện',
      icon: MessageSquareQuote,
      badge: counselingCount > 0 ? counselingCount : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200/80 sticky top-18 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isAdvisor ? (
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
            {advisorNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md shadow-orange-500/25 scale-[1.02]'
                      : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        ) : (
          /* Cán bộ lớp view: Only Attendance */
          <div className="py-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-blue-900 font-bold text-sm">
              <CalendarCheck2 className="w-5 h-5 text-blue-600" />
              <span>Chức năng: Điểm danh Sinh viên vắng học theo môn</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Phân quyền Cán bộ lớp: Chỉ có quyền truy cập Điểm danh vắng học.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
