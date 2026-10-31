"use client";

import React from "react";
import TopBar from "../components/TopBar";
import InteractiveCanvas from "../components/InteractiveCanvas";
import NodeInspectorPanel from "../components/NodeInspectorPanel";
import ExportCodeModal from "../components/ExportCodeModal";

export default function NexusCanvasPage() {
  return (
    <div className="min-h-[100svh] nexus-bg flex flex-col">
      <TopBar />

      <main className="flex-1 min-w-0 max-w-[1720px] w-full mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
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