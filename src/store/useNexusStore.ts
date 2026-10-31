"use client";

import { useState, useEffect } from "react";

export type Lang = "fa" | "en";
export type NodeCategory = "GATEWAY" | "SERVICE" | "AI" | "DATABASE" | "CACHE";
export type TemplateId = "AI_RAG" | "FINTECH_HFT" | "K8S_MESH";

export interface ArchNode {
  id: string;
  title: string;
  subtitle: string;
  category: NodeCategory;
  x: number;
  y: number;
  latencyMs: number;
  throughputRps: number;
  cpuLoad: number;
  replicas: number;
  techStack: string;
}

export interface ArchEdge {
  id: string;
  from: string;
  to: string;
  protocol: string;
}

interface NexusState {
  lang: Lang;
  activeTemplate: TemplateId;
  nodes: ArchNode[];
  edges: ArchEdge[];
  selectedNodeId: string;
  connectingFromId: string | null;
  isStressMode: boolean;
  showTeamCursors: boolean;
  isExportModalOpen: boolean;
  zoom: number;
  telemetryLogs: string[];
}

const TEMPLATES: Record<TemplateId, { nodes: ArchNode[]; edges: ArchEdge[] }> = {
  AI_RAG: {
    nodes: [
      {
        id: "n-edge",
        title: "Cloudflare Edge Gateway",
        subtitle: "Zero-Trust WAF & Rate Limiter",
        category: "GATEWAY",
        x: 70,
        y: 170,
        latencyMs: 1.8,
        throughputRps: 14200,
        cpuLoad: 28,
        replicas: 6,
        techStack: "Rust / Envoy Proxy",
      },
      {
        id: "n-orchestrator",
        title: "Neural Agent Router",
        subtitle: "Semantic Intent Classifier",
        category: "SERVICE",
        x: 330,
        y: 85,
        latencyMs: 6.4,
        throughputRps: 9800,
        cpuLoad: 44,
        replicas: 8,
        techStack: "Go / gRPC Mesh",
      },
      {
        id: "n-redis",
        title: "Redis Semantic Cache",
        subtitle: "Sub-ms Vector Hit Layer",
        category: "CACHE",
        x: 330,
        y: 265,
        latencyMs: 0.4,
        throughputRps: 45000,
        cpuLoad: 19,
        replicas: 4,
        techStack: "Redis Cluster 7.2",
      },
      {
        id: "n-llm",
        title: "TensorRT LLM Cluster",
        subtitle: "FP8 Quantized Inference",
        category: "AI",
        x: 600,
        y: 95,
        latencyMs: 24.5,
        throughputRps: 3400,
        cpuLoad: 76,
        replicas: 12,
        techStack: "CUDA / vLLM Engine",
      },
      {
        id: "n-qdrant",
        title: "Qdrant Vector Engine",
        subtitle: "HNSW 1536-Dim Index",
        category: "DATABASE",
        x: 600,
        y: 265,
        latencyMs: 3.2,
        throughputRps: 18500,
        cpuLoad: 38,
        replicas: 5,
        techStack: "Rust / SIMD HNSW",
      },
    ],
    edges: [
      { id: "e1", from: "n-edge", to: "n-orchestrator", protocol: "HTTP/3" },
      { id: "e2", from: "n-edge", to: "n-redis", protocol: "RESP3" },
      { id: "e3", from: "n-orchestrator", to: "n-llm", protocol: "gRPC-Stream" },
      { id: "e4", from: "n-orchestrator", to: "n-qdrant", protocol: "gRPC" },
      { id: "e5", from: "n-qdrant", to: "n-llm", protocol: "Context-RAG" },
    ],
  },
  FINTECH_HFT: {
    nodes: [
      {
        id: "f-ws",
        title: "FIX / WebSocket Ingest",
        subtitle: "L2 Market Tick Streamer",
        category: "GATEWAY",
        x: 70,
        y: 175,
        latencyMs: 0.3,
        throughputRps: 88000,
        cpuLoad: 35,
        replicas: 10,
        techStack: "C++20 / DPDK",
      },
      {
        id: "f-matcher",
        title: "Matching Engine Core",
        subtitle: "Lock-Free RingBuffer",
        category: "SERVICE",
        x: 340,
        y: 90,
        latencyMs: 0.2,
        throughputRps: 120000,
        cpuLoad: 52,
        replicas: 4,
        techStack: "Rust / LMAX Disruptor",
      },
      {
        id: "f-risk",
        title: "AI Margin Risk Guard",
        subtitle: "Real-Time VaR & Liquidation",
        category: "AI",
        x: 340,
        y: 265,
        latencyMs: 1.9,
        throughputRps: 42000,
        cpuLoad: 61,
        replicas: 6,
        techStack: "ONNX Runtime",
      },
      {
        id: "f-ledger",
        title: "Timescale Tick Ledger",
        subtitle: "Immutable Audit Cluster",
        category: "DATABASE",
        x: 610,
        y: 175,
        latencyMs: 2.1,
        throughputRps: 64000,
        cpuLoad: 41,
        replicas: 6,
        techStack: "PostgreSQL / NVMe",
      },
    ],
    edges: [
      { id: "fe1", from: "f-ws", to: "f-matcher", protocol: "ZeroCopy" },
      { id: "fe2", from: "f-ws", to: "f-risk", protocol: "UDP-Multicast" },
      { id: "fe3", from: "f-matcher", to: "f-ledger", protocol: "WAL-Sync" },
      { id: "fe4", from: "f-risk", to: "f-ledger", protocol: "gRPC" },
    ],
  },
  K8S_MESH: {
    nodes: [
      {
        id: "k-ing",
        title: "Istio Service Ingress",
        subtitle: "mTLS Termination & Canary",
        category: "GATEWAY",
        x: 75,
        y: 175,
        latencyMs: 1.4,
        throughputRps: 31000,
        cpuLoad: 29,
        replicas: 8,
        techStack: "Istio / Envoy",
      },
      {
        id: "k-auth",
        title: "OAuth2 / Passkey Guard",
        subtitle: "JWT & Session Validator",
        category: "CACHE",
        x: 340,
        y: 90,
        latencyMs: 0.9,
        throughputRps: 54000,
        cpuLoad: 24,
        replicas: 6,
        techStack: "Go / Redis",
      },
      {
        id: "k-api",
        title: "Core GraphQL Federation",
        subtitle: "Distributed Subgraph Mesh",
        category: "SERVICE",
        x: 340,
        y: 265,
        latencyMs: 4.8,
        throughputRps: 22500,
        cpuLoad: 49,
        replicas: 10,
        techStack: "Node.js / Apollo",
      },
      {
        id: "k-db",
        title: "CockroachDB Geo-Cluster",
        subtitle: "Multi-Region Raft Consensus",
        category: "DATABASE",
        x: 605,
        y: 175,
        latencyMs: 3.7,
        throughputRps: 29000,
        cpuLoad: 42,
        replicas: 9,
        techStack: "Distributed SQL",
      },
    ],
    edges: [
      { id: "ke1", from: "k-ing", to: "k-auth", protocol: "mTLS" },
      { id: "ke2", from: "k-ing", to: "k-api", protocol: "HTTP/2" },
      { id: "ke3", from: "k-auth", to: "k-api", protocol: "JWT-Token" },
      { id: "ke4", from: "k-api", to: "k-db", protocol: "PgWire" },
    ],
  },
};

