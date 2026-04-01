"use client";

import React from "react";

interface SteeringWheelProps {
  angle: number;
}

export default function SteeringWheel({ angle }: SteeringWheelProps) {
  return (
    <div
      style={{
        width: "120px",
        height: "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{
          transform: `rotate(${-angle}deg)`,
          transition: "transform 0.1s ease-out",
          overflow: "visible",
        }}
      >
        {/* Outer Ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="var(--text)"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r="41"
          fill="none"
          stroke="var(--bg)"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Inner Hub */}
        <circle cx="50" cy="50" r="12" fill="var(--text)" />
        <circle cx="50" cy="50" r="10" fill="var(--surface)" />
        <circle cx="50" cy="50" r="3" fill="var(--text)" opacity="0.5" />

        {/* Spokes */}
        {/* Left spoke */}
        <rect x="10" y="47" width="30" height="6" rx="2" fill="var(--text)" />
        {/* Right spoke */}
        <rect x="60" y="47" width="30" height="6" rx="2" fill="var(--text)" />
        {/* Bottom spoke */}
        <rect x="47" y="60" width="6" height="28" rx="2" fill="var(--text)" />

        {/* Top center marker */}
        <rect x="48" y="5" width="4" height="10" rx="1" fill="#D85A30" />
      </svg>

      {/* Center display (static) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "10px",
          fontWeight: "bold",
          color: "var(--text)",
          pointerEvents: "none",
        }}
      >
        {Math.round(angle)}°
      </div>
    </div>
  );
}
