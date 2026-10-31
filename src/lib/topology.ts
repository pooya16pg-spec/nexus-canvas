import type { ArchEdge, ArchNode } from "../store/useNexusStore";

export interface TopologyAnalysis {
  spofNodes: ArchNode[];
  isolatedNodes: ArchNode[];
  unreachableNodes: ArchNode[];
  uncachedDbBottlenecks: ArchNode[];
  invalidEdges: ArchEdge[];
  hasCycle: boolean;
  criticalPathMs: number | null;
}

export function analyzeTopology(
  nodes: ArchNode[],
  edges: ArchEdge[]
): TopologyAnalysis {
  const byId = new Map<string, ArchNode>();
  nodes.forEach((node) => byId.set(node.id, node));
  const ids = nodes.map((node) => node.id);
  const validEdges = edges.filter(
    (edge) => byId.has(edge.from) && byId.has(edge.to)
  );
  const invalidEdges = edges.filter(
    (edge) => !byId.has(edge.from) || !byId.has(edge.to)
  );

  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, number>();
  const degree = new Map<string, number>();
  ids.forEach((id) => {
    outgoing.set(id, []);
    incoming.set(id, 0);
    degree.set(id, 0);
  });

  validEdges.forEach((edge) => {
    outgoing.get(edge.from)?.push(edge.to);
    incoming.set(edge.to, (incoming.get(edge.to) || 0) + 1);
    degree.set(edge.from, (degree.get(edge.from) || 0) + 1);
    degree.set(edge.to, (degree.get(edge.to) || 0) + 1);
  });

  const roots = nodes.filter((node) => node.category === "GATEWAY");
  const traversalRoots =
    roots.length > 0
      ? roots
      : nodes.filter((node) => (incoming.get(node.id) || 0) === 0);
  const reachable = new Set<string>();
  const stack = traversalRoots.map((node) => node.id);

  while (stack.length > 0) {
    const id = stack.pop() as string;
    if (reachable.has(id)) continue;
    reachable.add(id);
    outgoing.get(id)?.forEach((next) => {
      if (!reachable.has(next)) stack.push(next);
    });
  }

  const isolatedNodes = nodes.filter((node) => (degree.get(node.id) || 0) === 0);
  const unreachableNodes = nodes.filter(
    (node) => !reachable.has(node.id) && !isolatedNodes.some((item) => item.id === node.id)
  );
  const spofNodes = nodes.filter(
    (node) => node.replicas < 2 || node.cpuLoad > 85
  );

  const caches = nodes.filter((node) => node.category === "CACHE");
  const uncachedDbBottlenecks = nodes.filter(
    (node) =>
      node.category === "DATABASE" &&
      node.throughputRps > 15000 &&
      !caches.some((cache) =>
        validEdges.some(
          (edge) =>
            (edge.from === cache.id && edge.to === node.id) ||
            (edge.to === cache.id && edge.from === node.id)
        )
      )
  );

  // Kahn's algorithm detects dependency cycles and computes the DAG's longest latency path.
  const indegree = new Map(incoming);
  const queue = ids.filter((id) => (indegree.get(id) || 0) === 0);
  const longest = new Map<string, number>();
  let visited = 0;
  let criticalPathMs = 0;

  while (queue.length > 0) {
    const id = queue.shift() as string;
    visited += 1;
    const node = byId.get(id);
    const pathLatency = (longest.get(id) || 0) + (node?.latencyMs || 0);
    criticalPathMs = Math.max(criticalPathMs, pathLatency);

    (outgoing.get(id) || []).forEach((next) => {
      longest.set(next, Math.max(longest.get(next) || 0, pathLatency));
      const remaining = (indegree.get(next) || 0) - 1;
      indegree.set(next, remaining);
      if (remaining === 0) queue.push(next);
    });
  }

  const hasCycle = visited !== ids.length;

  return {
    spofNodes,
    isolatedNodes,
    unreachableNodes,
    uncachedDbBottlenecks,
    invalidEdges,
    hasCycle,
    criticalPathMs: hasCycle ? null : criticalPathMs,
  };
}
