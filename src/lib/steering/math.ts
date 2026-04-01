import { LANE_WIDTH, SPEED_MAX_KMH, TRAJECTORY_STEPS } from "./constants";

export type SteeringParams = {
  speed: number;
  angle: number;
  duration: number;
  wheelbase: number;
};

export type SteeringMetrics = {
  R: number;
  arc: number;
  lateral: number;
  forward: number;
  theta: number;
  headingDeg: number;
  laneUsage: number;
};

export type Point = {
  x: number;
  y: number;
};

export function calculateMetrics({
  speed,
  angle,
  duration,
  wheelbase,
}: SteeringParams): SteeringMetrics {
  const clampedSpeed = Math.min(speed, SPEED_MAX_KMH);
  const speedMs = clampedSpeed / 3.6;
  const angleRad = (angle * Math.PI) / 180;
  const R = wheelbase / Math.tan(angleRad);
  const arc = speedMs * duration;
  const theta = arc / R;
  const lateral = R * (1 - Math.cos(theta));
  const forward = R * Math.sin(theta);
  const headingDeg = (theta * 180) / Math.PI;
  const laneUsage = Math.min((lateral / LANE_WIDTH) * 100, 999);

  return { R, arc, lateral, forward, theta, headingDeg, laneUsage };
}

export function buildTrajectory({
  R,
  theta,
}: Pick<SteeringMetrics, "R" | "theta">): Point[] {
  return Array.from({ length: TRAJECTORY_STEPS + 1 }, (_, i) => {
    const t = (theta * i) / TRAJECTORY_STEPS;
    return {
      x: R * Math.sin(t),
      y: R * (1 - Math.cos(t)),
    };
  });
}

export function getLaneUsageColor(laneUsage: number): string {
  if (laneUsage > 80) return "#E24B4A";
  if (laneUsage > 50) return "#EF9F27";
  return "#1D9E75";
}
