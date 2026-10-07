import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  Target,
  FileQuestion,
  BookMarked,
  FolderKanban,
  Network,
  Library,
  Terminal,
  ShieldAlert,
  Cpu,
  ChevronRight,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'curriculum'
  | 'tutor'
  | 'practice'
  | 'exams'
  | 'notebook'
  | 'projects'
  | 'graph'
  | 'library'
  | 'developer'
  | 'cybersecurity'
  | 'robotics';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const mainNavItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'curriculum' as NavTab, label: 'My Learning Tree', icon: GraduationCap },
    { id: 'tutor' as NavTab, label: 'AI Tutor', icon: Sparkles, badge: 'Active' },
    { id: 'practice' as NavTab, label: 'Practice Lab', icon: Target },
    { id: 'exams' as NavTab, label: 'Tests & Exams', icon: FileQuestion },
    { id: 'notebook' as NavTab, label: 'AI Notebook', icon: BookMarked },
    { id: 'projects' as NavTab, label: 'Projects', icon: FolderKanban },
    { id: 'graph' as NavTab, label: 'Knowledge Graph', icon: Network },
    { id: 'library' as NavTab, label: 'Personal Library', icon: Library },
  ];

  const specializedModes = [
    { id: 'developer' as NavTab, label: 'Developer Hub', icon: Terminal, color: 'text-emerald-400' },
    { id: 'cybersecurity' as NavTab, label: 'Cybersecurity Lab', icon: ShieldAlert, color: 'text-amber-400' },
    { id: 'robotics' as NavTab, label: 'Robotics / NEXORA', icon: Cpu, color: 'text-cyan-400' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/60 p-3 flex-shrink-0">
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {/* Core Navigation */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform Engine
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/15 border border-indigo-500/30 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Specialized Domain Modes */}
        <div className="space-y-1 pt-2 border-t border-slate-900">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Domain Environments
          </div>
          {specializedModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentTab === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectTab(mode.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 border border-slate-700/80 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${mode.color}`} />
                  <span>{mode.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-900/80 px-2 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>Learner-Centric Hub</span>
          <span className="text-[10px] text-indigo-400 font-mono">v2.4 PWA</span>
        </div>
      </div>
    </aside>
  );
};
