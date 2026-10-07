import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import type { NavTab } from '../components/Sidebar';
import {
  Library,
  BookOpen,
  FileText,
  Target,
  FolderKanban,
  AlertTriangle,
  Calendar,
  Bookmark,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';

interface LibraryViewProps {
  onNavigate: (tab: NavTab, itemId?: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onNavigate }) => {
  const { resources, notes, questions, attempts, projects } = useLearning();

  const [activeTab, setActiveTab] = useState<'resources' | 'notes' | 'mistakes' | 'projects'>('resources');
  const [searchFilter, setSearchFilter] = useState('');

  // Mistakes are attempts where isCorrect === false
  const mistakeAttempts = attempts.filter((a) => !a.isCorrect);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Library className="w-4 h-4" />
            <span>Personal Knowledge Vault</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">My Academic Library</h1>
          <p className="text-xs text-slate-400">
            All your curated resources, generated notes, error logs, and project blueprints in one place.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
          {[
            { id: 'resources', label: `Resources (${resources.length})`, icon: BookOpen },
            { id: 'notes', label: `Notes (${notes.length})`, icon: FileText },
            { id: 'mistakes', label: `Mistakes (${mistakeAttempts.length})`, icon: AlertTriangle },
            { id: 'projects', label: `Projects (${projects.length})`, icon: FolderKanban },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Section */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        {activeTab === 'resources' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Saved Curriculum Resources
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {res.type}
                    </span>
                    {res.tier && (
                      <span className="text-[10px] font-semibold text-cyan-400 uppercase">
                        {res.tier}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">{res.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {res.contentSnippet || 'Reference link'}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                    <div className="flex gap-1">
                      {res.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                    {res.sourceUrl && (
                      <a
                        href={res.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Open Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Digital Notes & Study Guides
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onNavigate('notebook')}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 hover:border-slate-700 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {note.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {note.isGrounded ? 'Source Grounded' : 'AI Inferred'}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">{note.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-3">
                    {note.content.replace(/[#*`_]/g, '')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mistakes' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Mistake Error Bank & Spaced Recall
            </span>
            {mistakeAttempts.length > 0 ? (
              <div className="space-y-2.5">
                {mistakeAttempts.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-rose-500/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-rose-400 uppercase">Incorrect Attempt</span>
                      <span className="text-[10px] text-slate-400">{m.timeSpentSec}s response time</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      <strong>Your Answer: </strong> {m.userAnswer}
                    </div>
                    <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800">
                      {m.feedback}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No recorded mistakes. Your conceptual accuracy is high!
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Capstone Implementations
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onNavigate('projects')}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 hover:border-slate-700 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {proj.domain}
                    </span>
                    <span className="text-xs font-bold text-white">{proj.progress}%</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">{proj.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
