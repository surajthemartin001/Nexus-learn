import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import type { Topic, Subject } from '../types';
import type { NavTab } from '../components/Sidebar';
import {
  GraduationCap,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  FileText,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Plus,
  GitBranch,
} from 'lucide-react';

interface CurriculumViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenCreatePath: () => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  onNavigate,
  onOpenCreatePath,
}) => {
  const { activePath, activeTopic, setActiveTopicId, updateTopicMastery } = useLearning();

  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    activePath?.subjects?.forEach((s) => {
      map[s.id] = true;
    });
    return map;
  });

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(activeTopic);

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getMasteryColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (score >= 40) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    if (score >= 20) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-slate-400 bg-slate-800/40 border-slate-700/50';
  };

  const getMasteryLabel = (score: number) => {
    if (score >= 90) return 'Mastered';
    if (score >= 75) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Developing';
    if (score >= 20) return 'Beginner';
    return 'Not Learned';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <GraduationCap className="w-4 h-4" />
            <span>Structured Learning Roadmap</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {activePath?.title || 'Learning Curriculum'}
          </h1>
          <p className="text-xs text-slate-400">
            {activePath?.domain} • {activePath?.totalHoursEstimate} Estimated Hours • Reordered by Dependency Invariants
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('graph')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>Knowledge Graph</span>
          </button>
          <button
            onClick={onOpenCreatePath}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add / Replace Syllabus</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Learning Tree (Left) & Topic Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Tree */}
        <div className="lg:col-span-7 space-y-4">
          {activePath?.subjects?.map((sub, sIdx) => {
            const isExpanded = expandedSubjects[sub.id] ?? true;
            return (
              <div
                key={sub.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg transition"
              >
                {/* Subject Header */}
                <button
                  onClick={() => toggleSubject(sub.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-950/60 hover:bg-slate-800/40 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-8 rounded-full"
                      style={{ backgroundColor: sub.color || '#3b82f6' }}
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Subject {sIdx + 1}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {sub.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      {sub.topics?.length || 0} topics
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Topics in Subject */}
                {isExpanded && (
                  <div className="p-3 sm:p-4 space-y-2 border-t border-slate-800/60 bg-slate-900/40">
                    {sub.topics?.map((topic, tIdx) => {
                      const isSelected = selectedTopic?.id === topic.id;
                      return (
                        <div
                          key={topic.id}
                          onClick={() => {
                            setSelectedTopic(topic);
                            setActiveTopicId(topic.id);
                          }}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md'
                              : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-400 mt-0.5 flex-shrink-0">
                              {tIdx + 1}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                                {topic.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {topic.description}
                              </p>
                              {topic.prerequisites.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 truncate">
                                  <span className="text-indigo-400">Needs:</span>
                                  <span>{topic.prerequisites.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold ${getMasteryColor(
                                topic.masteryScore
                              )}`}
                            >
                              {topic.masteryScore}% {getMasteryLabel(topic.masteryScore)}
                            </span>
                            <ArrowRight
                              className={`w-3.5 h-3.5 transition ${
                                isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Selected Topic Deep Inspection Panel */}
        <div className="lg:col-span-5">
          {selectedTopic ? (
            <div className="sticky top-20 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Topic Architectural Blueprint
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${getMasteryColor(
                      selectedTopic.masteryScore
                    )}`}
                  >
                    {selectedTopic.masteryScore}% • {getMasteryLabel(selectedTopic.masteryScore)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {selectedTopic.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedTopic.description}
                </p>
              </div>

              {/* Relevance Badges */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Practical Engineering</span>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {selectedTopic.practicalRelevance || 'Core production architectural invariant'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Exam Relevance</span>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {selectedTopic.examRelevance || 'Tested in theoretical certification benchmarks'}
                  </div>
                </div>
              </div>

              {/* Recommended Learning Stack */}
              {selectedTopic.recommendedStack && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Structured Learning Stack</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[9px] font-bold text-cyan-400 uppercase">1. Authoritative Docs</div>
                      <div className="text-slate-200 mt-0.5">{selectedTopic.recommendedStack.primary}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[9px] font-bold text-emerald-400 uppercase">2. Practice Lab</div>
                      <div className="text-slate-200 mt-0.5">{selectedTopic.recommendedStack.practice}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[9px] font-bold text-amber-400 uppercase">3. Capstone Project</div>
                      <div className="text-slate-200 mt-0.5">{selectedTopic.recommendedStack.project}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Topic Action CTAs */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => onNavigate('practice')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition cursor-pointer"
                >
                  <Target className="w-4 h-4" />
                  <span>Start Adaptive Practice Session</span>
                </button>
                <button
                  onClick={() => onNavigate('tutor')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Ask AI Tutor to Explain Invariants</span>
                </button>
                <button
                  onClick={() => onNavigate('notebook')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Generate Study Notes & Flashcards</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              Select any topic from the curriculum tree to inspect its prerequisites, learning stack, and practice set.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
