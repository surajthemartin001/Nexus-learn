import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import type { ProjectItem, ProjectTask } from '../types';
import type { NavTab } from '../components/Sidebar';
import {
  FolderKanban,
  CheckCircle2,
  Circle,
  Plus,
  GitBranch,
  ExternalLink,
  Sparkles,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Layers,
  Code2,
} from 'lucide-react';

interface ProjectsViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onNavigate }) => {
  const { projects, activePath, updateProjectTask, addProject } = useLearning();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleCreateProject = () => {
    if (!newTitle.trim()) return;

    const newP: ProjectItem = {
      id: `proj-${Date.now()}`,
      userId: 'default',
      pathId: activePath?.id,
      title: newTitle,
      domain: activePath?.domain || 'Software Engineering',
      description: newDesc || 'Capstone implementation validating curriculum concepts.',
      objectives: ['Establish architecture invariants', 'Write core tests', 'Deploy live prototype'],
      requirements: ['TypeScript / Python runtime', 'Zero unhandled exceptions', 'Production documentation'],
      neededKnowledge: ['Core Programming', 'Data Structures', 'Testing & Verification'],
      tasks: [
        { id: 't-1', title: 'System design specification', completed: false },
        { id: 't-2', title: 'Core implementation and API tests', completed: false },
        { id: 't-3', title: 'Final deployment and verification benchmark', completed: false },
      ],
      progress: 0,
      status: 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addProject(newP);
    setSelectedProjectId(newP.id);
    setNewTitle('');
    setNewDesc('');
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-400">
            <FolderKanban className="w-4 h-4" />
            <span>Practical Capstone Engineering</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Hands-on Projects & AI Gap Detector
          </h1>
          <p className="text-xs text-slate-400">
            AI continuously detects missing prerequisite knowledge required to complete your projects.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-md shadow-violet-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Capstone Project</span>
        </button>
      </div>

      {/* Main Grid: Projects List (Left) & Active Project Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
            Active Projects ({projects.length})
          </span>
          {projects.map((proj) => {
            const isSelected = activeProject?.id === proj.id;
            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`p-4 rounded-3xl border transition cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-violet-600/15 border-violet-500 shadow-md'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-950 text-violet-300 border border-slate-800">
                    {proj.domain}
                  </span>
                  <span className="text-xs font-bold text-white">{proj.progress}%</span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1">
                  {proj.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {proj.description}
                </p>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Project Deep Dive Panel */}
        <div className="lg:col-span-8">
          {activeProject ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Top Banner */}
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                    Capstone Specification
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-mono capitalize">
                    {activeProject.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{activeProject.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeProject.description}
                </p>
              </div>

              {/* AI Prerequisite Knowledge Detector Alert */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>AI Prerequisite Knowledge Detection</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  To successfully build this project without blind spots, ensure you have mastered:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeProject.neededKnowledge.map((k) => (
                    <span
                      key={k}
                      className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-indigo-200 text-[11px] font-semibold"
                    >
                      ✓ {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Objectives & Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Core Objectives
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {activeProject.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Architectural Requirements
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {activeProject.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-violet-400">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Milestones & Tasks Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Milestones & Verification Tasks ({activeProject.tasks.filter((t) => t.completed).length}/{activeProject.tasks.length})
                  </h4>
                  <span className="text-xs font-bold text-violet-400">
                    {activeProject.progress}% complete
                  </span>
                </div>

                <div className="space-y-2">
                  {activeProject.tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => updateProjectTask(activeProject.id, task.id, !task.completed)}
                      className={`w-full p-3 rounded-2xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                        task.completed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        )}
                        <span className={task.completed ? 'line-through text-slate-400' : ''}>
                          {task.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              No project selected.
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Capstone Project</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus Engine"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Objectives & Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What practical engineering invariants will this project demonstrate?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-violet-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-md shadow-violet-500/20"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
