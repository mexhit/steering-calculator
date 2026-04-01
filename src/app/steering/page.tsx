"use client";

import { useState } from "react";
import { SPEED_MAX_KMH, WHEELBASE_DEFAULT } from "@/lib/steering/constants";
import {
  calculateMetrics,
  getLaneUsageColor,
  steeringWheelToRoadWheelAngle,
  SteeringParams,
} from "@/lib/steering/math";
import SliderRow from "@/components/steering/SliderRow";
import MetricCard from "@/components/steering/MetricCard";
import TrajectoryCanvas from "@/components/steering/TrajectoryCanvas";
import SteeringDiagram from "@/components/steering/SteeringDiagram";
import SteeringWheel from "@/components/steering/SteeringWheel";

/* =========================
   Shared styles
========================= */

const surfaceCardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 14,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--muted)",
};

export default function App() {
  const [speed, setSpeed] = useState(20);
  const [angle, setAngle] = useState(15);
  const [duration, setDuration] = useState(1.0);
  const [wheelbase, setWheelbase] = useState(WHEELBASE_DEFAULT);

  const params: SteeringParams = { speed, angle, duration, wheelbase };
  const metrics = calculateMetrics(params);
  const steeringWheel = steeringWheelToRoadWheelAngle(angle);
  const laneColor = getLaneUsageColor(metrics.laneUsage);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--sans)",
        padding: "0 0 40px",
      }}
    >
      <style>{`
        :root {
          --bg: #0f1117;
          --surface: #171b26;
          --surface2: #1e2333;
          --border: rgba(255,255,255,0.08);
          --text: #e8eaf0;
          --muted: #6b7280;
          --muted-color: #6b7280;
          --accent: #1D9E75;
          --sans: 'DM Sans', 'Segoe UI', sans-serif;
          --mono: 'JetBrains Mono', 'Fira Code', monospace;
        }

        @media (prefers-color-scheme: light) {
          :root {
            --bg: #f4f5f7;
            --surface: #ffffff;
            --surface2: #f0f1f4;
            --border: rgba(0,0,0,0.08);
            --text: #111827;
            --muted: #6b7280;
            --muted-color: #6b7280;
          }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        input[type=range] {
          height: 4px;
          border-radius: 2px;
          cursor: pointer;
          outline: none;
          border: none;
        }

        body { background: var(--bg); }
      `}</style>

      <div
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            maxWidth: 780,
            margin: "0 auto",
            display: "flex",
            alignItems: "baseline",
            gap: 12,
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            Steering Calculator
          </h1>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            lateral displacement &amp; heading change
          </span>
        </div>
      </div>

      <div
        style={{
          maxWidth: 780,
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div
            style={{
              ...surfaceCardStyle,
              padding: "20px 20px 6px",
              flex: "1 1 320px",
            }}
          >
            <div style={{ ...sectionLabelStyle, marginBottom: 18 }}>
              Parameters
            </div>

            <SliderRow
              label="Speed"
              min={5}
              max={SPEED_MAX_KMH}
              step={1}
              value={speed}
              unit="km/h"
              decimals={0}
              onChange={(value) => setSpeed(Math.min(value, SPEED_MAX_KMH))}
            />
            <SliderRow
              label="Steering angle"
              min={1}
              max={40}
              step={1}
              value={angle}
              unit="°"
              decimals={0}
              onChange={setAngle}
            />
            <SliderRow
              label="Duration"
              min={0.1}
              max={5}
              step={0.1}
              value={duration}
              unit="s"
              decimals={1}
              onChange={setDuration}
            />
            <SliderRow
              label="Wheelbase"
              min={2.0}
              max={3.5}
              step={0.1}
              value={wheelbase}
              unit="m"
              decimals={1}
              onChange={setWheelbase}
            />
          </div>

          <div
            style={{
              ...surfaceCardStyle,
              padding: "20px",
              flex: "0 0 200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ ...sectionLabelStyle, marginBottom: 8 }}>
                Wheel angle
              </div>
              <SteeringDiagram angle={angle} />
            </div>

            <div
              style={{
                borderTop: "1px solid var(--border)",
                width: "100%",
                height: 0,
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ ...sectionLabelStyle, marginBottom: 8 }}>
                Steering wheel
              </div>
              <SteeringWheel angle={steeringWheel} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <MetricCard
            label="Turn radius"
            value={metrics.R.toFixed(1)}
            unit="m"
          />
          <MetricCard
            label="Arc distance"
            value={metrics.arc.toFixed(2)}
            unit="m"
          />
          <MetricCard
            label="Lateral shift"
            value={metrics.lateral.toFixed(2)}
            unit="m"
            color="#1D9E75"
          />
          <MetricCard
            label="Steering wheel angle"
            value={steeringWheel.toFixed(1)}
            unit="°"
          />
          <MetricCard
            label="Heading change"
            value={metrics.headingDeg.toFixed(1)}
            unit="°"
            color="#D85A30"
          />
          <MetricCard
            label="Lane usage"
            value={metrics.laneUsage.toFixed(0)}
            unit="%"
            color={laneColor}
          />
        </div>

        <div style={{ ...surfaceCardStyle, padding: 16 }}>
          <div style={{ ...sectionLabelStyle, marginBottom: 12 }}>
            Trajectory
          </div>
          <TrajectoryCanvas params={params} />
        </div>
      </div>
    </div>
  );
}
