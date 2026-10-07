import React from 'react';
import type { NavTab } from './Sidebar';
import {
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  Target,
  BookMarked,
  Menu,
} from 'lucide-react';

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab, onOpenMenu }) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Home', icon: LayoutDashboard },
    { id: 'curriculum' as NavTab, label: 'Roadmap', icon: GraduationCap },
    { id: 'tutor' as NavTab, label: 'Tutor', icon: Sparkles },
    { id: 'practice' as NavTab, label: 'Practice', icon: Target },
    { id: 'notebook' as NavTab, label: 'Notes', icon: BookMarked },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around safe-area-inset-bottom">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-medium transition cursor-pointer ${
              isActive
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
      >
        <Menu className="w-5 h-5 text-slate-400" />
        <span>More</span>
      </button>
    </nav>
  );
};
