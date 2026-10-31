# NexusCanvas — System Architecture Graph Studio

**Author:** Pooya Goodarzi  
**Live site:** https://pooya16pg-spec.github.io/nexus-canvas/

NexusCanvas is a client-side architecture workspace for sketching service topologies, checking structural risks, and exporting portable starter artifacts.

## Design and inspect
- Create gateways, services, AI workers, databases, and caches directly from the canvas toolbar; move nodes and connect dependencies.
- Switch between an interactive 2D canvas and a mobile-friendly rack view.
- Inspect under-replicated or overloaded services, isolated/unreachable nodes, missing edge endpoints, dependency cycles, and modeled database/cache bottlenecks.
- Compute a longest dependency-path latency only when the graph is acyclic.
- Enable a local 2.2× stress simulation; the exact original throughput and CPU baseline is restored when it is turned off.
- Same-origin browser tabs can synchronize through BroadcastChannel. This is not remote collaboration and does not sync across devices.

## Portable architecture snapshots
- Export the current graph as a versioned `nexus-canvas.graph` JSON snapshot.
- Copy the snapshot or download `nexus-canvas-architecture.json`.
- Import a previously exported snapshot. The importer validates schema version, size limits, unique IDs, node properties, ports, and edge endpoints before replacing the current graph.
- Generate a Docker Compose starter template from an acyclic graph with valid connections and unique service names.

## Deployment boundaries
- Next.js 16 static export on GitHub Pages; no server, WebSocket room, account system, CRDT service, or live infrastructure telemetry is included.
- Throughput, CPU, and latency values are editable illustrative inputs, not measurements from deployed containers.
- Compose output is a starter template. Verify images, secrets, networks, ports, health checks, volumes, and service-specific environment settings before deployment.

## Stack
Next.js 16, React 19, TypeScript, Tailwind CSS, SVG, browser-native BroadcastChannel, and JSON file import/export.
