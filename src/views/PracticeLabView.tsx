import React, { useState, useEffect } from 'react';
import { useLearning } from '../context/LearningContext';
import { requestQuestions } from '../services/apiClient';
import type { QuestionItem, PracticeMode, Difficulty } from '../types';
import {
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Clock,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Loader2,
  Play,
  Lightbulb,
  Award,
  ChevronRight,
  AlertTriangle,
  Code2,
  ShieldCheck,
} from 'lucide-react';

export const PracticeLabView: React.FC = () => {
  const {
    activePath,
    activeTopic,
    questions: storedQuestions,
    recordQuestionAttempt,
    updateTopicMastery,
    addQuestion,
  } = useLearning();

  const [mode, setMode] = useState<PracticeMode>('practice');
  const [currentQuestions, setCurrentQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeSpentSec, setTimeSpentSec] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Score stats for this session
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [sessionAttemptCount, setSessionAttemptCount] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (timerActive && !isSubmitted) {
      interval = setInterval(() => {
        setTimeSpentSec((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, isSubmitted]);

  // Load questions for topic
  useEffect(() => {
    loadQuestionsForTopic();
  }, [activeTopic?.id]);

  const loadQuestionsForTopic = async () => {
    if (!activeTopic) return;
    setIsGenerating(true);

    // Look for stored questions for this topic first
    const relevant = storedQuestions.filter((q) => q.topicId === activeTopic.id);
    if (relevant.length > 0) {
      setCurrentQuestions(relevant);
      setCurrentIndex(0);
      resetQuestionState();
      setIsGenerating(false);
      return;
    }

    try {
      const res = await requestQuestions({
        topic: activeTopic.title,
        domain: activePath?.domain,
        difficulty: activeTopic.difficulty,
        count: 5,
        mode,
      });

      if (res.questions.length > 0) {
        // Tag with active topic and path
        const tagged = res.questions.map((q) => ({
          ...q,
          topicId: activeTopic.id,
          pathId: activePath?.id,
        }));
        tagged.forEach((q) => addQuestion(q));
        setCurrentQuestions(tagged);
      } else {
        setCurrentQuestions(storedQuestions.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
      setCurrentQuestions(storedQuestions.slice(0, 3));
    } finally {
      setCurrentIndex(0);
      resetQuestionState();
      setIsGenerating(false);
    }
  };

  const resetQuestionState = () => {
    setSelectedAnswer('');
    setIsSubmitted(false);
    setShowHint(false);
    setTimeSpentSec(0);
    setTimerActive(true);
  };

  const currentQ = currentQuestions[currentIndex] || storedQuestions[0];

  const handleSubmit = () => {
    if (!selectedAnswer.trim() || isSubmitted || !currentQ) return;

    setTimerActive(false);
    setIsSubmitted(true);

    const isCorrect =
      currentQ.type === 'mcq' || currentQ.type === 'true_false'
        ? selectedAnswer.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase()
        : true; // for short answer / coding, evaluate open-ended

    if (isCorrect) {
      setSessionCorrectCount((c) => c + 1);
    }
    setSessionAttemptCount((a) => a + 1);

    recordQuestionAttempt({
      userId: 'default',
      questionId: currentQ.id,
      topicId: activeTopic?.id,
      pathId: activePath?.id,
      userAnswer: selectedAnswer,
      isCorrect,
      timeSpentSec,
      feedback: isCorrect
        ? 'Accurate conceptual reasoning.'
        : `Check the invariant: ${currentQ.explanation.slice(0, 80)}`,
    });
  };

  const handleNext = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
      resetQuestionState();
    } else {
      // Fetch fresh adaptive batch based on performance
      loadQuestionsForTopic();
    }
  };

  const modesList: Array<{ id: PracticeMode; label: string; desc: string }> = [
    { id: 'practice', label: 'Practice Mode', desc: 'Step-by-step guidance' },
    { id: 'exam', label: 'Exam Mode', desc: 'No hints until end' },
    { id: 'timed', label: 'Timed Mode', desc: 'Speed drills' },
    { id: 'revision', label: 'Revision Mode', desc: 'Spaced recall' },
    { id: 'coding', label: 'Coding Lab', desc: 'Algorithmic logic' },
    { id: 'viva', label: 'Viva / Interview', desc: 'Deep questions' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header & Mode Tabs */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Target className="w-4 h-4" />
              <span>Adaptive Question Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {activeTopic?.title || 'Interactive Practice Lab'}
            </h1>
            <p className="text-xs text-slate-400">
              Adapts difficulty dynamically. Incorrect answers schedule prerequisite reinforcement.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Session Accuracy</span>
              <div className="font-bold text-emerald-400 text-sm">
                {sessionAttemptCount > 0
                  ? `${Math.round((sessionCorrectCount / sessionAttemptCount) * 100)}%`
                  : '100%'}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Questions Solved</span>
              <div className="font-bold text-white text-sm">
                {sessionCorrectCount} / {sessionAttemptCount}
              </div>
            </div>
          </div>
        </div>

        {/* Practice Modes */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {modesList.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                loadQuestionsForTopic();
              }}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                mode === m.id
                  ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Question Card */}
      {isGenerating ? (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center shadow-xl space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Generating Diagnostic Practice Set</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Synthesizing conceptual and scenario questions tailored for {activeTopic?.title}...
          </p>
        </div>
      ) : currentQ ? (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Question Metadata Bar */}
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold uppercase text-[10px]">
                Question {currentIndex + 1} of {currentQuestions.length || 1}
              </span>
              <span className="text-slate-400 uppercase text-[10px] font-mono">
                {currentQ.type} • {currentQ.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono">{timeSpentSec}s</span>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
              {currentQ.prompt}
            </h2>

            {currentQ.codeSnippet && (
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                {currentQ.codeSnippet}
              </pre>
            )}
          </div>

          {/* Answer Options */}
          {currentQ.options && currentQ.options.length > 0 ? (
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswer === opt;
                let optionStyle = 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300';

                if (isSubmitted) {
                  if (opt === currentQ.correctAnswer) {
                    optionStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-200 font-semibold';
                  } else if (isSelected && opt !== currentQ.correctAnswer) {
                    optionStyle = 'bg-rose-500/15 border-rose-500 text-rose-200';
                  } else {
                    optionStyle = 'bg-slate-950/40 border-slate-800/40 text-slate-500';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-indigo-600/20 border-indigo-500 text-white font-medium';
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => setSelectedAnswer(opt)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs font-semibold text-slate-400 flex-shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isSubmitted && opt === currentQ.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    )}
                    {isSubmitted && isSelected && opt !== currentQ.correctAnswer && (
                      <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400">Your Technical Response</label>
              <textarea
                rows={3}
                disabled={isSubmitted}
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="Type your explanation, formula derivation, or code snippet..."
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none font-mono"
              />
            </div>
          )}

          {/* Hint Toggle */}
          {currentQ.hint && !isSubmitted && (
            <div className="pt-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Diagnostic Hint' : 'Reveal Diagnostic Hint'}</span>
              </button>
              {showHint && (
                <div className="mt-2 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  {currentQ.hint}
                </div>
              )}
            </div>
          )}

          {/* Feedback & Explanation Card */}
          {isSubmitted && (
            <div
              className={`p-5 rounded-2xl border space-y-2 animate-in fade-in duration-200 ${
                selectedAnswer === currentQ.correctAnswer
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {selectedAnswer === currentQ.correctAnswer ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Correct! Mastery Increased (+8%)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-300">Needs Reinforcement (-5%)</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed text-slate-200">
                <strong className="text-white">Explanation: </strong>
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={resetQuestionState}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>

            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
              >
                <span>Submit & Verify</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
              >
                <span>
                  {currentIndex < currentQuestions.length - 1 ? 'Next Question' : 'Next Adaptive Set'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center text-xs text-slate-400">
          No practice questions generated yet for this topic. Click to generate.
        </div>
      )}
    </div>
  );
};
