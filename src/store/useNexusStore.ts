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
  dockerImage: string;
  port: number;
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
  stressBaseline: Record<string, { throughputRps: number; cpuLoad: number }> | null;
}

const TEMPLATES: Record<TemplateId, { nodes: ArchNode[]; edges: ArchEdge[] }> = {
  AI_RAG: {
    nodes: [
      {
        id: "n-edge",
        title: "Cloudflare / Envoy Gateway",
        subtitle: "Zero-Trust WAF & Rate Limiter",
        category: "GATEWAY",
        x: 50,
        y: 165,
        latencyMs: 1.8,
        throughputRps: 14200,
        cpuLoad: 28,
        replicas: 4,
        techStack: "Envoy Proxy v1.31",
        dockerImage: "envoyproxy/envoy:v1.31-latest",
        port: 8080,
      },
      {
        id: "n-orchestrator",
        title: "Neural Agent Router",
        subtitle: "Semantic Intent Classifier",
        category: "SERVICE",
        x: 310,
        y: 75,
        latencyMs: 6.4,
        throughputRps: 9800,
        cpuLoad: 44,
        replicas: 6,
        techStack: "Go 1.23 / gRPC Mesh",
        dockerImage: "golang:1.23-alpine",
        port: 9090,
      },
      {
        id: "n-redis",
        title: "Redis Semantic Cache",
        subtitle: "Sub-ms Vector Hit Layer",
        category: "CACHE",
        x: 310,
        y: 255,
        latencyMs: 0.4,
        throughputRps: 45000,
        cpuLoad: 19,
        replicas: 3,
        techStack: "Redis Cluster 7.2",
        dockerImage: "redis:7.2-alpine",
        port: 6379,
      },
      {
        id: "n-llm",
        title: "vLLM Inference Cluster",
        subtitle: "FP8 Quantized Transformer",
        category: "AI",
        x: 575,
        y: 80,
        latencyMs: 24.5,
        throughputRps: 3400,
        cpuLoad: 72,
        replicas: 8,
        techStack: "vLLM / CUDA 12.4",
        dockerImage: "vllm/vllm-openai:latest",
        port: 8000,
      },
      {
        id: "n-qdrant",
        title: "Qdrant Vector Engine",
        subtitle: "HNSW 1536-Dim Index",
        category: "DATABASE",
        x: 575,
        y: 255,
        latencyMs: 3.2,
        throughputRps: 18500,
        cpuLoad: 38,
        replicas: 3,
        techStack: "Qdrant Rust Engine",
        dockerImage: "qdrant/qdrant:v1.11.0",
        port: 6333,
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
        x: 55,
        y: 165,
        latencyMs: 0.3,
        throughputRps: 68000,
        cpuLoad: 35,
        replicas: 6,
        techStack: "nginx / WebSocket",
        dockerImage: "nginx:1.27-alpine",
        port: 443,
      },
      {
        id: "f-matcher",
        title: "Matching Engine Core",
        subtitle: "Lock-Free RingBuffer",
        category: "SERVICE",
        x: 320,
        y: 80,
        latencyMs: 0.2,
        throughputRps: 95000,
        cpuLoad: 52,
        replicas: 4,
        techStack: "Rust / Tokio Core",
        dockerImage: "rust:1.81-slim",
        port: 7070,
      },
      {
        id: "f-risk",
        title: "Margin Risk Guard",
        subtitle: "Real-Time VaR Engine",
        category: "AI",
        x: 320,
        y: 255,
        latencyMs: 1.9,
        throughputRps: 42000,
        cpuLoad: 61,
        replicas: 4,
        techStack: "ONNX Runtime",
        dockerImage: "mcr.microsoft.com/onnxruntime/server:latest",
        port: 8001,
      },
      {
        id: "f-ledger",
        title: "Timescale Tick Ledger",
        subtitle: "Immutable Audit Cluster",
        category: "DATABASE",
        x: 580,
        y: 165,
        latencyMs: 2.1,
        throughputRps: 54000,
        cpuLoad: 41,
        replicas: 3,
        techStack: "PostgreSQL 16 / Timescale",
        dockerImage: "timescale/timescaledb:latest-pg16",
        port: 5432,
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
        x: 60,
        y: 165,
        latencyMs: 1.4,
        throughputRps: 31000,
        cpuLoad: 29,
        replicas: 4,
        techStack: "Istio / Envoy",
        dockerImage: "istio/proxyv2:1.23.0",
        port: 15021,
      },
      {
        id: "k-auth",
        title: "Redis Session Guard",
        subtitle: "JWT & Rate-Limit Cache",
        category: "CACHE",
        x: 320,
        y: 80,
        latencyMs: 0.9,
        throughputRps: 54000,
        cpuLoad: 24,
        replicas: 3,
        techStack: "Redis 7.2",
        dockerImage: "redis:7.2-alpine",
        port: 6379,
      },
      {
        id: "k-api",
        title: "GraphQL Federation",
        subtitle: "Distributed Subgraph Mesh",
        category: "SERVICE",
        x: 320,
        y: 255,
        latencyMs: 4.8,
        throughputRps: 22500,
        cpuLoad: 49,
        replicas: 6,
        techStack: "Node.js 20 / Apollo",
        dockerImage: "node:20-alpine",
        port: 4000,
      },
      {
        id: "k-db",
        title: "CockroachDB Cluster",
        subtitle: "Multi-Region Raft SQL",
        category: "DATABASE",
        x: 580,
        y: 165,
        latencyMs: 3.7,
        throughputRps: 29000,
        cpuLoad: 42,
        replicas: 3,
        techStack: "CockroachDB v24.1",
        dockerImage: "cockroachdb/cockroach:v24.1.0",
        port: 26257,
      },
    ],
    edges: [
      { id: "ke1", from: "k-ing", to: "k-auth", protocol: "mTLS" },
      { id: "ke2", from: "k-ing", to: "k-api", protocol: "HTTP/2" },
      { id: "ke3", from: "k-auth", to: "k-api", protocol: "JWT-Verify" },
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
    "[LOCAL-ANALYSIS] Seed topology loaded; metrics are illustrative, not live infrastructure telemetry.",
    "[LOCAL-SYNC] BroadcastChannel sync is limited to same-origin tabs in this browser.",
    "[EXPORT] Compose output is a deployment template; validate images, ports, and dependencies before use.",
  ],
  stressBaseline: null,
};

const listeners = new Set<() => void>();
let syncChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  syncChannel = new BroadcastChannel("nexus_canvas_sync_v1");
  syncChannel.onmessage = (event) => {
    if (event.data && event.data.type === "STATE_SYNC") {
      globalState = {
        ...globalState,
        nodes: event.data.nodes,
        edges: event.data.edges,
        activeTemplate: event.data.activeTemplate,
        isStressMode: Boolean(event.data.isStressMode),
        stressBaseline: event.data.stressBaseline || null,
      };
      listeners.forEach((l) => l());
    }
  };
}

