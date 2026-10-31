"use client";

import React from "react";
import { useNexusStore, TemplateId } from "../store/useNexusStore";
import SmartAssetImage from "./SmartAssetImage";
import {
  Code2,
  Cpu,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";

export default function TopBar() {
  const {
    lang,
    activeTemplate,
    nodes,
    isStressMode,
    showTeamCursors,
    toggleLang,
    loadTemplate,
    toggleStressMode,
    toggleTeamCursors,
    setExportModalOpen,
  } = useNexusStore();

  const totalRps = nodes.reduce((acc, n) => acc + n.throughputRps, 0);
  const avgLatency = (
    nodes.reduce((acc, n) => acc + n.latencyMs, 0) / Math.max(1, nodes.length)
  ).toFixed(1);

  const TEMPLATES: { id: TemplateId; fa: string; en: string }[] = [
    { id: "AI_RAG", fa: "معماری هوش مصنوعی (AI RAG)", en: "AI RAG Cluster" },
    { id: "FINTECH_HFT", fa: "هسته صرافی فرکانس بالا", en: "FinTech HFT Core" },
    { id: "K8S_MESH", fa: "کلاستر میکروسرویس K8s", en: "Kubernetes Mesh" },
  ];

  return (
    <div dir={lang === "fa" ? "rtl" : "ltr"} className="z-40">
      {/* نوار وضعیت بالای سیستم */}
      <div className="bg-[#010206] border-b border-white/10 px-3 lg:px-8 py-1.5 text-[11px] font-mono">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 font-bold">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              NEXUS SPATIAL STUDIO • LOCAL ANALYZER
            </span>
            <span className="text-slate-400">
              Modeled throughput:{" "}
              <b className="text-emerald-400">
                {totalRps.toLocaleString("en-US")} req/s
              </b>
            </span>
            <span className="text-slate-400">
              Modeled avg latency: <b className="text-cyan-300">{avgLatency} ms</b>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://pooya16pg-spec.github.io/pooya-os/"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Project #1: Pooya.OS</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-white/20">|</span>
            <a
              href="https://pooya16pg-spec.github.io/aurapulse/"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Project #2: AuraPulse</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* هدر اصلی */}
      <header className="border-b border-white/15 bg-[#050814]/90 backdrop-blur-2xl px-3 lg:px-8 py-3">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500/25 via-indigo-500/20 to-emerald-500/20 border border-cyan-400/50">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span className="font-mono font-black tracking-wider text-white text-base">
                NexusCanvas
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-200 border border-cyan-400/40 font-bold">
                ARCH v4.0
              </span>
            </div>

            <div className="btn-nexus flex items-center gap-2.5 px-3 py-1.5 rounded-2xl text-xs">
              <div
                style={{ width: 40, height: 40, minWidth: 40, maxWidth: 40 }}
                className="rounded-xl overflow-hidden border-2 border-cyan-400/80 bg-slate-900 shrink-0 flex items-center justify-center"
              >
                <SmartAssetImage
                  baseName="pooya-architect"
                  alt="Pooya Goodarzi"
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "cover",
                    objectPosition: "top center",
                  }}
                  fallback={
                    <span className="font-mono font-black text-xs text-cyan-300">
                      PG
                    </span>
                  }
                />
              </div>
              <div className="text-start">
                <div className="font-bold text-white leading-tight">
                  {lang === "fa" ? "پویا گودرزی" : "Pooya Goodarzi"}
                </div>
                <div className="text-[10px] text-cyan-300 font-mono">
                  {lang === "fa"
                    ? "مهندسی کامپیوتر • سازندهٔ محصول"
                    : "Computer Engineering • Product Builder"}
                </div>
              </div>
            </div>
          </div>

          {/* انتخابگر قالب‌های معماری */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#02040A] p-1.5 rounded-2xl border border-white/10">
            <Layers className="w-4 h-4 text-cyan-400 mx-1.5 hidden sm:inline" />
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => loadTemplate(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTemplate === t.id ? "btn-nexus-active" : "btn-nexus"
                }`}
              >
                {lang === "fa" ? t.fa : t.en}
              </button>
            ))}
          </div>

          {/* ابزارهای شبیه‌ساز و خروجی کد */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleStressMode}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold ${
                isStressMode ? "btn-nexus-emerald" : "btn-nexus"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isStressMode
                  ? lang === "fa"
                    ? "تست بار: فعال (2.2x)"
                    : "Stress Load: ON (2.2x)"
                  : lang === "fa"
                  ? "شبیه‌سازی ترافیک سنگین"
                  : "Simulate Traffic Spike"}
              </span>
            </button>

            <button
              onClick={toggleTeamCursors}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold ${
                showTeamCursors ? "btn-nexus-active" : "btn-nexus"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {lang === "fa" ? "نشانگر نمایشی" : "Demo Cursor"}
              </span>
            </button>

            <button
              onClick={() => setExportModalOpen(true)}
              className="btn-nexus-emerald flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold"
            >
              <Code2 className="w-4 h-4" />
              <span>
                {lang === "fa" ? "خروجی Docker / JSON" : "Export Docker / JSON"}
              </span>
            </button>

            <button
              onClick={toggleLang}
              className="btn-nexus flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono font-bold"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-300" />
              <span>{lang === "fa" ? "EN" : "FA"}</span>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}