let globalState: NexusState = {
  lang: "fa",
  activeTemplate: "AI_RAG",
  nodes: TEMPLATES.AI_RAG.nodes,
  edges: TEMPLATES.AI_RAG.edges,
  selectedNodeId: "n-orchestrator",
  connectingFromId: null,
  isStressMode: false,
  showTeamCursors: true,
  isExportModalOpen: false,
  zoom: 1,
  telemetryLogs: [
    "[MESH-OK] All 5 distributed nodes healthy • P99 Latency: 4.2ms",
    "[CRDT-SYNC] Real-time state synchronized across 3 active architects",
    "[AUTO-SCALE] Kubernetes HPA standing by at 75% CPU threshold",
  ],
};

const listeners = new Set<() => void>();

function setState(updater: (prev: NexusState) => Partial<NexusState>) {
  globalState = { ...globalState, ...updater(globalState) };
  listeners.forEach((l) => l());
}

const toggleLang = () =>
  setState((s) => ({ lang: s.lang === "fa" ? "en" : "fa" }));

const loadTemplate = (id: TemplateId) =>
  setState((s) => {
    const tpl = TEMPLATES[id];
    const now = new Date().toLocaleTimeString("en-US", { hour12: false });
    return {
      activeTemplate: id,
      nodes: tpl.nodes.map((n) => ({ ...n })),
      edges: tpl.edges.map((e) => ({ ...e })),
      selectedNodeId: tpl.nodes[0].id,
      connectingFromId: null,
      telemetryLogs: [
        `[${now}] BLUEPRINT :: Loaded '${id}' architecture topology (${tpl.nodes.length} nodes)`,
        ...s.telemetryLogs.slice(0, 10),
      ],
    };
  });