function broadcastCurrentTopology() {
  if (syncChannel) {
    try {
      syncChannel.postMessage({
        type: "STATE_SYNC",
        nodes: globalState.nodes,
        edges: globalState.edges,
        activeTemplate: globalState.activeTemplate,
        isStressMode: globalState.isStressMode,
        stressBaseline: globalState.stressBaseline,
      });
    } catch {}
  }
}

function setState(updater: (prev: NexusState) => Partial<NexusState>, shouldBroadcast = false) {
  globalState = { ...globalState, ...updater(globalState) };
  if (shouldBroadcast) broadcastCurrentTopology();
  listeners.forEach((l) => l());
}

const importTopologySnapshot = (input: unknown): boolean => {
  if (!input || typeof input !== "object") return false;
  const value = input as { schema?: unknown; version?: unknown; nodes?: unknown; edges?: unknown };
  if (
    value.schema !== "nexus-canvas.graph" ||
    value.version !== 1 ||
    !Array.isArray(value.nodes) ||
    !Array.isArray(value.edges) ||
    value.nodes.length < 1 ||
    value.nodes.length > 100 ||
    value.edges.length > 300
  ) return false;

  const allowedCategories: NodeCategory[] = ["GATEWAY", "SERVICE", "AI", "DATABASE", "CACHE"];
  const importedNodes: ArchNode[] = [];
  const ids = new Set<string>();

  for (const rawNode of value.nodes) {
    if (!rawNode || typeof rawNode !== "object") return false;
    const node = rawNode as Partial<ArchNode>;
    if (
      typeof node.id !== "string" || !node.id.trim() || ids.has(node.id) ||
      typeof node.title !== "string" || !node.title.trim() ||
      typeof node.subtitle !== "string" ||
      !node.category || !allowedCategories.includes(node.category) ||
      typeof node.techStack !== "string" ||
      typeof node.dockerImage !== "string" ||
      !Number.isFinite(node.x) || !Number.isFinite(node.y) ||
      !Number.isFinite(node.latencyMs) || (node.latencyMs as number) < 0 ||
      !Number.isFinite(node.throughputRps) || (node.throughputRps as number) < 0 ||
      !Number.isFinite(node.cpuLoad) || (node.cpuLoad as number) < 0 || (node.cpuLoad as number) > 100 ||
      !Number.isInteger(node.replicas) || (node.replicas as number) < 1 || (node.replicas as number) > 50 ||
      !Number.isInteger(node.port) || (node.port as number) < 1 || (node.port as number) > 65535
    ) return false;
    ids.add(node.id);
    importedNodes.push({
      id: node.id,
      title: node.title,
      subtitle: node.subtitle,
      category: node.category,
      x: Math.max(12, Math.min(630, Math.round(node.x as number))),
      y: Math.max(12, Math.min(315, Math.round(node.y as number))),
      latencyMs: node.latencyMs as number,
      throughputRps: node.throughputRps as number,
      cpuLoad: node.cpuLoad as number,
      replicas: node.replicas as number,
      techStack: node.techStack,
      dockerImage: node.dockerImage,
      port: node.port as number,
    });
  }

  const edgeIds = new Set<string>();
  const importedEdges: ArchEdge[] = [];
  for (const rawEdge of value.edges) {
    if (!rawEdge || typeof rawEdge !== "object") return false;
    const edge = rawEdge as Partial<ArchEdge>;
    if (
      typeof edge.id !== "string" || !edge.id.trim() || edgeIds.has(edge.id) ||
      typeof edge.from !== "string" || !ids.has(edge.from) ||
      typeof edge.to !== "string" || !ids.has(edge.to) ||
      typeof edge.protocol !== "string" || !edge.protocol.trim()
    ) return false;
    edgeIds.add(edge.id);
    importedEdges.push({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      protocol: edge.protocol,
    });
  }

  const firstNode = importedNodes[0];
  const now = new Date().toLocaleTimeString("en-US", { hour12: false });
  setState(() => ({
    nodes: importedNodes,
    edges: importedEdges,
    selectedNodeId: firstNode.id,
    connectingFromId: null,
    isStressMode: false,
    stressBaseline: null,
    telemetryLogs: [
      `[${now}] SNAPSHOT :: Imported ${importedNodes.length} nodes and ${importedEdges.length} edges from JSON.`,
      ...globalState.telemetryLogs.slice(0, 10),
    ],
  }), true);
  return true;
};

