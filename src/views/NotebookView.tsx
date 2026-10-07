import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import { requestNoteArtifact } from '../services/apiClient';
import type { NoteItem, ResourceItem } from '../types';
import {
  BookMarked,
  Sparkles,
  Plus,
  FileText,
  Layers,
  CheckCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Search,
  BookOpen,
  HelpCircle,
  Copy,
  Check,
  SplitSquareVertical,
  Paperclip,
} from 'lucide-react';

export const NotebookView: React.FC = () => {
  const { notes, resources, activeTopic, activePath, addNote, updateNote, addResource } = useLearning();

  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [artifactType, setArtifactType] = useState<
    'summary' | 'study_guide' | 'flashcards' | 'faq' | 'concept_map' | 'revision_sheet'
  >('study_guide');

  // New Source quick modal
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceSnippet, setNewSourceSnippet] = useState('');
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleGenerateArtifact = async () => {
    setIsSynthesizing(true);
    try {
      // Gather text of selected sources
      const sourcesText = resources
        .filter((r) => selectedSources.includes(r.id))
        .map((r) => `[Source: ${r.title}]\n${r.contentSnippet || r.sourceUrl || ''}`)
        .join('\n\n');

      const res = await requestNoteArtifact({
        topic: activeTopic?.title || 'Core Principles',
        artifactType,
        sourceText: sourcesText || undefined,
      });

      const newNoteItem: NoteItem = {
        id: `note-${Date.now()}`,
        userId: 'default',
        pathId: activePath?.id,
        topicId: activeTopic?.id,
        title: res.title,
        content: res.content,
        type: artifactType as any,
        sourceIds: selectedSources,
        isGrounded: selectedSources.length > 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addNote(newNoteItem);
      setSelectedNoteId(newNoteItem.id);
    } catch (err) {
      console.error('Failed to synthesize artifact:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleAddCustomSource = () => {
    if (!newSourceTitle.trim()) return;

    addResource({
      userId: 'default',
      pathId: activePath?.id,
      topicId: activeTopic?.id,
      title: newSourceTitle,
      type: 'doc',
      contentSnippet: newSourceSnippet,
      tags: ['NotebookSource', activePath?.domain || 'General'],
      isRequired: false,
      aiRecommended: false,
      tier: 'primary',
    });

    setNewSourceTitle('');
    setNewSourceSnippet('');
    setShowAddSourceModal(false);
  };

  const toggleSourceSelection = (id: string) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const artifactButtons = [
    { id: 'study_guide', label: 'Study Guide' },
    { id: 'summary', label: 'Executive Summary' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'concept_map', label: 'Concept Map' },
    { id: 'faq', label: 'Comprehensive FAQ' },
    { id: 'revision_sheet', label: 'Revision Sheet' },
  ] as const;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <BookMarked className="w-4 h-4" />
            <span>AI Digital Notebook & Research Synthesizer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Source-Grounded Notebook
          </h1>
          <p className="text-xs text-slate-400">
            Attach textbooks, papers, notes, or URLs. AI synthesizes verifiable summaries and study guides.
          </p>
        </div>

        <button
          onClick={() => setShowAddSourceModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 transition cursor-pointer"
        >
          <Paperclip className="w-4 h-4" />
          <span>+ Add Grounding Source</span>
        </button>
      </div>

      {/* Main 3-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sources & Generator */}
        <div className="lg:col-span-4 space-y-5">
          {/* Attached Sources Panel */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Select Sources ({selectedSources.length} Selected)
              </span>
              <button
                onClick={() =>
                  setSelectedSources(
                    selectedSources.length === resources.length ? [] : resources.map((r) => r.id)
                  )
                }
                className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
              >
                {selectedSources.length === resources.length ? 'Clear all' : 'Select all'}
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {resources.map((res) => {
                const isSelected = selectedSources.includes(res.id);
                return (
                  <div
                    key={res.id}
                    onClick={() => toggleSourceSelection(res.id)}
                    className={`p-3 rounded-2xl border text-left text-xs transition cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-cyan-600/15 border-cyan-500 text-white font-medium'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-cyan-500 focus:ring-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{res.title}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {res.contentSnippet || res.sourceUrl || 'Reference Material'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Generator Panel */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              2. Choose Synthesis Artifact
            </span>

            <div className="grid grid-cols-2 gap-2">
              {artifactButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setArtifactType(btn.id)}
                  className={`p-2.5 rounded-xl border text-[11px] font-medium transition cursor-pointer text-center ${
                    artifactType === btn.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateArtifact}
              disabled={isSynthesizing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing from Sources...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Notes Index List */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              My Saved Notes ({notes.length})
            </span>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition cursor-pointer truncate ${
                    activeNote?.id === note.id
                      ? 'bg-indigo-600/15 border-indigo-500 text-indigo-200 font-medium'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate font-semibold">{note.title}</div>
                  <div className="text-[10px] text-slate-400 capitalize mt-0.5">
                    {note.type.replace('_', ' ')} • {note.isGrounded ? 'Grounded' : 'AI generated'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Note Reader & Editor */}
        <div className="lg:col-span-8">
          {activeNote ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
              {/* Note Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                      {activeNote.type.replace('_', ' ')}
                    </span>
                    {activeNote.isGrounded && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Source Grounded</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white">{activeNote.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyContent(activeNote.content)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Copy Markdown"
                  >
                    {copiedNote ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Distinguish Warning Box if Not Grounded */}
              {!activeNote.isGrounded && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <strong>General AI Synthesis:</strong> This note was derived from model knowledge base rather than verified user source documents.
                </div>
              )}

              {/* Content Body (Markdown styled) */}
              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 font-mono">
                {activeNote.content}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              No notes created yet. Select sources and click "Synthesize with AI".
            </div>
          )}
        </div>
      </div>

      {/* Add Custom Source Modal */}
      {showAddSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add Knowledge Source</h3>
            <p className="text-xs text-slate-400">
              Provide article excerpt, lecture notes, textbook summary, or document text.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Source Title
                </label>
                <input
                  type="text"
                  value={newSourceTitle}
                  onChange={(e) => setNewSourceTitle(e.target.value)}
                  placeholder="e.g. Stanford CS229 Lecture Notes (PDF)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Content / Excerpt
                </label>
                <textarea
                  rows={4}
                  value={newSourceSnippet}
                  onChange={(e) => setNewSourceSnippet(e.target.value)}
                  placeholder="Paste excerpt, formulas, or key notes to ground the AI..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddSourceModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomSource}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-md shadow-cyan-500/20"
              >
                Save Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
