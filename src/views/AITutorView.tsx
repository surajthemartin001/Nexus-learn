import React, { useState, useRef, useEffect } from 'react';
import { useLearning } from '../context/LearningContext';
import { requestTutorChat, requestTTS } from '../services/apiClient';
import type { ChatMessage } from '../types';
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  Layers,
  Code2,
  CheckCircle,
  Loader2,
  User,
  Bot,
  ShieldAlert,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

export const AITutorView: React.FC = () => {
  const { activePath, activeTopic, resources } = useLearning();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      role: 'assistant',
      content: `Welcome to your personal learning institute. I am your AI Tutor and research mentor for **${activePath?.title || 'your curriculum'}**.\n\nWe are currently focused on **${activeTopic?.title || 'Fundamental Principles'}**.\n\nI can decompose complex proofs, guide you with Socratic questions, write verified code architectures, or ground my explanations in your attached sources. What would you like to explore?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tutorMode, setTutorMode] = useState<'socratic' | 'first_principles' | 'code_review' | 'exam_drill'>('socratic');
  const [groundInSources, setGroundInSources] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const activeSources = groundInSources
        ? resources.map((r) => `${r.title}: ${r.contentSnippet || r.sourceUrl}`)
        : undefined;

      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await requestTutorChat({
        messages: conversationHistory,
        currentTopic: activeTopic?.title,
        learningPathTitle: activePath?.title,
        domain: activePath?.domain,
        sources: activeSources,
        mode: tutorMode,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourcesGrounded: res.groundedInSources ? ['Attached Library Sources'] : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Tutor chat failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayTTS = async (msgId: string, text: string) => {
    if (isPlayingAudio === msgId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlayingAudio(null);
      return;
    }

    setIsPlayingAudio(msgId);
    try {
      // First try Gemini TTS
      const audioBase64 = await requestTTS(text);
      if (audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        audioRef.current = audio;
        audio.onended = () => setIsPlayingAudio(null);
        audio.onerror = () => {
          fallbackSpeechSynthesis(text);
        };
        await audio.play();
      } else {
        fallbackSpeechSynthesis(text);
      }
    } catch {
      fallbackSpeechSynthesis(text);
    }
  };

  const fallbackSpeechSynthesis = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 300));
      utterance.rate = 1.05;
      utterance.onend = () => setIsPlayingAudio(null);
      utterance.onerror = () => setIsPlayingAudio(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(null);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    `Explain ${activeTopic?.title || 'this topic'} from first principles`,
    `Give me an intuitive mathematical or code counter-example`,
    `Why is this prerequisite fundamental to real-world engineering?`,
    `Ask me 2 diagnostic check questions to test my understanding`,
  ];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col max-w-5xl mx-auto pb-4">
      {/* Top Banner / Mode Controls */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">AI Personal Institute Tutor</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30">
                Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Active Context: <strong className="text-slate-200">{activeTopic?.title || 'General'}</strong> ({activePath?.domain})
            </p>
          </div>
        </div>

        {/* Mode Selector & Grounding Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
            {(
              [
                { id: 'socratic', label: 'Socratic' },
                { id: 'first_principles', label: 'Principles' },
                { id: 'code_review', label: 'Code Lab' },
                { id: 'exam_drill', label: 'Exam Drill' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setTutorMode(m.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  tutorMode === m.id
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setGroundInSources(!groundInSources)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition cursor-pointer ${
              groundInSources
                ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Ground AI responses strictly in your attached library resources"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Source-Grounded {groundInSources ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold border ${
                  isUser
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-indigo-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-3xl p-4 sm:p-5 shadow-lg space-y-2 border ${
                  isUser
                    ? 'bg-indigo-600/90 text-white border-indigo-500/40 rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border-slate-800 rounded-tl-none'
                }`}
              >
                {/* Content */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Grounding tag */}
                {msg.sourcesGrounded && (
                  <div className="flex items-center gap-1.5 pt-1 text-[10px] text-cyan-400 font-medium border-t border-slate-800/80">
                    <CheckCircle className="w-3 h-3" />
                    <span>Grounded in Active Source Materials</span>
                  </div>
                )}

                {/* Message Meta & Action Bar */}
                <div
                  className={`flex items-center justify-between pt-1 text-[10px] ${
                    isUser ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyText(msg.id, msg.content)}
                        className="p-1 hover:text-white rounded transition cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handlePlayTTS(msg.id, msg.content)}
                        className={`p-1 rounded transition cursor-pointer ${
                          isPlayingAudio === msg.id ? 'text-indigo-400 font-bold' : 'hover:text-white'
                        }`}
                        title="Read aloud with Gemini TTS"
                      >
                        {isPlayingAudio === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Analyzing curriculum invariants & reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-2 flex items-center gap-2 shadow-2xl focus-within:border-indigo-500/80 transition">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Ask AI Tutor about ${activeTopic?.title || 'this topic'} (or press Enter)...`}
          className="flex-1 bg-transparent px-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shadow-md shadow-indigo-500/20 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
