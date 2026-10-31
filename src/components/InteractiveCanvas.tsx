"use client";

import React, { useRef, useState } from "react";
import { useNexusStore, NodeCategory } from "../store/useNexusStore";
import {
  Cpu,
  Database,
  Globe,
  HardDrive,
  Link2,
  Plus,
  Server,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const CATEGORY_STYLE: Record<
  NodeCategory,
  { badge: string; border: string; glow: string; colorHex: string; icon: any }
> = {
  GATEWAY: {
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
    border: "border-cyan-400/60",
    glow: "shadow-[0_0_25px_rgba(6,182,212,0.28)]",
    colorHex: "#06B6D4",
    icon: Globe,
  },
  SERVICE: {
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40",
    border: "border-indigo-400/60",
    glow: "shadow-[0_0_25px_rgba(99,102,241,0.28)]",
    colorHex: "#6366F1",
    icon: Server,
  },
  AI: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    border: "border-emerald-400/60",
    glow: "shadow-[0_0_25px_rgba(16,185,129,0.3)]",
    colorHex: "#10B981",
    icon: Cpu,
  },
  DATABASE: {
    badge: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    border: "border-purple-400/60",
    glow: "shadow-[0_0_25px_rgba(168,85,247,0.28)]",
    colorHex: "#A855F7",
    icon: Database,
  },
  CACHE: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    border: "border-amber-400/60",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.28)]",
    colorHex: "#F59E0B",
    icon: HardDrive,
  },
};

