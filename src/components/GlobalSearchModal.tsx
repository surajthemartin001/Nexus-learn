import React, { useState, useEffect } from 'react';
import { useLearning } from '../context/LearningContext';
import {
  Search,
  X,
  GraduationCap,
  BookOpen,
  FileText,
  Target,
  FolderKanban,
  ArrowRight,
} from 'lucide-react';
import type { NavTab } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { activePath, resources, notes, questions, projects, setActiveTopicId } = useLearning();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Search in Topics
  const allTopics: Array<{ id: string; title: string; desc: string; domain: string }> = [];
  if (activePath?.subjects) {
    for (const sub of activePath.subjects) {
      if (sub.topics) {
        for (const top of sub.topics) {
          allTopics.push({
            id: top.id,
            title: top.title,
            desc: top.description,
            domain: activePath.domain,
          });
        }
      }
    }
  }

  const matchingTopics = normalizedQuery
    ? allTopics.filter(
        (t) => t.title.toLowerCase().includes(normalizedQuery) || t.desc.toLowerCase().includes(normalizedQuery)
      )
    : allTopics.slice(0, 3);

  const matchingResources = normalizedQuery
    ? resources.filter(
        (r) =>
          r.title.toLowerCase().includes(normalizedQuery) ||
          r.tags.some((t) => t.toLowerCase().includes(normalizedQuery))
      )
    : resources.slice(0, 2);

  const matchingNotes = normalizedQuery
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(normalizedQuery) ||
          n.content.toLowerCase().includes(normalizedQuery)
      )
    : notes.slice(0, 2);

  const matchingQuestions = normalizedQuery
    ? questions.filter((q) => q.prompt.toLowerCase().includes(normalizedQuery))
    : questions.slice(0, 2);

  const matchingProjects = normalizedQuery
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(normalizedQuery) ||
          p.description.toLowerCase().includes(normalizedQuery)
      )
    : projects.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 pt-16 sm:pt-24">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, resources, notes, questions, projects..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Topics */}
          {matchingTopics.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Roadmap Topics</span>
              </div>
              <div className="space-y-1">
                {matchingTopics.map((top) => (
                  <button
                    key={top.id}
                    onClick={() => {
                      setActiveTopicId(top.id);
                      onNavigate('curriculum', top.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-left transition group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                        {top.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {top.desc}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {matchingResources.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Learning Resources</span>
              </div>
              <div className="space-y-1">
                {matchingResources.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => {
                      onNavigate('library');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-left transition group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                        {res.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                          {res.type}
                        </span>
                        {res.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-[10px] text-slate-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {matchingNotes.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Digital Notebook & Study Guides</span>
              </div>
              <div className="space-y-1">
                {matchingNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      onNavigate('notebook', note.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-left transition group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                        {note.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {note.content.replace(/[#*`]/g, '')}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Questions */}
          {matchingQuestions.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Questions & Practice Bank</span>
              </div>
              <div className="space-y-1">
                {matchingQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      onNavigate('practice', q.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-left transition group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-1">
                        {q.prompt}
                      </div>
                      <div className="text-[10px] text-indigo-400 mt-0.5 capitalize">
                        {q.difficulty} • {q.type}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {matchingProjects.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-violet-400" />
                <span>Capstone Projects</span>
              </div>
              <div className="space-y-1">
                {matchingProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onNavigate('projects', p.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-left transition group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {p.progress}% completed
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-400 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
