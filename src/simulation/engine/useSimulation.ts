"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSnapshotAtTime,
  MAX_SIMULATION_TIME_SECONDS,
} from "@/simulation/engine/physics";
import {
  SimulationConfig,
  SimulationSnapshot,
} from "@/simulation/engine/types";

type UseSimulationResult = {
  snapshot: SimulationSnapshot;
  running: boolean;
  setRunning: (running: boolean) => void;
  reset: () => void;
  seekTo: (timeSeconds: number) => void;
  duration: number;
};

export const useSimulation = (
  config: SimulationConfig,
  playbackRate: number,
): UseSimulationResult => {
  const configRef = useRef(config);
  const playbackRateRef = useRef(playbackRate);
  const shouldStopRef = useRef(false);
  const [snapshot, setSnapshot] = useState(() => getSnapshotAtTime(config, 0));
  const [running, setRunning] = useState(true);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  const reset = useCallback(() => {
    setSnapshot(getSnapshotAtTime(configRef.current, 0));
    setRunning(true);
  }, []);

  const seekTo = useCallback((timeSeconds: number) => {
    setSnapshot(getSnapshotAtTime(configRef.current, timeSeconds));
  }, []);

  useEffect(() => {
    setSnapshot((current) => getSnapshotAtTime(configRef.current, current.time));
  }, [config]);

  useEffect(() => {
    if (!running) {
      return;
    }

    let frameId = 0;
    let lastTime = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05) * playbackRateRef.current;
      lastTime = now;

      setSnapshot((current) => {
        const next = getSnapshotAtTime(configRef.current, current.time + dt);
        if (next.time >= MAX_SIMULATION_TIME_SECONDS) {
          shouldStopRef.current = true;
          return next;
        }
        return next;
      });

      if (shouldStopRef.current) {
        shouldStopRef.current = false;
        setRunning(false);
        return;
      }

      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(frameId);
  }, [running]);

  return {
    snapshot,
    running,
    setRunning,
    reset,
    seekTo,
    duration: MAX_SIMULATION_TIME_SECONDS,
  };
};
