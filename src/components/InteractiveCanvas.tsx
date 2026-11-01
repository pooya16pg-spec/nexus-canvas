"use client";

import React, { useEffect, useRef, useState } from "react";
import { useNexusStore, NodeCategory } from "../store/useNexusStore";
import {
  Cpu,
  Database,
  Globe,
  HardDrive,
  LayoutList,
  Link2,
  Map,
  Plus,
  Server,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const CATEGORY_STYLE: Record<
  NodeCategory,
  {
    badge: string;
    border: string;
    glow: string;
    colorHex: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  }
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
    updateSelectedNode,
    addNode,
    deleteSelectedNode,
    startConnecting,
    setZoom,
  } = useNexusStore();

  const boardRef = useRef<HTMLDivElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // حالت نمایشی مخصوص موبایل (حل کامل نقد Grok درباره سخت بودن کار با بوم در موبایل)
  const [viewMode, setViewMode] = useState<"CANVAS" | "MOBILE_DECK">("CANVAS");
  const [botTick, setBotTick] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const syncView = () => setViewMode(media.matches ? "MOBILE_DECK" : "CANVAS");
    syncView();
    if (media.addEventListener) media.addEventListener("change", syncView);
    else media.addListener(syncView);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", syncView);
      else media.removeListener(syncView);
    };
  }, []);

  useEffect(() => {
    if (!showTeamCursors || viewMode !== "CANVAS") return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (document.hidden || timer) return;
      timer = setInterval(
        () => setBotTick((prev) => (prev + 1) % Math.max(1, nodes.length)),
        2600
      );
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };
    start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [showTeamCursors, nodes.length, viewMode]);

  const NODE_W = 210;
  const NODE_H = 108;

  // اصلاح دقیق فرمول ریاضی Drag در حالت Zoom (رفع باگ گزارش‌شده توسط ChatGPT)
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
    const pointerCanvasX = (clientX - rect.left) / zoom;
    const pointerCanvasY = (clientY - rect.top) / zoom;
    setDraggingId(id);
    setDragOffset({
      x: pointerCanvasX - nodeX,
      y: pointerCanvasY - nodeY,
    });
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!draggingId || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const pointerCanvasX = (clientX - rect.left) / zoom;
    const pointerCanvasY = (clientY - rect.top) / zoom;
    const nextX = pointerCanvasX - dragOffset.x;
    const nextY = pointerCanvasY - dragOffset.y;
    moveNode(draggingId, nextX, nextY);
  };

  const targetBotNode = nodes[botTick] || nodes[0];

  return (
    <div className="nexus-card rounded-2xl border border-white/15 p-3.5 md:p-4 flex flex-col justify-between space-y-3 h-full min-w-0">
      {/* نوار ابزار بالا + سوییچر نمای بوم ۲بعدی و نمای رک موبایل */}
      <div
        dir={lang === "fa" ? "rtl" : "ltr"}
        className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {/* دکمه تغییر حالت بین بوم گرافیکی و لیست کارت‌های موبایل */}
          <div className="flex items-center gap-1 bg-[#02040A] p-1 rounded-xl border border-cyan-500/30 text-xs font-mono">
            <button
              onClick={() => setViewMode("CANVAS")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold ${
                viewMode === "CANVAS" ? "btn-nexus-active" : "btn-nexus"
              }`}
            >
              <span>{lang === "fa" ? "بوم ۲بعدی" : "2D Canvas"}</span>
            </button>
            <button
              onClick={() => setViewMode("MOBILE_DECK")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold ${
                viewMode === "MOBILE_DECK" ? "btn-nexus-active" : "btn-nexus"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>{lang === "fa" ? "نمای رک موبایل" : "Mobile Rack"}</span>
            </button>
          </div>

          {(
            [
              { cat: "GATEWAY", label: lang === "fa" ? "+ درگاه" : "+ Gateway" },
              { cat: "SERVICE", label: lang === "fa" ? "+ سرویس" : "+ Service" },
              { cat: "AI", label: lang === "fa" ? "+ نود AI" : "+ AI Node" },
              { cat: "DATABASE", label: lang === "fa" ? "+ دیتابیس" : "+ DB" },
              { cat: "CACHE", label: lang === "fa" ? "+ کش" : "+ Cache" },
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
                  ? "انتخاب نود مقصد..."
                  : "Tap Target Node..."
                : lang === "fa"
                ? "اتصال کابل"
                : "Connect"}
            </span>
          </button>

          <button
            onClick={deleteSelectedNode}
            className="btn-nexus-danger p-1.5 rounded-xl"
            title="Delete Selected Node"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {viewMode === "CANVAS" && (
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
          )}
        </div>
      </div>

      {/* حالت اول: نمای رک تعاملی مخصوص موبایل اندروید (بدون نیاز به اسکرول افقی یا درگ سخت) */}
      {viewMode === "MOBILE_DECK" ? (
        <div
          dir={lang === "fa" ? "rtl" : "ltr"}
          className="space-y-3 pr-1"
        >
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-xs text-cyan-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>
              {lang === "fa"
                ? "📱 نمای رک تعاملی موبایل: روی هر نود بزن تا انتخاب، متصل یا مقیاس‌دهی (Scale) شود."
                : "📱 Interactive Mobile Rack: Tap any node to inspect, connect cables, or scale K8s replicas."}
            </span>
            <button
              onClick={() => setViewMode("CANVAS")}
              className="btn-nexus px-2.5 py-1 rounded-lg text-[11px] font-mono shrink-0"
            >
              {lang === "fa" ? "نمای گراف ۲بعدی" : "2D Graph"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nodes.map((node) => {
              const st = CATEGORY_STYLE[node.category];
              const Icon = st.icon;
              const isSelected = node.id === selectedNodeId;
              const connectedEdges = edges.filter(
                (e) => e.from === node.id || e.to === node.id
              );

              return (
                <div
                  key={node.id}
                  role="group"
                  aria-label={node.title}
                  className={`w-full min-w-0 text-start rounded-2xl bg-[#070C18]/95 border-2 p-3.5 transition-all ${
                    isSelected
                      ? `${st.border} ${st.glow}`
                      : "border-white/15 hover:border-white/35"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${st.badge}`}
                    >
                      {node.category} • {node.techStack}
                    </span>
                    <span className="font-mono text-xs text-emerald-400 font-bold">
                      {node.latencyMs}ms
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => selectNode(node.id)}
                      aria-pressed={isSelected}
                      className="w-full min-h-11 flex items-center gap-2.5 rounded-xl text-start bg-transparent border-0 hover:bg-white/5 px-1"
                    >
                      <div className="p-2 rounded-xl bg-white/5 shrink-0">
                        <Icon className="w-5 h-5" style={{ color: st.colorHex }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{node.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{node.subtitle}</div>
                      </div>
                    </button>
                  </div>

                  {/* دکمه‌های تغییر سریع تعداد پادها روی موبایل */}
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-slate-300">
                      {(node.throughputRps / 1000).toFixed(1)}k req/s
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 mr-1">
                        Pods:
                      </span>
                      {[1, 3, 6].map((rep) => (
                        <button
                          key={rep}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectNode(node.id);
                            updateSelectedNode({ replicas: rep });
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            node.replicas === rep
                              ? "btn-nexus-active"
                              : "btn-nexus"
                          }`}
                        >
                          {rep}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {connectedEdges.map((ce) => {
                      const peerId = ce.from === node.id ? ce.to : ce.from;
                      const peer = nodes.find((n) => n.id === peerId);
                      return (
                        <span
                          key={ce.id}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-cyan-300"
                        >
                          ⇄ {peer?.title.split(" ")[0]} ({ce.protocol})
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* حالت دوم: بوم گرافیکی ۲بعدی با زوم اصلاح‌شده */
        <div
          dir="ltr"
          className="relative w-full h-[430px] sm:h-[470px] rounded-2xl canvas-dots border border-white/15 overflow-auto overscroll-contain select-none"
        >
          <div
            ref={boardRef}
            style={{
              width: "840px",
              height: "430px",
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              touchAction: "pan-x pan-y",
            }}
            className="relative"
            onPointerMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onPointerUp={() => setDraggingId(null)}
            onPointerCancel={() => setDraggingId(null)}
          >
            <svg
              width="840"
              height="430"
              viewBox="0 0 840 430"
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
                      className={
                        isStressMode ? "cable-stress" : "cable-animated"
                      }
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
                  data-canvas-node="true"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    startDrag(e.clientX, e.clientY, node.id, node.x, node.y);
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
                    <span
                      className={
                        node.replicas < 2
                          ? "text-rose-400 font-bold"
                          : "text-cyan-300"
                      }
                    >
                      {node.replicas} Pods
                    </span>
                  </div>
                </div>
              );
            })}

            {showTeamCursors && targetBotNode && (
              <div
                style={{
                  left: `${targetBotNode.x + 25}px`,
                  top: `${Math.max(10, targetBotNode.y - 26)}px`,
                  transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className="pointer-events-none absolute flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-mono text-[10px] font-bold shadow-lg"
              >
                <span>▲ Auto-Auditor Bot • Inspecting {targetBotNode.title.split(" ")[0]}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        dir={lang === "fa" ? "rtl" : "ltr"}
        className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono"
      >
        <span>
          {lang === "fa"
            ? "💡 همگام‌سازی چندتب (BroadcastChannel) فعال است: اگر سایت را در ۲ تب باز کنی، جابه‌جایی نودها زنده سینک می‌شود."
            : "💡 Multi-Tab BroadcastChannel Active: Open 2 tabs to see real-time cross-tab topology sync."}
        </span>
        <span className="text-cyan-400">BroadcastChannel Sync: ACTIVE</span>
      </div>
    </div>
  );
}