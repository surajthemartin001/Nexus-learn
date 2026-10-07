import React, { useState, useMemo } from 'react';
import { useLearning } from '../context/LearningContext';
import type { NavTab } from '../components/Sidebar';
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Layers,
  GraduationCap,
  Target,
  FolderKanban,
  FileText,
  Info,
} from 'lucide-react';

interface KnowledgeGraphViewProps {
  onNavigate: (tab: NavTab) => void;
}

interface GraphNode {
  id: string;
  title: string;
  type: 'subject' | 'topic' | 'prerequisite' | 'project';
  x: number;
  y: number;
  mastery?: number;
  color: string;
  data: any;
}

interface GraphEdge {
  from: string;
  to: string;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ onNavigate }) => {
  const { activePath, setActiveTopicId } = useLearning();

  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'topics' | 'prerequisites' | 'projects'>('all');

  // Compute graph nodes and edges
  const { nodes, edges } = useMemo(() => {
    const nodeList: GraphNode[] = [];
    const edgeList: GraphEdge[] = [];

    if (!activePath?.subjects) return { nodes: [], edges: [] };

    // Center layout
    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    activePath.subjects.forEach((sub, sIdx) => {
      const subAngle = (sIdx / (activePath.subjects!.length || 1)) * 2 * Math.PI;
      const subRadius = 140;
      const subX = centerX + Math.cos(subAngle) * subRadius;
      const subY = centerY + Math.sin(subAngle) * subRadius;

      const subNode: GraphNode = {
        id: sub.id,
        title: sub.title,
        type: 'subject',
        x: subX,
        y: subY,
        mastery: sub.masteryScore,
        color: sub.color || '#3b82f6',
        data: sub,
      };
      nodeList.push(subNode);

      // Topics around subject
      sub.topics?.forEach((top, tIdx) => {
        const topAngle = subAngle - 0.4 + (tIdx * 0.4);
        const topRadius = 260;
        const topX = centerX + Math.cos(topAngle) * topRadius;
        const topY = centerY + Math.sin(topAngle) * topRadius;

        const topNode: GraphNode = {
          id: top.id,
          title: top.title,
          type: 'topic',
          x: topX,
          y: topY,
          mastery: top.masteryScore,
          color: top.masteryScore >= 80 ? '#10b981' : top.masteryScore >= 50 ? '#6366f1' : '#f59e0b',
          data: top,
        };
        nodeList.push(topNode);
        edgeList.push({ from: sub.id, to: top.id });

        // Prerequisite links
        top.prerequisites.forEach((pName) => {
          const matched = sub.topics?.find((t) => t.title.toLowerCase().includes(pName.toLowerCase()));
          if (matched && matched.id !== top.id) {
            edgeList.push({ from: matched.id, to: top.id });
          }
        });
      });
    });

    return { nodes: nodeList, edges: edgeList };
  }, [activePath]);

  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return nodes;
    if (filterType === 'topics') return nodes.filter((n) => n.type === 'topic');
    if (filterType === 'prerequisites') return nodes.filter((n) => n.type === 'subject');
    return nodes;
  }, [nodes, filterType]);

  const getNodeRadius = (type: string) => {
    switch (type) {
      case 'subject':
        return 28;
      case 'topic':
        return 20;
      default:
        return 16;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Network className="w-4 h-4" />
            <span>Interactive Dependency Graph</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Knowledge Graph Topology
          </h1>
          <p className="text-xs text-slate-400">
            Click any node to inspect prerequisite chains, learning stacks, and active mastery scores.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph SVG Canvas */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden relative min-h-[500px] flex items-center justify-center">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Mastered (80%+)</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Developing</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Prerequisite Incomplete</span>
            </span>
          </div>

          <svg
            viewBox="0 0 800 550"
            className="w-full h-[550px] transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Edge Lines */}
            {edges.map((edge, idx) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              return (
                <line
                  key={idx}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray={fromNode.type === 'topic' ? '4 4' : 'none'}
                  opacity="0.6"
                />
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const r = getNodeRadius(node.type);
              return (
                <g
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node);
                    if (node.type === 'topic') {
                      setActiveTopicId(node.id);
                    }
                  }}
                  className="cursor-pointer transition-all hover:opacity-90"
                >
                  {/* Outer Pulsing Glow if selected */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r + 8}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="3"
                      strokeOpacity="0.4"
                      className="animate-pulse"
                    />
                  )}

                  {/* Core Node */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill="#0f172a"
                    stroke={node.color}
                    strokeWidth={isSelected ? '3' : '2'}
                  />

                  {/* Center Dot or Label */}
                  <circle cx={node.x} cy={node.y} r={r / 3} fill={node.color} />

                  {/* Text Label */}
                  <text
                    x={node.x}
                    y={node.y + r + 14}
                    textAnchor="middle"
                    fill="#cbd5e1"
                    fontSize="11"
                    fontWeight="500"
                    className="select-none pointer-events-none drop-shadow"
                  >
                    {node.title.length > 20 ? node.title.slice(0, 18) + '...' : node.title}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Inspector Panel */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Node Metadata
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono capitalize">
                    {selectedNode.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedNode.title}</h3>
                <p className="text-xs text-slate-300">
                  {selectedNode.data?.description || 'Active knowledge node in current curriculum'}
                </p>
              </div>

              {selectedNode.mastery !== undefined && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Demonstrated Mastery</span>
                    <span className="font-bold text-white">{selectedNode.mastery}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${selectedNode.mastery}%` }}
                    />
                  </div>
                </div>
              )}

              {selectedNode.data?.prerequisites && selectedNode.data.prerequisites.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 block">Required Prior Nodes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.data.prerequisites.map((p: string) => (
                      <span
                        key={p}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => onNavigate('practice')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Practice Node Invariants</span>
                </button>
                <button
                  onClick={() => onNavigate('tutor')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tutor Deep Dive</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center text-slate-400 text-xs space-y-2">
              <Info className="w-6 h-6 text-indigo-400 mx-auto" />
              <p>Click any node on the graph to inspect its dependency relationships and practice tests.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
