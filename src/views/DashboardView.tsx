import React from 'react';
import { useLearning } from '../context/LearningContext';
import type { NavTab } from '../components/Sidebar';
import {
  Compass,
  Sparkles,
  Target,
  BookOpen,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Flame,
  Award,
  Layers,
  CheckCircle2,
  Play,
  FileText,
  Plus,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenCreatePath: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenCreatePath,
}) => {
  const { user, activePath, activeTopic, stats, resources, notes, updateTopicMastery } = useLearning();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const name = user?.displayName ? user.displayName.split(' ')[0] : 'Learner';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Greeting & Fast Action */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/80 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Learner-Centric University</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {getGreeting()}, <span className="text-indigo-400">{name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your active path: <strong className="text-white font-semibold">{activePath?.title || 'Personal Study'}</strong>. Target mastery is progressing with spaced repetition and practical proofs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('practice')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Continue Learning</span>
            </button>
            <button
              onClick={onOpenCreatePath}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>+ Create Path</span>
            </button>
          </div>
        </div>

        {/* 5-Step Daily Session Blueprint */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { step: '1. Learn', desc: 'Theory & Docs', status: 'completed' },
            { step: '2. Practice', desc: 'Adaptive Proofs', status: 'active' },
            { step: '3. Review', desc: 'Spaced Repetition', status: 'pending' },
            { step: '4. Test', desc: 'Timed Verification', status: 'pending' },
            { step: '5. Track', desc: 'Mastery Update', status: 'pending' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-xs transition ${
                item.status === 'completed'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : item.status === 'active'
                  ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-200 font-semibold'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{item.step}</span>
                {item.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Continue Learning + Weak Topics + Daily Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Topic Spotlight */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Topic Card */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Next Scheduled Focus Topic</span>
              </span>
              <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                activeTopic?.status === 'mastered'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {activeTopic?.difficulty} • {activeTopic?.estimatedMinutes}m
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {activeTopic?.title || 'Core Foundations'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {activeTopic?.description}
            </p>

            {/* Prerequisites & Stack tags */}
            {activeTopic?.prerequisites && activeTopic.prerequisites.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Prerequisites:</span>
                {activeTopic.prerequisites.map((p) => (
                  <span
                    key={p}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-950 text-indigo-300 border border-slate-800"
                  >
                    ✓ {p}
                  </span>
                ))}
              </div>
            )}

            {/* Mastery Progress Bar */}
            <div className="space-y-1.5 mb-5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Topic Mastery Index</span>
                <span className="font-bold text-white">{activeTopic?.masteryScore || 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${activeTopic?.masteryScore || 10}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('practice')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Launch Practice Session</span>
              </button>
              <button
                onClick={() => onNavigate('tutor')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ask AI Tutor</span>
              </button>
              <button
                onClick={() => onNavigate('notebook')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Synthesize Notes</span>
              </button>
            </div>
          </div>

          {/* AI Recommended Learning Stack */}
          {activeTopic?.recommendedStack && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Recommended Resource Stack</h3>
                    <p className="text-[11px] text-slate-400">Curated specifically for this topic without noise</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('curriculum')}
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Stack</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">PRIMARY (Authoritative)</span>
                  <div className="text-xs font-medium text-slate-200 mt-1">{activeTopic.recommendedStack.primary}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">PRACTICE (Exercises)</span>
                  <div className="text-xs font-medium text-slate-200 mt-1">{activeTopic.recommendedStack.practice}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">PROJECT (Hands-on)</span>
                  <div className="text-xs font-medium text-slate-200 mt-1">{activeTopic.recommendedStack.project}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-violet-400">ADVANCED (Internals)</span>
                  <div className="text-xs font-medium text-slate-200 mt-1">{activeTopic.recommendedStack.advanced}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Weak Topics, Spaced Repetition & Metrics */}
        <div className="space-y-6">
          {/* Metrics Overview */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
              Mastery Pulse
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[11px] font-semibold">Mastery</span>
                </div>
                <div className="text-2xl font-black text-white">{stats.overallMastery}%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{stats.masteredTopicsCount} Topics Mastered</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 mb-1">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  <span className="text-[11px] font-semibold">Daily Streak</span>
                </div>
                <div className="text-2xl font-black text-white">{stats.streakDays}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Consecutive Days</div>
              </div>
            </div>
          </div>

          {/* Weak Topics Engine */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Targeted Reinforcement
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Auto-detected</span>
            </div>

            {stats.weakTopics.length > 0 ? (
              <div className="space-y-2">
                {stats.weakTopics.slice(0, 3).map((wt) => (
                  <div
                    key={wt.id}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{wt.title}</div>
                      <div className="text-[10px] text-amber-400 mt-0.5">
                        Current Mastery: {wt.masteryScore}%
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('practice')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-semibold transition cursor-pointer flex-shrink-0"
                    >
                      Practice
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
                No weak topics detected. Your baseline mastery is high!
              </div>
            )}
          </div>

          {/* Spaced Repetition Due Queue */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Spaced Repetition Queue
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                Due Today
              </span>
            </div>

            {stats.dueRevisionTopics.length > 0 ? (
              <div className="space-y-2">
                {stats.dueRevisionTopics.slice(0, 2).map((rt) => (
                  <div
                    key={rt.id}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{rt.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Interval: 3 days</div>
                    </div>
                    <button
                      onClick={() => onNavigate('practice')}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold transition cursor-pointer"
                    >
                      Revise
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
                All scheduled topics are currently fresh in memory.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
