import React from 'react';
import { NavigationPage } from '../../types';
import {
  Home,
  Tv,
  BookOpen,
  FolderKanban,
  Bot,
  Camera,
  FileQuestion,
  TrendingUp,
  Award,
  Settings,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  isTeacherMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isTeacherMode,
}) => {
  const mainNavItems: { id: NavigationPage; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'classroom', label: 'Live Class', icon: Tv },
    { id: 'lessons', label: 'My Lessons', icon: BookOpen },
    { id: 'subjects', label: 'Subjects', icon: FolderKanban },
    { id: 'tutor', label: 'AI Tutor', icon: Bot },
    { id: 'arlab', label: 'AR Lab', icon: Camera },
    { id: 'quizzes', label: 'Quizzes', icon: FileQuestion },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'certificates', label: 'Certificates', icon: Award },
  ];

  if (isTeacherMode) {
    mainNavItems.splice(1, 0, {
      id: 'teacher',
      label: 'Teacher Portal',
      icon: GraduationCap,
    });
  }

  return (
    <aside className="w-48 bg-[#101935] flex flex-col shrink-0 h-screen select-none hidden md:flex z-30">
      {/* Top spacer or brand extension if needed */}
      <div className="pt-5 px-3">
        {/* Navigation Items List */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            // Home and classroom can both be active or mapped appropriately
            const isActive =
              currentPage === item.id ||
              (item.id === 'home' && currentPage === 'home') ||
              (item.id === 'classroom' && currentPage === 'classroom');

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors text-left ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Spacer to push Settings to bottom */}
      <div className="flex-1" />

      {/* Settings at the bottom */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => onNavigate('settings')}
          className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors text-left ${
            currentPage === 'settings'
              ? 'bg-[#2563eb] text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
