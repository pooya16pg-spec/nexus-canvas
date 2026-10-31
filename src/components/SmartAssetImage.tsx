"use client";

import React, { useState } from "react";

interface SmartAssetImageProps {
  baseName: "pooya-architect" | "nexus-core";
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback: React.ReactNode;
}

const CANDIDATE_PATHS = (name: string) => [
  `/nexus-canvas/assets/${name}.webp`,
  `/nexus-canvas/assets/${name}.png`,
  `/nexus-canvas/assets/${name}.jpg`,
  `/assets/${name}.webp`,
  `/assets/${name}.png`,
  `/assets/${name}.jpg`,
];

export default function SmartAssetImage({
  baseName,
  alt,
  className = "w-full h-full object-cover",
  style,
  fallback,
}: SmartAssetImageProps) {
  const paths = CANDIDATE_PATHS(baseName);
  const [idx, setIdx] = useState(0);
  const [failedAll, setFailedAll] = useState(false);

  if (failedAll) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={paths[idx]}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        if (idx + 1 < paths.length) {
          setIdx(idx + 1);
        } else {
          setFailedAll(true);
        }
      }}
    />
  );
}