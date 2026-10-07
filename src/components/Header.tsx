import React, { useState, useRef, useEffect } from 'react';
import { useLearning } from '../context/LearningContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Compass,
  Plus,
  Flame,
  Clock,
  Search,
  WifiOff,
  ChevronDown,
  User,
  LogOut,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  onOpenCreatePath: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreatePath, onOpenSearch }) => {
  const {
    user,
    userProfile,
    learningPaths,
    activePath,
    setActivePathId,
    stats,
    loginWithGoogle,
    logout,
  } = useLearning();

  const isOnline = useOnlineStatus();
  const [isPathDropdownOpen, setIsPathDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const pathRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pathRef.current && !pathRef.current.contains(e.target as Node)) {
        setIsPathDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Brand & Path Switcher */}
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              NEXUS<span className="text-indigo-400 font-extrabold ml-1">LEARN</span>
            </span>
          </div>
        </div>

        {/* Learning Path Selector */}
        <div className="relative" ref={pathRef}>
          <button
            onClick={() => setIsPathDropdownOpen(!isPathDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-all max-w-[200px] sm:max-w-[280px] cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="truncate">{activePath?.title || 'Select Learning Path'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-auto" />
          </button>

          {isPathDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Your Learning Ecosystems
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {learningPaths.map((path) => (
                  <button
                    key={path.id}
                    onClick={() => {
                      setActivePathId(path.id);
                      setIsPathDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition ${
                      path.id === activePath?.id
                        ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-200 font-medium'
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-medium">{path.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="capitalize">{path.domain}</span>
                        <span>•</span>
                        <span>{path.totalHoursEstimate}h est.</span>
                      </div>
                    </div>
                    {path.id === activePath?.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-800 mt-2 pt-2">
                <button
                  onClick={() => {
                    setIsPathDropdownOpen(false);
                    onOpenCreatePath();
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Learning Path</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Search, Stats, PWA Install, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline indicator */}
        {!isOnline && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Offline</span>
          </div>
        )}

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
          title="Search anything (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Streak */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-slate-200">{stats.streakDays}</span>
          <span className="text-slate-400 text-[11px]">days</span>
        </div>

        {/* Study Time */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">{Math.round(stats.totalStudyMinutes / 60)}h</span>
          <span className="text-slate-400 text-[11px]">learned</span>
        </div>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* User Account / Google Login */}
        <div className="relative" ref={userRef}>
          {user ? (
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 p-1 sm:px-2 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition cursor-pointer"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-indigo-500/40 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <span className="hidden sm:inline text-xs font-medium text-slate-200 max-w-[90px] truncate">
                {user.displayName?.split(' ')[0] || 'Learner'}
              </span>
            </button>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sign In</span>
            </button>
          )}

          {isUserDropdownOpen && user && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="w-10 h-10 rounded-full border border-indigo-500/40 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-sm font-bold text-indigo-300">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {user.displayName || 'Learner'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                </div>
              </div>

              <div className="py-2 text-[11px] text-slate-300 space-y-1">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Level:</span>
                  <span className="font-medium capitalize text-indigo-300">{userProfile?.level || 'Intermediate'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Mastered Topics:</span>
                  <span className="font-medium text-emerald-400">{stats.masteredTopicsCount}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
