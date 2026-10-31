# NexusCanvas — Local System Architecture Graph Studio

**Author:** Pooya Goodarzi  
**Live site:** https://pooya16pg-spec.github.io/nexus-canvas/

NexusCanvas is a client-side architecture graph editor. It lets a visitor arrange service nodes, connect dependencies, edit replica counts, inspect topology, and generate a Docker Compose starter manifest.

## What it does
- Edits a directed service graph in the browser.
- Performs local checks for under-replicated or overloaded nodes, isolated and unreachable nodes, missing edge endpoints, dependency cycles, and cache adjacency.
- Computes the longest dependency-path latency only when the graph is acyclic.
- Simulates a local traffic stress mode. The original metric baseline is stored and restored exactly when stress mode is turned off.
- Synchronizes graph state between tabs on the same browser origin with `BroadcastChannel`. This is not remote multiplayer and does not synchronize across devices.
- Exports a Compose template. Replicas are provided as `docker compose up --scale` suggestions; fixed host ports and fixed container names are omitted to avoid scaling collisions.

## Limits and deployment
- Next.js static export on GitHub Pages; there is no server, WebSocket room, authentication, CRDT service, or live infrastructure telemetry.
- Node throughput, CPU, and latency values are illustrative inputs for local analysis, not measurements from running containers.
- The exported Compose file is a starter manifest. Confirm image availability, ports, secrets, health checks, persistent volumes, and service-specific configuration before deployment.

## Stack
Next.js 14, React 18, TypeScript, Tailwind CSS, SVG, and browser-native BroadcastChannel.
