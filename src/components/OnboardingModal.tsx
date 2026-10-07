import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import type { Difficulty } from '../types';
import {
  Compass,
  Check,
  Sparkles,
  ArrowRight,
  Code2,
  Shield,
  Cpu,
  Brain,
  Calculator,
  Briefcase,
  Trophy,
  Microscope,
  Award,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreatePath: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onOpenCreatePath,
}) => {
  const { learningPaths, setActivePathId } = useLearning();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([
    'Software Engineering',
    'Robotics & AI Systems',
  ]);
  const [selectedGoalTypes, setSelectedGoalTypes] = useState<string[]>([
    'Skill Development',
    'Project Building',
  ]);
  const [level, setLevel] = useState<Difficulty>('intermediate');
  const [customGoal, setCustomGoal] = useState('');

  if (!isOpen) return null;

  const domainsList = [
    { id: 'Software Engineering', label: 'Software Development', icon: Code2, desc: 'Web, backend, APIs, system design, databases' },
    { id: 'Cybersecurity', label: 'Cybersecurity & Ethical Hacking', icon: Shield, desc: 'Networking, Linux, OWASP, defense, CTF labs' },
    { id: 'Robotics & AI Systems', label: 'Robotics & NEXORA Systems', icon: Cpu, desc: 'Kinematics, sensors, control, embedded, vision' },
    { id: 'AI / Machine Learning', label: 'AI / Machine Learning', icon: Brain, desc: 'Math, deep learning, PyTorch, vision, LLMs' },
    { id: 'Competitive Exams & JEE', label: 'Competitive Exams (JEE / GATE)', icon: Calculator, desc: 'Physics, chemistry, math problem solving' },
    { id: 'Research & Science', label: 'Academic Research & Papers', icon: Microscope, desc: 'Literature review, proofs, novel hypotheses' },
  ];

  const goalTypes = [
    { id: 'Skill Development', label: 'Skill Development', icon: Sparkles },
    { id: 'Job Preparation', label: 'Job / Interview Prep', icon: Briefcase },
    { id: 'Project Building', label: 'Practical Project Building', icon: Code2 },
    { id: 'Exam Preparation', label: 'Exam / Certification Passing', icon: Award },
    { id: 'Competitive Programming', label: 'Competitive Programming', icon: Trophy },
  ];

  const toggleDomain = (id: string) => {
    setSelectedDomains((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleGoalType = (id: string) => {
    setSelectedGoalTypes((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    // If user chose cybersecurity, switch active path to cybersecurity
    if (selectedDomains.includes('Cybersecurity')) {
      const cyberPath = learningPaths.find((p) => p.domain.includes('Cyber'));
      if (cyberPath) setActivePathId(cyberPath.id);
    } else if (selectedDomains.includes('Robotics & AI Systems')) {
      const robPath = learningPaths.find((p) => p.domain.includes('Robotics'));
      if (robPath) setActivePathId(robPath.id);
    }
    localStorage.setItem('nexus_onboarding_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {step === 1 ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Compass className="w-3.5 h-3.5" />
                <span>Personalized Learning Architecture</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Welcome to NEXUS Learn
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                No fixed batches or cookie-cutter classrooms. Configure your personal learning university.
              </p>
            </div>

            {/* Select Domains */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Select your focus areas (Multi-domain supported)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {domainsList.map((dom) => {
                  const Icon = dom.icon;
                  const isSelected = selectedDomains.includes(dom.id);
                  return (
                    <button
                      key={dom.id}
                      type="button"
                      onClick={() => toggleDomain(dom.id)}
                      className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500 text-white'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-900 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs flex items-center justify-between">
                          <span>{dom.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{dom.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                <span>Continue to Goals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-white">Define Your Targets & Level</h2>
              <p className="text-xs text-slate-400">
                AI customizes questions, notes, and roadmap pace to your exact level.
              </p>
            </div>

            {/* Custom Goal */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                What is your specific goal? (e.g., "Build autonomous robot", "Become senior full-stack")
              </label>
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="Describe in your own words..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            {/* Goal Intentions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                What kind of outcomes are you aiming for?
              </label>
              <div className="flex flex-wrap gap-2">
                {goalTypes.map((gt) => {
                  const Icon = gt.icon;
                  const isSelected = selectedGoalTypes.includes(gt.id);
                  return (
                    <button
                      key={gt.id}
                      type="button"
                      onClick={() => toggleGoalType(gt.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{gt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Current Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition cursor-pointer ${
                      level === lvl
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    handleComplete();
                    onOpenCreatePath();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 text-xs font-semibold transition cursor-pointer"
                >
                  Import Syllabus Now
                </button>
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 cursor-pointer"
                >
                  <span>Launch My Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
