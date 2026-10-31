"use client";

import React from "react";
import TopBar from "../components/TopBar";
import InteractiveCanvas from "../components/InteractiveCanvas";
import NodeInspectorPanel from "../components/NodeInspectorPanel";
import ExportCodeModal from "../components/ExportCodeModal";

export default function NexusCanvasPage() {
  return (
    <div className="min-h-screen nexus-bg flex flex-col">
      <TopBar />

      <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-8 min-w-0">
            <InteractiveCanvas />
          </div>
          <div className="lg:col-span-4 min-w-0">
            <NodeInspectorPanel />
          </div>
        </div>
      </main>

      <ExportCodeModal />
    </div>
  );
}