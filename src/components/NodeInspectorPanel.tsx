"use client";

import React from "react";
import { useNexusStore } from "../store/useNexusStore";
import SmartAssetImage from "./SmartAssetImage";
import { Cpu, Sliders, Terminal } from "lucide-react";

export default function NodeInspectorPanel() {
  const {
    lang,
    nodes,
    selectedNodeId,
    telemetryLogs,
    updateSelectedNode,
  } = useNexusStore();

  const selected =
    nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  if (!selected) return null;

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="space-y-4 flex flex-col justify-between h-full min-w-0"
    >
      {/* پنل بازرسی و ویرایش زنده نود انتخابی */}
      <div className="nexus-card rounded-2xl border border-white/15 p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white">
              {lang === "fa"
                ? "بازرس زنده نود و تنظیمات کلاستر (Node Inspector)"
                : "Live Node Telemetry & Scaling"}
            </h3>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            {selected.category}
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
              className="w-full rounded-xl bg-[#02040A] border border-cyan-500/30 px-3 py-2 font-mono text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              {lang === "fa" ? "پشته فناوری (Tech Stack):" : "Runtime Stack:"}
            </label>
            <input
              type="text"
              value={selected.techStack}
              onChange={(e) => updateSelectedNode({ techStack: e.target.value })}
              className="w-full rounded-xl bg-[#02040A] border border-white/15 px-3 py-1.5 font-mono text-xs text-cyan-300 focus:outline-none"
            />
          </div>

          <div className="pt-1">
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>
                {lang === "fa"
                  ? "تعداد پادهای کوبرنتیز (Replicas):"
                  : "Active K8s Replicas:"}
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {selected.replicas} Pods
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
              {[2, 4, 8, 16].map((rep) => (
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

          <div className="p-3 rounded-xl bg-[#02040A] border border-white/10 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Throughput:</span>
              <span className="text-emerald-400 font-bold">
                {selected.throughputRps.toLocaleString("en-US")} req/s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">P99 Latency:</span>
              <span className="text-cyan-300 font-bold">
                {selected.latencyMs} ms
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">CPU Load:</span>
                <span className="text-purple-300 font-bold">
                  {selected.cpuLoad}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
                  style={{ width: `${selected.cpuLoad}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* کارت هولوگرافیک هسته شبکه و لاگ تلمتری */}
      <div className="nexus-card rounded-2xl border border-white/15 p-4 space-y-3">
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
              {lang === "fa"
                ? "تلمتری زنده کلاستر"
                : "Live Mesh Telemetry"}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/40">
              ZERO-DOWNTIME
            </span>
          </div>
        </div>

        <div
          dir="ltr"
          className="space-y-1.5 font-mono text-[10.5px] bg-[#02040A] p-3 rounded-xl border border-white/10 max-h-[125px] overflow-y-auto"
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