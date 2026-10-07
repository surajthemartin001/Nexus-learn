import React, { useState, useEffect } from 'react';
import { LearningProvider, useLearning } from './context/LearningContext';
import { Header } from './components/Header';
import { Sidebar, type NavTab } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './views/DashboardView';
import { CurriculumView } from './views/CurriculumView';
import { AITutorView } from './views/AITutorView';
import { PracticeLabView } from './views/PracticeLabView';
import { ExamPrepView } from './views/ExamPrepView';
import { NotebookView } from './views/NotebookView';
import { ProjectsView } from './views/ProjectsView';
import { KnowledgeGraphView } from './views/KnowledgeGraphView';
import { LibraryView } from './views/LibraryView';
import { SpecializedModeView } from './views/SpecializedModeView';
import { CreatePathModal } from './components/CreatePathModal';
import { OnboardingModal } from './components/OnboardingModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { WifiOff, Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isCreatePathOpen, setIsCreatePathOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const isOnline = useOnlineStatus();

  // First time check for onboarding
  useEffect(() => {
    const hasCompleted = localStorage.getItem('nexus_onboarding_completed');
    if (!hasCompleted) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Global Keyboard shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <Header
        onOpenCreatePath={() => setIsCreatePathOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 font-bold px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active — Local storage and cached syllabus data available.</span>
        </div>
      )}

      {/* Middle Workspace: Sidebar + Dynamic Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Mobile Full Drawer */}
        {isMobileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            <div className="relative w-72 bg-slate-950 border-r border-slate-800 p-4 flex flex-col h-full z-10">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-bold text-white text-sm">All Environments</span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="text-slate-400 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-3 space-y-1">
                {(
                  [
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'curriculum', label: 'My Learning Tree' },
                    { id: 'tutor', label: 'AI Tutor' },
                    { id: 'practice', label: 'Practice Lab' },
                    { id: 'exams', label: 'Tests & Exams' },
                    { id: 'notebook', label: 'AI Notebook' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'graph', label: 'Knowledge Graph' },
                    { id: 'library', label: 'Personal Library' },
                    { id: 'developer', label: 'Developer Hub' },
                    { id: 'cybersecurity', label: 'Cybersecurity Lab' },
                    { id: 'robotics', label: 'Robotics / NEXORA' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id as NavTab);
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      currentTab === item.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/40">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentTab}
              onOpenCreatePath={() => setIsCreatePathOpen(true)}
            />
          )}

          {currentTab === 'curriculum' && (
            <CurriculumView
              onNavigate={setCurrentTab}
              onOpenCreatePath={() => setIsCreatePathOpen(true)}
            />
          )}

          {currentTab === 'tutor' && <AITutorView />}

          {currentTab === 'practice' && <PracticeLabView />}

          {currentTab === 'exams' && <ExamPrepView />}

          {currentTab === 'notebook' && <NotebookView />}

          {currentTab === 'projects' && <ProjectsView onNavigate={setCurrentTab} />}

          {currentTab === 'graph' && <KnowledgeGraphView onNavigate={setCurrentTab} />}

          {currentTab === 'library' && <LibraryView onNavigate={setCurrentTab} />}

          {currentTab === 'developer' && <SpecializedModeView mode="developer" />}

          {currentTab === 'cybersecurity' && <SpecializedModeView mode="cybersecurity" />}

          {currentTab === 'robotics' && <SpecializedModeView mode="robotics" />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenMenu={() => setIsMobileDrawerOpen(true)}
      />

      {/* Modals */}
      <CreatePathModal
        isOpen={isCreatePathOpen}
        onClose={() => setIsCreatePathOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onOpenCreatePath={() => setIsCreatePathOpen(true)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <LearningProvider>
      <MainLayout />
    </LearningProvider>
  );
}