const toggleLang = () =>
  setState((s) => ({ lang: s.lang === "fa" ? "en" : "fa" }));

const loadTemplate = (id: TemplateId) =>
  setState((s) => {
    const tpl = TEMPLATES[id];
    const now = new Date().toLocaleTimeString("en-US", { hour12: false });
    return {
      activeTemplate: id,
      isStressMode: false,
      stressBaseline: null,
      nodes: tpl.nodes.map((n) => ({ ...n })),
      edges: tpl.edges.map((e) => ({ ...e })),
      selectedNodeId: tpl.nodes[0].id,
      connectingFromId: null,
      telemetryLogs: [
        `[${now}] BLUEPRINT :: Loaded '${id}' topology (${tpl.nodes.length} nodes)`,
        ...s.telemetryLogs.slice(0, 10),
      ],
    };
  }, true);

const selectNode = (id: string) =>
  setState((s) => {
    if (s.connectingFromId === id) {
      return { connectingFromId: null, selectedNodeId: id };
    }
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
  }, true);

const moveNode = (id: string, x: number, y: number) =>
  setState((s) => ({
    nodes: s.nodes.map((n) =>
      n.id === id
        ? {
            ...n,
            x: Math.max(12, Math.min(630, Math.round(x))),
            y: Math.max(12, Math.min(315, Math.round(y))),
          }
        : n
    ),
  }), true);

