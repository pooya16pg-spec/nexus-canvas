"use client";

import React, { useRef, useState } from "react";
import { useNexusStore } from "../store/useNexusStore";
import { Check, Copy, X, Code2, Download, Upload, FileJson } from "lucide-react";

export default function ExportCodeModal() {
  const { lang, nodes, edges, isExportModalOpen, setExportModalOpen, importTopologySnapshot } =
    useNexusStore();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [importError, setImportError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isExportModalOpen) return null;

  // Export names follow the editable node title; IDs remain the stable graph references.
  const serviceNames = new Map<string, string>();
  nodes.forEach((node, index) => {
    const slug = (value: string) =>
      value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const serviceName =
      slug(node.title) || slug(node.id) || `service-${index + 1}`;
    serviceNames.set(node.id, serviceName);
  });
  const serviceKeys = Array.from(serviceNames.values());
  const hasDuplicateServiceNames =
    new Set(serviceKeys).size !== serviceKeys.length ||
    serviceKeys.some((name) => !name);
  const knownIds = new Set(nodes.map((node) => node.id));
  const invalidEdges = edges.filter(
    (edge) => !knownIds.has(edge.from) || !knownIds.has(edge.to)
  );

  const dependencyMap = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!knownIds.has(edge.from) || !knownIds.has(edge.to)) return;
    const deps = dependencyMap.get(edge.from) || [];
    if (!deps.includes(edge.to)) deps.push(edge.to);
    dependencyMap.set(edge.from, deps);
  });

  const indegree = new Map<string, number>();
  const outgoing = new Map<string, string[]>();
  nodes.forEach((node) => {
    indegree.set(node.id, 0);
    outgoing.set(node.id, []);
  });
  dependencyMap.forEach((deps, from) => {
    deps.forEach((to) => {
      outgoing.get(from)?.push(to);
      indegree.set(to, (indegree.get(to) || 0) + 1);
    });
  });
  const queue = nodes.filter((node) => indegree.get(node.id) === 0).map((node) => node.id);
  let visited = 0;
  while (queue.length) {
    const id = queue.shift() as string;
    visited += 1;
    (outgoing.get(id) || []).forEach((to) => {
      const next = (indegree.get(to) || 0) - 1;
      indegree.set(to, next);
      if (next === 0) queue.push(to);
    });
  }
  const hasDependencyCycle = visited !== nodes.length;
  const canExport =
    nodes.length > 0 &&
    !hasDuplicateServiceNames &&
    invalidEdges.length === 0 &&
    !hasDependencyCycle;

  // Compose scales replicas via --scale; omit fixed host ports and container_name
  // so multiple replicas can start without port/name collisions.
  const dockerComposeCode = [
    "# Generated locally by NexusCanvas. Service keys are derived from editable node names.",
    "# Review images and dependencies before deployment.",
    "services:",
    ...nodes.flatMap((node) => {
      const serviceName = serviceNames.get(node.id) as string;
      const deps = dependencyMap.get(node.id) || [];
      const depBlock =
        deps.length > 0
          ? `\n    depends_on:\n${deps.map((id) => `      - ${serviceNames.get(id)}`).join("\n")}`
          : "";
      return [
        `  ${serviceName}:`,
        `    image: "${node.dockerImage.replace(/"/g, '\\"')}"`,
        "    restart: unless-stopped",
        `    expose:\n      - "${node.port}"`,
        depBlock,
      ].filter(Boolean);
    }),
    "",
    "# For local Docker Compose, scale services with commands such as:",
    ...nodes.map((node) =>
      `# docker compose up -d --scale ${serviceNames.get(node.id)}=${Math.max(1, node.replicas)}`
    ),
    "# The graph's throughput and CPU figures are illustrative and are not translated into container limits.",
    "",
  ].join("\n");

  const graphSnapshotJson = JSON.stringify({
    schema: "nexus-canvas.graph",
    version: 1,
    exportedAt: new Date().toISOString(),
    nodes,
    edges,
  }, null, 2);

  const handleDownloadJson = () => {
    const blob = new Blob([graphSnapshotJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nexus-canvas-architecture.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(graphSnapshotJson);
      setCopiedJson(true);
      window.setTimeout(() => setCopiedJson(false), 2500);
    } catch {
      setCopyError(true);
    }
  };

  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!importTopologySnapshot(parsed)) throw new Error("Invalid graph snapshot");
      setImportError(false);
      setCopyError(false);
    } catch {
      setImportError(true);
    } finally {
      input.value = "";
    }
  };
  const handleCopy = async () => {
    if (!canExport) return;
    try {
      await navigator.clipboard.writeText(dockerComposeCode);
      setCopyError(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div
        dir={lang === "fa" ? "rtl" : "ltr"}
        className="w-full max-w-2xl nexus-card rounded-2xl border border-cyan-400/40 p-5 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              {lang === "fa"
                ? "قالب شروع Docker Compose بر اساس گراف"
                : "Docker Compose Starter Template"}
            </h3>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="btn-nexus p-1.5 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImportJson} className="hidden" />
        {importError && (
          <p role="alert" className="text-xs text-rose-300">
            {lang === "fa" ? "فایل JSON معتبر نیست یا به ساختار گراف NexusCanvas تعلق ندارد." : "Invalid JSON snapshot or unsupported graph schema."}
          </p>
        )}
        {copyError && (
          <p role="alert" className="text-xs text-rose-300">
            {lang === "fa" ? "کپی خودکار ناموفق بود؛ مجوز Clipboard مرورگر را بررسی کنید." : "Clipboard access failed. Check browser clipboard permission."}
          </p>
        )}

        {!canExport && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-400/40 text-xs text-rose-200">
            {lang === "fa"
              ? "خروجی قابل اتکا نیست: چرخه، اتصال نامعتبر یا نام سرویس تکراری را اصلاح کنید."
              : "Export is blocked: fix dependency cycles, dangling edges, or duplicate service names first."}
          </div>
        )}
        <pre
          dir="ltr"
          className="p-4 rounded-xl bg-[#02040A] border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[340px]"
        >
          {dockerComposeCode}
        </pre>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-nexus px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>{lang === "fa" ? "درون‌ریزی JSON" : "Import JSON"}</span>
            </button>
            <button type="button" onClick={handleDownloadJson} className="btn-nexus px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>{lang === "fa" ? "دانلود Snapshot" : "Download JSON"}</span>
            </button>
            <button type="button" onClick={handleCopyJson} className="btn-nexus px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <FileJson className="w-3.5 h-3.5" />
              <span>{copiedJson ? "Copied JSON!" : lang === "fa" ? "کپی JSON" : "Copy JSON"}</span>
            </button>
          </div>
          <button onClick={handleCopy} disabled={!canExport} className="btn-nexus-emerald px-4 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5">
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy docker-compose.yml</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}