import React, { useState } from 'react';
import { StudentProfile } from '../../types';
import {
  Search,
  Bell,
  Globe,
  ChevronDown,
  GraduationCap,
  ShieldCheck,
  Menu,
  X,
  Volume2,
} from 'lucide-react';
import { avatarAudioEngine } from '../../services/avatarAudioEngine';

interface TopNavBarProps {
  profile: StudentProfile;
  onChangeGrade: (grade: number) => void;
  onToggleRole: () => void;
  onChangeLanguage: (lang: 'en' | 'ar') => void;
  onSearchSubmit: (query: string) => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  profile,
  onChangeGrade,
  onToggleRole,
  onChangeLanguage,
  onSearchSubmit,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState<boolean>(false);
  const [showGradeMenu, setShowGradeMenu] = useState<boolean>(false);

  const mockNotifications = [
    { id: '1', title: 'New Adaptive Challenge', desc: 'Solar System planetary dynamics unlocked.', time: '10m ago' },
    { id: '2', title: 'Teacher Assignment', desc: 'Dr. Sarah assigned The Water Cycle assessment.', time: '1h ago' },
    { id: '3', title: 'Streak Milestone', desc: 'You maintained an 8-day science streak!', time: '1d ago' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onSearchSubmit(searchQuery.trim());
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-40 select-none shadow-xs">
      {/* Left: Brand / Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-[#2563eb] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1 leading-tight">
              <span className="font-bold text-[15px] sm:text-base text-slate-900 tracking-tight">SmartClass</span>
              <span className="font-bold text-[15px] sm:text-base text-[#2563eb]">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Learn • Explore • Create</p>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons, topics, or ask your AI tutor..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f1f5f9] border border-transparent text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
          />
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Voice Sound Test */}
        <button
          onClick={() => {
            avatarAudioEngine.testSound();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
          title="Test Teacher Audio & Speech Output"
        >
          <Volume2 className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span className="hidden sm:inline">Voice Audio</span>
          <span className="sm:hidden">Voice</span>
        </button>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{profile.language === 'en' ? 'English' : 'العربية'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLanguageMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in duration-100">
              <button
                onClick={() => {
                  onChangeLanguage('en');
                  setShowLanguageMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 ${
                  profile.language === 'en' ? 'text-blue-600 font-bold' : 'text-slate-700'
                }`}
              >
                <span>English</span>
                {profile.language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>
              <button
                onClick={() => {
                  onChangeLanguage('ar');
                  setShowLanguageMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 ${
                  profile.language === 'ar' ? 'text-blue-600 font-bold' : 'text-slate-700'
                }`}
              >
                <span>العربية</span>
                {profile.language === 'ar' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Mark all as read</span>
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2 rounded-xl hover:bg-slate-50 text-xs transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-slate-900">{n.title}</h5>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Student Profile with Grade Selection */}
        <div className="relative flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
            <img
              src="./assets/prototype/student-avatar.png"
              alt={profile.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to high quality student avatar
                (e.target as HTMLImageElement).src = profile.avatar;
              }}
            />
          </div>

          <div
            onClick={() => setShowGradeMenu(!showGradeMenu)}
            className="flex flex-col cursor-pointer text-left leading-tight"
          >
            <span className="text-xs font-semibold text-slate-700">Student</span>
            <div className="flex items-center gap-0.5 text-[11px] font-medium text-slate-400 hover:text-slate-600">
              <span>Grade {profile.grade}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {showGradeMenu && (
            <div className="absolute right-0 top-11 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Select Grade
              </div>
              {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    onChangeGrade(g);
                    setShowGradeMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-slate-50 ${
                    profile.grade === g ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>Grade {g}</span>
                  {profile.grade === g && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>
              ))}
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  onToggleRole();
                  setShowGradeMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Switch to {profile.role === 'student' ? 'Teacher' : 'Student'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