const selectNode = (id: string) =>
  setState((s) => {
    if (s.connectingFromId && s.connectingFromId !== id) {
      const exists = s.edges.some(
        (e) =>
          (e.from === s.connectingFromId && e.to === id) ||
          (e.from === id && e.to === s.connectingFromId)
      );
      if (!exists) {
        const newEdge: ArchEdge = {
          id: `e-${Date.now()}`,
          from: s.connectingFromId,
          to: id,
          protocol: "gRPC/TLS",
        };
        return {
          edges: [...s.edges, newEdge],
          connectingFromId: null,
          selectedNodeId: id,
        };
      }
      return { connectingFromId: null, selectedNodeId: id };
    }
    return { selectedNodeId: id };
  });

const moveNode = (id: string, x: number, y: number) =>
  setState((s) => ({
    nodes: s.nodes.map((n) =>
      n.id === id
        ? {
            ...n,
            x: Math.max(16, Math.min(660, Math.round(x))),
            y: Math.max(16, Math.min(320, Math.round(y))),
          }
        : n
    ),
  }));

const updateSelectedNode = (patch: Partial<ArchNode>) =>
  setState((s) => ({
    nodes: s.nodes.map((n) =>
      n.id === s.selectedNodeId ? { ...n, ...patch } : n
    ),
  }));

const addNode = (category: NodeCategory) =>
  setState((s) => {
    const id = `node-${Math.floor(100 + Math.random() * 900)}`;
    const titles: Record<NodeCategory, string> = {
      GATEWAY: "Edge API Gateway",
      SERVICE: "Go Microservice",
      AI: "LLM Inference Node",
      DATABASE: "Postgres Vector Shard",
      CACHE: "Redis Memory Node",
    };
    const newNode: ArchNode = {
      id,
      title: titles[category],
      subtitle: "Auto-Provisioned Cluster Node",
      category,
      x: 220 + Math.floor(Math.random() * 220),
      y: 110 + Math.floor(Math.random() * 140),
      latencyMs: 2.4,
      throughputRps: 12500,
      cpuLoad: 32,
      replicas: 4,
      techStack: "Docker / K8s Pod",
    };
    const nextEdges =
      s.selectedNodeId && s.nodes.some((n) => n.id === s.selectedNodeId)
        ? [
            ...s.edges,
            {
              id: `e-${Date.now()}`,
              from: s.selectedNodeId,
              to: id,
              protocol: "gRPC",
            },
          ]
        : s.edges;

    return {
      nodes: [...s.nodes, newNode],
      edges: nextEdges,
      selectedNodeId: id,
    };
  });

const deleteSelectedNode = () =>
  setState((s) => {
    if (s.nodes.length <= 2) return {};
    const remaining = s.nodes.filter((n) => n.id !== s.selectedNodeId);
    const remainingEdges = s.edges.filter(
      (e) => e.from !== s.selectedNodeId && e.to !== s.selectedNodeId
    );
    return {
      nodes: remaining,
      edges: remainingEdges,
      selectedNodeId: remaining[0]?.id || "",
    };
  });

const startConnecting = () =>
  setState((s) => ({
    connectingFromId: s.connectingFromId ? null : s.selectedNodeId,
  }));

const toggleStressMode = () =>
  setState((s) => {
    const next = !s.isStressMode;
    const now = new Date().toLocaleTimeString("en-US", { hour12: false });
    return {
      isStressMode: next,
      nodes: s.nodes.map((n) => ({
        ...n,
        throughputRps: next
          ? Math.round(n.throughputRps * 2.4)
          : Math.round(n.throughputRps / 2.4),
        cpuLoad: next
          ? Math.min(94, n.cpuLoad + 28)
          : Math.max(18, n.cpuLoad - 28),
        replicas: next ? n.replicas + 4 : Math.max(2, n.replicas - 4),
      })),
      telemetryLogs: [
        `[${now}] STRESS-SIM :: ${
          next
            ? "🔥 2.4x Traffic Surge injected! Auto-scaling K8s replicas..."
            : "✅ Traffic load normalized to baseline."
        }`,
        ...s.telemetryLogs.slice(0, 10),
      ],
    };
  });

const toggleTeamCursors = () =>
  setState((s) => ({ showTeamCursors: !s.showTeamCursors }));

const setExportModalOpen = (open: boolean) =>
  setState(() => ({ isExportModalOpen: open }));

const setZoom = (z: number) =>
  setState(() => ({ zoom: Math.max(0.8, Math.min(1.25, Number(z.toFixed(2)))) }));

export function useNexusStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  return {
    ...globalState,
    toggleLang,
    loadTemplate,
    selectNode,
    moveNode,
    updateSelectedNode,
    addNode,
    deleteSelectedNode,
    startConnecting,
    toggleStressMode,
    toggleTeamCursors,
    setExportModalOpen,
    setZoom,
  };
}