# NexusCanvas — Distributed System Architecture Studio & SPOF Analyzer
**Lead Architect:** Pooya Goodarzi (Computer Engineering)  
**Live Demo:** [https://pooya16pg-spec.github.io/nexus-canvas/](https://pooya16pg-spec.github.io/nexus-canvas/)

## Engineering Case Study
1. **Automated SPOF & Dependency Validator:** Continuously analyzes the directed service graph to flag Single Points of Failure (`replicas < 2`, uncached database bottlenecks, or disconnected nodes).
2. **Real Multi-Tab `BroadcastChannel` State Sync:** Synchronizes node coordinates and replica scaling across multiple browser tabs in real time.
3. **Infrastructure-as-Code (IaC) Synthesizer:** Compiles the visual topology into a valid `docker-compose.yml` deployment manifest.