export default function InteractiveCanvas() {
  const {
    lang,
    nodes,
    edges,
    selectedNodeId,
    connectingFromId,
    isStressMode,
    showTeamCursors,
    zoom,
    selectNode,
    moveNode,
    addNode,
    deleteSelectedNode,
    startConnecting,
    setZoom,
  } = useNexusStore();

  const boardRef = useRef<HTMLDivElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const NODE_W = 210;
  const NODE_H = 108;

  const startDrag = (
    clientX: number,
    clientY: number,
    id: string,
    nodeX: number,
    nodeY: number
  ) => {
    selectNode(id);
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    setDraggingId(id);
    setDragOffset({
      x: clientX - rect.left - nodeX,
      y: clientY - rect.top - nodeY,
    });
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!draggingId || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const nextX = clientX - rect.left - dragOffset.x;
    const nextY = clientY - rect.top - dragOffset.y;
    moveNode(draggingId, nextX, nextY);
  };

  return (
    <div className="nexus-card rounded-2xl border border-white/15 p-3.5 md:p-4 flex flex-col justify-between space-y-3 h-full min-w-0">
      {/* نوار ابزار بوم طراحی */}
      <div
        dir={lang === "fa" ? "rtl" : "ltr"}
        className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { cat: "SERVICE", label: lang === "fa" ? "+ میکروسرویس" : "+ Service" },
              { cat: "AI", label: lang === "fa" ? "+ نود هوش مصنوعی" : "+ AI Node" },
              { cat: "DATABASE", label: lang === "fa" ? "+ دیتابیس" : "+ Database" },
              { cat: "CACHE", label: lang === "fa" ? "+ کش ردیس" : "+ Cache" },
            ] as { cat: NodeCategory; label: string }[]
          ).map((item) => (
            <button
              key={item.cat}
              onClick={() => addNode(item.cat)}
              className="btn-nexus px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={startConnecting}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold ${
              connectingFromId ? "btn-nexus-emerald" : "btn-nexus"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>
              {connectingFromId
                ? lang === "fa"
                  ? "روی نود مقصد کلیک کن..."
                  : "Click Target Node..."
                : lang === "fa"
                ? "اتصال کابل شبکه"
                : "Connect Nodes"}
            </span>
          </button>

          <button
            onClick={deleteSelectedNode}
            className="btn-nexus-danger p-1.5 rounded-xl"
            title="Delete Selected Node"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 bg-[#02040A] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setZoom(zoom - 0.1)}
              className="btn-nexus p-1 rounded-lg"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] text-cyan-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(zoom + 0.1)}
              className="btn-nexus p-1 rounded-lg"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* بوم اصلی طراحی معماری (قابل اسکرول و جابه‌جایی نودها در موبایل و دسکتاپ) */}
      <div
        dir="ltr"
        className="relative w-full h-[430px] sm:h-[470px] rounded-2xl canvas-dots border border-white/15 overflow-auto select-none"
      >
        <div
          ref={boardRef}
          style={{
            width: "860px",
            height: "440px",
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
          className="relative"
          onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
          onMouseUp={() => setDraggingId(null)}
          onMouseLeave={() => setDraggingId(null)}
          onTouchMove={(e) => {
            if (e.touches.length > 0) {
              handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchEnd={() => setDraggingId(null)}
        >
          {/* لایه برداری کابل‌های ارتباطی و بسته‌های داده زنده */}
          <svg
            width="860"
            height="440"
            viewBox="0 0 860 440"
            className="absolute inset-0 pointer-events-none"
          >
            {edges.map((edge) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + NODE_W / 2;
              const y1 = fromNode.y + NODE_H / 2;
              const x2 = toNode.x + NODE_W / 2;
              const y2 = toNode.y + NODE_H / 2;
              const cx1 = (x1 + x2) / 2;
              const pathD = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx1} ${y2}, ${x2} ${y2}`;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <g key={edge.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.18)"
                    strokeWidth="5"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isStressMode ? "#10B981" : "#00F0FF"}
                    strokeWidth="2.2"
                    className={isStressMode ? "cable-stress" : "cable-animated"}
                  />
                  <rect
                    x={midX - 34}
                    y={midY - 10}
                    width="68"
                    height="18"
                    rx="5"
                    fill="#050914"
                    stroke="rgba(56,189,248,0.4)"
                    strokeWidth="1"
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill="#67E8F9"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                  >
                    {edge.protocol}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* کارت‌های نود معماری (قابل Drag کردن) */}
          {nodes.map((node) => {
            const st = CATEGORY_STYLE[node.category];
            const Icon = st.icon;
            const isSelected = node.id === selectedNodeId;

            return (
              <div
                key={node.id}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${NODE_W}px`,
                }}
                onMouseDown={(e) =>
                  startDrag(e.clientX, e.clientY, node.id, node.x, node.y)
                }
                onTouchStart={(e) => {
                  if (e.touches.length > 0) {
                    startDrag(
                      e.touches[0].clientX,
                      e.touches[0].clientY,
                      node.id,
                      node.x,
                      node.y
                    );
                  }
                }}
                className={`absolute rounded-2xl bg-[#070C18]/95 border-2 p-3 cursor-grab active:cursor-grabbing transition-shadow ${
                  isSelected
                    ? `${st.border} ${st.glow} ring-2 ring-cyan-400/50`
                    : "border-white/15 hover:border-white/35"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${st.badge}`}
                  >
                    {node.category}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {node.latencyMs}ms
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="p-1.5 rounded-lg bg-white/5">
                    <Icon
                      className="w-4 h-4"
                      style={{ color: st.colorHex }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {node.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {node.subtitle}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-300">
                  <span>{(node.throughputRps / 1000).toFixed(1)}k req/s</span>
                  <span className="text-cyan-300">{node.replicas} Pods</span>
                </div>
              </div>
            );
          })}

          {/* نشانگر ماوس همکاران زنده (Multiplayer Cursors) */}
          {showTeamCursors && (
            <>
              <div
                style={{ left: "275px", top: "62px" }}
                className="pointer-events-none absolute flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-mono text-[10px] font-bold shadow-lg animate-bounce"
              >
                <span>▲ Sarah • SRE Lead</span>
              </div>
              <div
                style={{ left: "545px", top: "225px" }}
                className="pointer-events-none absolute flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/90 text-white font-mono text-[10px] font-bold shadow-lg animate-pulse"
              >
                <span>▲ AI Copilot • Optimizing</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        dir={lang === "fa" ? "rtl" : "ltr"}
        className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono"
      >
        <span>
          {lang === "fa"
            ? "💡 راهنما: هر نود را با ماوس یا لمس انگشت روی بوم جابه‌جا کن یا از ستون کناری پارامترهایش را تغییر بده."
            : "💡 Tip: Drag any node on the canvas or inspect its live telemetry on the right panel."}
        </span>
        <span className="text-cyan-400">CRDT Multiplayer Sync: 0.2ms</span>
      </div>
    </div>
  );
}