const updateSelectedNode = (patch: Partial<ArchNode>) =>
  setState((s) => ({
    nodes: s.nodes.map((n) =>
      n.id === s.selectedNodeId ? { ...n, ...patch } : n
    ),
  }), true);

const addNode = (category: NodeCategory) =>
  setState((s) => {
    const id = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const defaults: Record<
      NodeCategory,
      { title: string; image: string; port: number; stack: string }
    > = {
      GATEWAY: {
        title: "Envoy Edge Gateway",
        image: "envoyproxy/envoy:v1.31-latest",
        port: 8080,
        stack: "Envoy Proxy",
      },
      SERVICE: {
        title: "Go gRPC Microservice",
        image: "golang:1.23-alpine",
        port: 9000,
        stack: "Go 1.23 / gRPC",
      },
      AI: {
        title: "vLLM Inference Worker",
        image: "vllm/vllm-openai:latest",
        port: 8000,
        stack: "PyTorch / vLLM",
      },
      DATABASE: {
        title: "PostgreSQL Vector Shard",
        image: "pgvector/pgvector:pg16",
        port: 5432,
        stack: "PostgreSQL 16",
      },
      CACHE: {
        title: "Redis Cluster Cache",
        image: "redis:7.2-alpine",
        port: 6379,
        stack: "Redis 7.2",
      },
    };
    const cfg = defaults[category];
    const newNode: ArchNode = {
      id,
      title: cfg.title,
      subtitle: "Auto-Provisioned Cluster Node",
      category,
      x: 200 + Math.floor(Math.random() * 220),
      y: 100 + Math.floor(Math.random() * 140),
      latencyMs: 2.4,
      throughputRps: 12500,
      cpuLoad: 32,
      replicas: 3,
      techStack: cfg.stack,
      dockerImage: cfg.image,
      port: cfg.port,
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
  }, true);

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
  }, true);

const startConnecting = () =>
  setState((s) => ({
    connectingFromId: s.connectingFromId ? null : s.selectedNodeId,
  }));

const toggleStressMode = () =>
  setState((s) => {
    const next = !s.isStressMode;
    const now = new Date().toLocaleTimeString("en-US", { hour12: false });

    if (next) {
      const baseline = Object.fromEntries(
        s.nodes.map((node) => [
          node.id,
          { throughputRps: node.throughputRps, cpuLoad: node.cpuLoad },
        ])
      );
      return {
        isStressMode: true,
        stressBaseline: baseline,
        nodes: s.nodes.map((node) => ({
          ...node,
          throughputRps: Math.round(node.throughputRps * 2.2),
          cpuLoad: Math.min(94, node.cpuLoad + 26),
        })),
        telemetryLogs: [
          `[${now}] LOAD-SIM :: Local 2.2x traffic stress simulation enabled.`,
          ...s.telemetryLogs.slice(0, 10),
        ],
      };
    }

    const baseline = s.stressBaseline || {};
    return {
      isStressMode: false,
      stressBaseline: null,
      nodes: s.nodes.map((node) => ({
        ...node,
        ...(baseline[node.id] || {}),
      })),
      telemetryLogs: [
        `[${now}] LOAD-SIM :: Baseline metrics restored exactly.`,
        ...s.telemetryLogs.slice(0, 10),
      ],
    };
  }, true);

const toggleTeamCursors = () =>
  setState((s) => ({ showTeamCursors: !s.showTeamCursors }));

const setExportModalOpen = (open: boolean) =>
  setState(() => ({ isExportModalOpen: open }));

const setZoom = (z: number) =>
  setState(() => ({ zoom: Math.max(0.7, Math.min(1.3, Number(z.toFixed(2)))) }));

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
    importTopologySnapshot,
  };
}