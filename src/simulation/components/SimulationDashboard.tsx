"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  defaultSimulationConfig,
  legacyRoadLayout,
} from "@/simulation/engine/physics";
import { useSimulation } from "@/simulation/engine/useSimulation";
import SimulationScene, {
  CameraMode,
} from "@/simulation/3d/SimulationScene";
import { LaneSide, RoadLayout } from "@/simulation/engine/types";

const panelStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  background: "rgba(9,12,19,0.7)",
  padding: 14,
};

type MetricProps = {
  label: string;
  value: string;
  tone?: "neutral" | "warning" | "danger";
};

function Metric({ label, value, tone = "neutral" }: MetricProps) {
  const color =
    tone === "danger" ? "#ff9f9f" : tone === "warning" ? "#ffd66f" : "#cdd8ee";

  return (
    <div style={{ ...panelStyle, minWidth: 130, flex: "1 1 130px" }}>
      <div style={{ fontSize: 11, color: "#9cadcc", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ marginTop: 8, color, fontWeight: 700, fontSize: 18 }}>{value}</div>
    </div>
  );
}

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
};

function Slider({ label, value, min, max, step, unit, onChange }: SliderProps) {
  return (
    <label
      style={{
        display: "grid",
        gap: 7,
        fontSize: 13,
        color: "#d8e1f7",
      }}
    >
      <span style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <strong style={{ color: "#9dd8ff" }}>
          {value.toFixed(step >= 1 ? 0 : 1)} {unit}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

type SimulationDashboardProps = {
  title?: string;
  subtitle?: string;
  roadLayout?: RoadLayout;
  initialLane?: LaneSide;
  carSteeringAngleDeg?: number;
  carSteeringDelaySeconds?: number;
  initialCarZ?: number;
  initialBikeZ?: number;
  fixedBikeZ?: number;
};

export default function SimulationDashboard({
  title = "3D Overtaking Simulation",
  subtitle = "Motorcycle overtake with lane shift, camera presets, and safety analysis",
  roadLayout = legacyRoadLayout,
  initialLane = "right",
  carSteeringAngleDeg = defaultSimulationConfig.carSteeringAngleDeg,
  carSteeringDelaySeconds = defaultSimulationConfig.carSteeringDelaySeconds ?? 0,
  initialCarZ,
  initialBikeZ,
  fixedBikeZ,
}: SimulationDashboardProps) {
  const [carSpeedKmh, setCarSpeedKmh] = useState(defaultSimulationConfig.carSpeedKmh);
  const [bikeTargetSpeedKmh, setBikeTargetSpeedKmh] = useState(
    defaultSimulationConfig.bikeTargetSpeedKmh,
  );
  const [reactionTimeSeconds, setReactionTimeSeconds] = useState(
    defaultSimulationConfig.reactionTimeSeconds,
  );
  const [cameraMode, setCameraMode] = useState<CameraMode>("orbit");
  const [cameraDistance, setCameraDistance] = useState(8);
  const [playbackRate, setPlaybackRate] = useState(1);
  const simulationConfig = useMemo(
    () => ({
      ...defaultSimulationConfig,
      carSpeedKmh,
      carSteeringAngleDeg,
      carSteeringDelaySeconds,
      bikeTargetSpeedKmh,
      reactionTimeSeconds,
      roadLayout,
      initialLane,
      initialCarZ,
      initialBikeZ,
      fixedBikeZ,
    }),
    [
      carSpeedKmh,
      carSteeringAngleDeg,
      carSteeringDelaySeconds,
      bikeTargetSpeedKmh,
      reactionTimeSeconds,
      roadLayout,
      initialLane,
      initialCarZ,
      initialBikeZ,
      fixedBikeZ,
    ],
  );

  const { snapshot, running, setRunning, reset, seekTo, duration } = useSimulation(
    simulationConfig,
    playbackRate,
  );

  const distanceBetweenCenters = Math.abs(snapshot.bike.x - snapshot.car.x).toFixed(1);
  const referenceLaneCenter =
    initialLane === "left" ? roadLayout.leftLaneCenter : roadLayout.rightLaneCenter;
  const laneOffset = Math.abs(snapshot.bike.z - referenceLaneCenter).toFixed(2);
  const ttcLabel =
    Number.isFinite(snapshot.timeToCollision) && snapshot.timeToCollision < 99
      ? `${snapshot.timeToCollision.toFixed(1)} s`
      : "N/A";

  const riskTone = snapshot.collision
    ? "danger"
    : snapshot.warning
      ? "warning"
      : "neutral";
  const timelineProgress =
    duration === 0 ? 0 : (snapshot.time / duration) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1100px 420px at 5% -10%, #21365f 0%, #0b1019 50%, #070b12 100%)",
        color: "#edf3ff",
        padding: "24px 16px 40px",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 14 }}>
        <div
          style={{
            ...panelStyle,
            padding: "14px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>{title}</h1>
            <div style={{ color: "#96a5c2", fontSize: 13, marginTop: 4 }}>
              {subtitle}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/simulation"
              style={{
                padding: "8px 12px",
                color: "#edf3ff",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
              }}
            >
              Base
            </Link>
            <Link
              href="/simulation-lane-3-5"
              style={{
                padding: "8px 12px",
                color: "#edf3ff",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
              }}
            >
              Lane 3.5 m
            </Link>
            <button
              style={{ padding: "8px 12px" }}
              onClick={() => setRunning(!running)}
            >
              {running ? "Pause" : "Play"}
            </button>
            <button style={{ padding: "8px 12px" }} onClick={reset}>
              Reset
            </button>
            <label style={{ display: "grid", gap: 4, fontSize: 12, color: "#96a5c2" }}>
              Speed
              <select
                value={playbackRate}
                onChange={(event) => setPlaybackRate(Number(event.target.value))}
                style={{ padding: 8, borderRadius: 10 }}
              >
                <option value={0.25}>0.25x</option>
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
                <option value={3}>3x</option>
              </select>
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
          <div style={{ ...panelStyle, display: "grid", gap: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 13,
                color: "#cdd8ee",
              }}
            >
              <span>Timeline</span>
              <span>
                {snapshot.time.toFixed(2)}s / {duration.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.01}
              value={snapshot.time}
              onChange={(event) => seekTo(Number(event.target.value))}
            />
            <div style={{ fontSize: 12, color: "#90a0bf" }}>
              Scrub the simulation like a video. Playback speed changes how fast time advances.
              Progress: <strong style={{ color: "#9dd8ff" }}>{timelineProgress.toFixed(0)}%</strong>
            </div>
          </div>

          <div
            style={{
              ...panelStyle,
              height: 530,
              padding: 0,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <SimulationScene
              snapshot={snapshot}
              cameraMode={cameraMode}
              cameraDistance={cameraDistance}
              roadLayout={roadLayout}
            />
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                padding: "8px 10px",
                borderRadius: 10,
                background: "rgba(0,0,0,0.45)",
                fontSize: 12,
              }}
            >
              Phase: <strong>{snapshot.phase}</strong> | t={snapshot.time.toFixed(1)}s
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ ...panelStyle, display: "grid", gap: 12 }}>
              <Slider
                label="Car Speed"
                value={carSpeedKmh}
                min={35}
                max={130}
                step={1}
                unit="km/h"
                onChange={setCarSpeedKmh}
              />
              <Slider
                label="Motorcycle Target Speed"
                value={bikeTargetSpeedKmh}
                min={45}
                max={180}
                step={1}
                unit="km/h"
                onChange={setBikeTargetSpeedKmh}
              />
              <Slider
                label="Reaction Time"
                value={reactionTimeSeconds}
                min={0.2}
                max={2.8}
                step={0.1}
                unit="s"
                onChange={setReactionTimeSeconds}
              />
            </div>

            <div style={{ ...panelStyle, display: "grid", gap: 10, alignContent: "start" }}>
              <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
                Camera Mode
                <select
                  value={cameraMode}
                  onChange={(event) => setCameraMode(event.target.value as CameraMode)}
                  style={{ padding: 8 }}
                >
                  <option value="orbit">Orbit (free rotate)</option>
                  <option value="chase-bike">Chase Motorcycle</option>
                  <option value="follow-car">Follow Car</option>
                  <option value="top">Top Down</option>
                </select>
              </label>
              <Slider
                label="Camera Distance"
                value={cameraDistance}
                min={4}
                max={22}
                step={0.5}
                unit="m"
                onChange={setCameraDistance}
              />
              <div style={{ fontSize: 12, color: "#90a0bf" }}>
                Orbit mode supports drag/zoom. Other modes auto-track overtaking from fixed
                angles.
              </div>
              <div style={{ fontSize: 12, color: "#90a0bf" }}>
                Lane width:{" "}
                <strong style={{ color: "#9dd8ff" }}>
                  {roadLayout.laneWidth.toFixed(1)} m
                </strong>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Metric label="Relative Speed" value={`${(snapshot.relativeSpeed * 3.6).toFixed(1)} km/h`} />
            <Metric label="Time to Collision" value={ttcLabel} tone={riskTone} />
            <Metric label="Center Gap" value={`${distanceBetweenCenters} m`} />
            <Metric
              label="Lateral Clearance"
              value={`${snapshot.lateralClearance.toFixed(2)} m`}
              tone={snapshot.lateralClearance < 0.7 ? "warning" : "neutral"}
            />
            <Metric
              label="Longitudinal Clearance"
              value={`${snapshot.longitudinalClearance.toFixed(2)} m`}
              tone={snapshot.longitudinalClearance < 4 ? "warning" : "neutral"}
            />
            <Metric label="Lane Shift" value={`${laneOffset} m`} />
          </div>
        </div>
      </div>
    </div>
  );
}
