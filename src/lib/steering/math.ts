import { SPEED_MAX_KMH, TRAJECTORY_STEPS } from "./constants";

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
  rearSideLateralShift: number;
};

export type Point = {
  x: number;
  y: number;
};

export function steeringWheelToRoadWheelAngle(
  roadWheelAngleDeg: number,
): number {
  const STEERING_RATIO = 17.0;
  const LOCK_TO_LOCK_TURNS = 2.75;
  const MAX_STEERING_DEG = (LOCK_TO_LOCK_TURNS / 2) * 360; // ±495°
  const MAX_ROAD_WHEEL_DEG = MAX_STEERING_DEG / STEERING_RATIO; // ±29.118°

  const clampedRoadWheel = Math.max(
    -MAX_ROAD_WHEEL_DEG,
    Math.min(MAX_ROAD_WHEEL_DEG, roadWheelAngleDeg),
  );

  return parseFloat((clampedRoadWheel * STEERING_RATIO).toFixed(3));
}

export function calculateMetrics({
  speed,
  angle,
  duration,
  wheelbase,
}: SteeringParams): SteeringMetrics {
  const clampedSpeed = Math.min(speed, SPEED_MAX_KMH);
  const speedMs = clampedSpeed / 3.6;
  const angleRad = (angle * Math.PI) / 180;
  const arc = speedMs * duration;
  const isStraight = Math.abs(angleRad) < 1e-9;

  const R = isStraight ? Number.POSITIVE_INFINITY : wheelbase / Math.tan(angleRad);
  const theta = isStraight ? 0 : arc / R;
  const rearAxleLateral = isStraight ? 0 : R * (1 - Math.cos(theta));
  const lateral = isStraight
    ? 0
    : rearAxleLateral + (wheelbase / 2) * Math.sin(theta);
  const forward = isStraight ? arc : R * Math.sin(theta);
  const headingDeg = isStraight ? 0 : (theta * 180) / Math.PI;
  const rearSideLateralShift = isStraight
    ? 0
    : lateral + (wheelbase / 2) * Math.sin(theta);

  return { R, arc, lateral, forward, theta, headingDeg, rearSideLateralShift };
}

export function buildTrajectory({
  R,
  theta,
  arc,
}: Pick<SteeringMetrics, "R" | "theta" | "arc">): Point[] {
  if (!Number.isFinite(R) || Math.abs(theta) < 1e-12) {
    return Array.from({ length: TRAJECTORY_STEPS + 1 }, (_, i) => {
      const t = i / TRAJECTORY_STEPS;
      return {
        x: arc * t,
        y: 0,
      };
    });
  }

  return Array.from({ length: TRAJECTORY_STEPS + 1 }, (_, i) => {
    const t = (theta * i) / TRAJECTORY_STEPS;
    return {
      x: R * Math.sin(t),
      y: R * (1 - Math.cos(t)),
    };
  });
}
