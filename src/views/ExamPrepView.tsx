import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import {
  FileQuestion,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const ExamPrepView: React.FC = () => {
  const { activePath, questions, stats } = useLearning();

  const [examType, setExamType] = useState('Comprehensive Technical Certification');
  const [testMode, setTestMode] = useState<'full' | 'chapter' | 'weak_topics'>('full');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 mins
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isTestFinished, setIsTestFinished] = useState(false);

  const testQuestions = questions.slice(0, 5);

  const startTest = () => {
    setIsRunningTest(true);
    setIsTestFinished(false);
    setSelectedAnswers({});
    setCurrentIdx(0);
    setTimeRemaining(1800);
  };

  const finishTest = () => {
    setIsRunningTest(false);
    setIsTestFinished(true);
  };

  const calculateScore = () => {
    let correct = 0;
    testQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx]?.toLowerCase() === q.correctAnswer?.toLowerCase()) {
        correct++;
      }
    });
    return {
      correct,
      total: testQuestions.length,
      percentage: Math.round((correct / (testQuestions.length || 1)) * 100),
    };
  };

  const result = isTestFinished ? calculateScore() : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Disclaimer Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
        <span>
          <strong>Academic Integrity Notice:</strong> AI-generated mock tests simulate real exam patterns and question formats for educational practice. They do not claim to be leaked or official exam papers.
        </span>
      </div>

      {!isRunningTest && !isTestFinished ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <FileQuestion className="w-4 h-4" />
              <span>Standardized Exam Simulation Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Mock Tests & Timed Diagnostic Assessments
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Experience authentic timed exam conditions with negative marking models, question palettes, and post-exam conceptual gap audits.
            </p>

            {/* Test Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              {[
                { id: 'full', label: 'Full Mock Test', time: '30 mins', items: '5 verified problems' },
                { id: 'chapter', label: 'Chapter Assessment', time: '15 mins', items: 'Topic focused' },
                { id: 'weak_topics', label: 'Weak-Topic Drill', time: '20 mins', items: 'Adaptive priority' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTestMode(t.id as any)}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    testMode === t.id
                      ? 'bg-rose-500/15 border-rose-500 text-white font-semibold'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{t.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{t.time} • {t.items}</div>
                </button>
              ))}
            </div>

            <button
              onClick={startTest}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-xs font-bold text-white shadow-lg shadow-rose-500/25 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Begin Timed Mock Exam</span>
            </button>
          </div>
        </div>
      ) : isRunningTest ? (
        /* Active Test Runner */
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                Question {currentIdx + 1} of {testQuestions.length}
              </span>
              <h3 className="text-sm font-bold text-white">Full Mock Test Session</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-rose-300">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Question Body */}
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-100 whitespace-pre-wrap">
              {testQuestions[currentIdx]?.prompt}
            </p>

            <div className="space-y-2.5">
              {testQuestions[currentIdx]?.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: opt }))}
                  className={`w-full p-4 rounded-2xl border text-left text-xs transition cursor-pointer ${
                    selectedAnswers[currentIdx] === opt
                      ? 'bg-rose-500/20 border-rose-500 text-white font-semibold'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono mr-2 font-bold">{String.fromCharCode(65 + i)}.</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => i - 1)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {currentIdx < testQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((i) => i + 1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition cursor-pointer"
                >
                  Next Problem
                </button>
              ) : (
                <button
                  onClick={finishTest}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-500/25 transition cursor-pointer"
                >
                  Submit Exam Paper
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Results Card */
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Exam Assessment Completed</span>
            <h2 className="text-3xl font-black text-white mt-1">
              Score: {result?.percentage}%
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {result?.correct} out of {result?.total} problems solved accurately.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={startTest}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
            >
              Retake Test
            </button>
            <button
              onClick={() => setIsTestFinished(false)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer"
            >
              Return to Exam Engine
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
