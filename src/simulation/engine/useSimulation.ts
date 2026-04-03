"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  advanceSnapshot,
  createInitialSnapshot,
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
};

const MAX_SIMULATION_TIME_SECONDS = 5;

export const useSimulation = (config: SimulationConfig): UseSimulationResult => {
  const configRef = useRef(config);
  const shouldStopRef = useRef(false);
  const [snapshot, setSnapshot] = useState(() => createInitialSnapshot(config));
  const [running, setRunning] = useState(true);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const reset = useCallback(() => {
    setSnapshot(createInitialSnapshot(configRef.current));
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) {
      return;
    }

    let frameId = 0;
    let lastTime = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      setSnapshot((current) => {
        const next = advanceSnapshot(current, dt, configRef.current);
        if (next.time >= MAX_SIMULATION_TIME_SECONDS) {
          shouldStopRef.current = true;
          return { ...next, time: MAX_SIMULATION_TIME_SECONDS };
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

  return { snapshot, running, setRunning, reset };
};
