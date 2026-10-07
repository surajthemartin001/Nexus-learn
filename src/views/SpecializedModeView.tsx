import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import {
  Terminal,
  ShieldAlert,
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface SpecializedModeViewProps {
  mode: 'developer' | 'cybersecurity' | 'robotics';
}

export const SpecializedModeView: React.FC<SpecializedModeViewProps> = ({ mode }) => {
  const { activePath, recordQuestionAttempt, updateTopicMastery } = useLearning();

  // Developer Mode State
  const [devCode, setDevCode] = useState(
    `// Event Loop & Microtask Priority Challenge\nconsole.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nprocess.nextTick(() => console.log("D"));\nconsole.log("E");`
  );
  const [devOutput, setDevOutput] = useState<string | null>(null);

  // Cybersecurity Lab State
  const [cyberInput, setCyberInput] = useState("admin' OR '1'='1");
  const [cyberVulnerableResult, setCyberVulnerableResult] = useState<string | null>(null);
  const [cyberDefensiveCode, setCyberDefensiveCode] = useState<string | null>(null);

  // Robotics / NEXORA State
  const [quaternionTheta, setQuaternionTheta] = useState(45);
  const [jointAngle1, setJointAngle1] = useState(30);
  const [jointAngle2, setJointAngle2] = useState(45);

  const runDevCode = () => {
    // Deterministic event loop simulator output
    setDevOutput(`[Execution Sandbox Output]:\n> A\n> E\n> D (process.nextTick drained)\n> C (Promise microtask queue)\n> B (macrotask timer phase)`);
  };

  const runCybersecurityExploit = () => {
    setCyberVulnerableResult(
      `[VULNERABLE QUERY GENERATED]:\nSELECT * FROM users WHERE username = '${cyberInput}';\n\n⚠️ INJECTION SUCCEEDED: The Boolean literal '1'='1' evaluated to TRUE across all rows. 15,420 user records exfiltrated.`
    );
    setCyberDefensiveCode(
      `// DEFENSIVE MITIGATION (Parameterized Prepared Statement):\nconst query = 'SELECT * FROM users WHERE username = $1';\nconst result = await db.query(query, [userInput]);\n// Exploit neutralized: User input is treated solely as literal string parameter.`
    );
  };

  // Robotics Kinematics forward solver (2-DOF planar arm)
  const l1 = 100;
  const l2 = 80;
  const rad1 = (jointAngle1 * Math.PI) / 180;
  const rad2 = ((jointAngle1 + jointAngle2) * Math.PI) / 180;
  const xEnd = Math.round(l1 * Math.cos(rad1) + l2 * Math.cos(rad2));
  const yEnd = Math.round(l1 * Math.sin(rad1) + l2 * Math.sin(rad2));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Mode Header */}
      {mode === 'developer' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Terminal className="w-4 h-4" />
            <span>Developer Sandbox & Code Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white">Full-Stack Software Architecture Lab</h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Simulate asynchronous concurrency models, inspect memory layouts, and practice algorithmic design with immediate execution.
          </p>
        </div>
      )}

      {mode === 'cybersecurity' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <ShieldAlert className="w-4 h-4" />
            <span>Authorized Defensive Cybersecurity Lab</span>
          </div>
          <h1 className="text-2xl font-black text-white">Ethical Hacking & OWASP Defensive Sandbox</h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Inspect injection attack vectors, examine network protocols, and write cryptographically verified defense rules in an authorized academic environment.
          </p>
        </div>
      )}

      {mode === 'robotics' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Cpu className="w-4 h-4" />
            <span>NEXORA Advanced Robotics & Autonomous AI</span>
          </div>
          <h1 className="text-2xl font-black text-white">Spatial Kinematics & Sensor Fusion Simulator</h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Interact with SO(3) Quaternions, forward & inverse kinematic chains, and Kalman filter state estimation without gimbal lock.
          </p>
        </div>
      )}

      {/* Mode-Specific Interactive Workbench */}
      {mode === 'developer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Code Sandbox (Node.js Concurrency)</span>
              <button
                onClick={runDevCode}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Execute Script</span>
              </button>
            </div>
            <textarea
              rows={12}
              value={devCode}
              onChange={(e) => setDevCode(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <span className="text-xs font-bold text-slate-300">Execution Telemetry</span>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 min-h-[220px] whitespace-pre-wrap">
              {devOutput || '// Click "Execute Script" to observe microtask / macrotask draining.'}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1 text-slate-400">
              <strong className="text-white">Core Invariant:</strong> In Node.js, `process.nextTick()` has higher priority than standard microtasks, executing immediately after the currently running operation regardless of the loop phase.
            </div>
          </div>
        </div>
      )}

      {mode === 'cybersecurity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <span className="text-xs font-bold text-slate-300">SQL Injection Simulation Vector</span>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Untrusted User Input Parameter</label>
              <input
                type="text"
                value={cyberInput}
                onChange={(e) => setCyberInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={runCybersecurityExploit}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Simulate Vulnerable Query Execution
            </button>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <span className="text-xs font-bold text-slate-300">Defensive Audit & Mitigation</span>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 min-h-[160px] whitespace-pre-wrap">
              {cyberVulnerableResult || '// Enter payload and click simulate to test query breakdown.'}
            </div>

            {cyberDefensiveCode && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-200 whitespace-pre-wrap">
                {cyberDefensiveCode}
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'robotics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kinematics Controller */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
            <span className="text-xs font-bold text-slate-300">2-DOF Robotic Arm Forward Kinematics</span>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Joint Angle θ₁</span>
                  <span className="font-mono text-cyan-400">{jointAngle1}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={jointAngle1}
                  onChange={(e) => setJointAngle1(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Joint Angle θ₂</span>
                  <span className="font-mono text-cyan-400">{jointAngle2}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={jointAngle2}
                  onChange={(e) => setJointAngle2(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calculated End-Effector Pose</span>
              <div className="font-mono text-sm text-cyan-300">
                X = {xEnd} mm, Y = {yEnd} mm
              </div>
              <div className="text-[11px] text-slate-400">
                L₁ = 100mm, L₂ = 80mm. Computed via homogeneous trigonometric coordinate projections.
              </div>
            </div>
          </div>

          {/* Interactive Visualizer Canvas */}
          <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-xl flex flex-col items-center justify-center min-h-[300px]">
            <span className="text-[11px] text-slate-400 mb-2">Kinematic Coordinate Plane</span>
            <svg viewBox="0 0 300 240" className="w-full h-56 bg-slate-900/60 rounded-2xl border border-slate-800/80">
              {/* Origin */}
              <circle cx="150" cy="200" r="6" fill="#6366f1" />
              {/* Arm 1 */}
              <line
                x1="150"
                y1="200"
                x2={150 + (l1 * Math.cos(rad1)) / 1.5}
                y2={200 - (l1 * Math.sin(rad1)) / 1.5}
                stroke="#818cf8"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Joint 2 */}
              <circle
                cx={150 + (l1 * Math.cos(rad1)) / 1.5}
                cy={200 - (l1 * Math.sin(rad1)) / 1.5}
                r="5"
                fill="#38bdf8"
              />
              {/* Arm 2 */}
              <line
                x1={150 + (l1 * Math.cos(rad1)) / 1.5}
                y1={200 - (l1 * Math.sin(rad1)) / 1.5}
                x2={150 + xEnd / 1.5}
                y2={200 - yEnd / 1.5}
                stroke="#38bdf8"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* End Effector */}
              <circle cx={150 + xEnd / 1.5} cy={200 - yEnd / 1.5} r="6" fill="#34d399" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
