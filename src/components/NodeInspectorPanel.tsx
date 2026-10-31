"use client";

import React from "react";
import { useNexusStore } from "../store/useNexusStore";
import SmartAssetImage from "./SmartAssetImage";
import { analyzeTopology } from "../lib/topology";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ShieldAlert,
  Sliders,
  Terminal,
} from "lucide-react";

export default function NodeInspectorPanel() {
  const {
    lang,
    nodes,
    edges,
    selectedNodeId,
    telemetryLogs,
    updateSelectedNode,
  } = useNexusStore();

  const selected = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  if (!selected) return null;

  const analysis = analyzeTopology(nodes, edges);
  const {
    spofNodes,
    isolatedNodes,
    unreachableNodes,
    uncachedDbBottlenecks,
    invalidEdges,
    hasCycle,
  } = analysis;
  const totalCriticalPathMs =
    analysis.criticalPathMs === null
      ? "Cycle detected"
      : analysis.criticalPathMs.toFixed(1);

  const issueCount =
    spofNodes.length +
    isolatedNodes.length +
    unreachableNodes.length +
    uncachedDbBottlenecks.length +
    invalidEdges.length +
    (hasCycle ? 1 : 0);
  const resilienceScore = Math.max(0, 100 - issueCount * 12);

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="space-y-4 flex flex-col justify-between h-full min-w-0"
    >
      <div className="nexus-card rounded-2xl border border-cyan-400/35 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white">
              {lang === "fa"
                ? "تحلیلگر گراف وابستگی و تشخیص SPOF"
                : "Dependency Graph & SPOF Validator"}
            </h3>
          </div>
          <span
            className={`font-mono text-xs font-black px-2 py-0.5 rounded ${
              resilienceScore >= 85
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-amber-500/20 text-amber-300"
            }`}
          >
            Heuristic Score: {resilienceScore}/100
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 bg-[#02040A] px-3 py-1.5 rounded-xl border border-white/10">
          <span>Modeled Critical Path:</span>
          <span className="text-cyan-300 font-bold">
            {analysis.criticalPathMs === null ? totalCriticalPathMs : `${totalCriticalPathMs} ms`}
          </span>
        </div>

        {issueCount === 0 ? (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {lang === "fa"
                ? "در بررسی فعلی، خطای ساختاری شناسایی نشد."
                : "No structural issues detected by the current local checks."}
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {spofNodes.map((n) => (
              <div
                key={`spof-${n.id}`}
                className="p-2 rounded-xl bg-rose-500/15 border border-rose-400/40 text-[11px] text-rose-200 flex items-center gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>
                  {lang === "fa"
                    ? `ریسک دسترس‌پذیری/ظرفیت در «${n.title}»: تعداد پاد (${n.replicas}x) یا بار CPU (${n.cpuLoad}%)!`
                    : `Availability / Capacity Risk on '${n.title}': Replicas (${n.replicas}x) or CPU (${n.cpuLoad}%)!`}
                </span>
              </div>
            ))}
            {uncachedDbBottlenecks.map((n) => (
              <div
                key={`db-${n.id}`}
                className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-[11px] text-amber-200 flex items-center gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {lang === "fa"
                    ? `گلوگاه دیتابیس در «${n.title}»: بار بالا بدون اتصال مستقیم به یک لایه کش!`
                    : `DB Cache-Path Warning on '${n.title}': High load without a directly connected cache!`}
                </span>
              </div>
            ))}
            {unreachableNodes.map((n) => (
              <div key={`unreachable-${n.id}`} className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-[11px] text-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {lang === "fa"
                    ? `نود «${n.title}» از ورودی‌های گراف قابل دسترسی نیست.`
                    : `Node '${n.title}' is not reachable from a gateway/root node.`}
                </span>
              </div>
            ))}
            {invalidEdges.map((edge) => (
              <div key={`invalid-${edge.id}`} className="p-2 rounded-xl bg-rose-500/15 border border-rose-400/40 text-[11px] text-rose-200">
                {lang === "fa" ? `اتصال ${edge.id} به نودی اشاره می‌کند که وجود ندارد.` : `Edge ${edge.id} references a missing node.`}
              </div>
            ))}
            {hasCycle && (
              <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-400/40 text-[11px] text-rose-200">
                {lang === "fa" ? "چرخه در وابستگی‌ها وجود دارد؛ مسیر بحرانی DAG قابل محاسبه نیست." : "Dependency cycle detected; a DAG critical path cannot be computed."}
              </div>
            )}
            {isolatedNodes.map((n) => (
              <div
                key={`iso-${n.id}`}
                className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-[11px] text-amber-200 flex items-center gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {lang === "fa"
                    ? `نود ایزوله «${n.title}»: به هیچ سرویس دیگری در گراف متصل نیست!`
                    : `Orphaned Node '${n.title}': No active network edges connected!`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="nexus-card rounded-2xl border border-white/15 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white">
              {lang === "fa"
                ? "بازرس زنده نود (Node Inspector)"
                : "Live Node Inspector"}
            </h3>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 max-w-[42vw] sm:max-w-[180px] truncate">
            {selected.dockerImage}
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              {lang === "fa" ? "نام سرویس / نود:" : "Service Name:"}
            </label>
            <input
              type="text"
              value={selected.title}
              onChange={(e) => updateSelectedNode({ title: e.target.value })}
              className="w-full rounded-xl bg-[#02040A] border border-cyan-500/30 px-3 py-1.5 font-mono text-xs text-white focus:outline-none"
            />
          </div>

          <div className="pt-1">
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>
                {lang === "fa"
                  ? "تعداد پادها (روی 1x بگذار تا خطای SPOF را ببینی):"
                  : "Replicas (Set 1x to trigger SPOF warning):"}
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {selected.replicas} Pods
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
              {[1, 2, 4, 6, 12].map((rep) => (
                <button
                  key={rep}
                  onClick={() => updateSelectedNode({ replicas: rep })}
                  className={`py-1.5 rounded-lg font-bold ${
                    selected.replicas === rep ? "btn-nexus-active" : "btn-nexus"
                  }`}
                >
                  {rep}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="nexus-card rounded-2xl border border-white/15 p-4 space-y-2.5">
        <div className="hologram-box">
          <SmartAssetImage
            baseName="nexus-core"
            alt="Nexus Spatial Core"
            className="hologram-blend"
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <Cpu className="w-10 h-10 text-cyan-400 animate-pulse" />
              </div>
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-transparent to-[#040711]/50 pointer-events-none" />
          <div className="absolute bottom-2 right-3 left-3 flex items-center justify-between z-10">
            <span className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Terminal className="w-4 h-4 text-cyan-400" />
              {lang === "fa" ? "تلمتری توپولوژی" : "Topology Telemetry"}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/40">
              LOCAL GRAPH ANALYSIS
            </span>
          </div>
        </div>

        <div
          dir="ltr"
          className="space-y-1 font-mono text-[10px] bg-[#02040A] p-2.5 rounded-xl border border-white/10 max-h-[100px] overflow-y-auto"
        >
          {telemetryLogs.map((log, idx) => (
            <div key={idx} className="text-cyan-300/90 leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}