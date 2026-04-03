import {
  OvertakePhase,
  SimulationConfig,
  SimulationSnapshot,
  VehicleState,
} from "@/simulation/engine/types";

export const LANES = {
  // Tuned positions on the positive-Z carriageway:
  // `right` keeps the car's left side at ~1.5m from the left road boundary.
  right: 4.35,
  // Overtake lane (closer to median) while still inside drivable surface.
  left: 2.3,
} as const;

const toMps = (kmh: number) => kmh / 3.6;
export const CAR_LEFT_SHIFT_ANGLE_DEG = 3;
const CAR_LEFT_SHIFT_ANGLE_RAD = (CAR_LEFT_SHIFT_ANGLE_DEG * Math.PI) / 180;

const moveTowards = (current: number, target: number, maxStep: number) => {
  if (Math.abs(target - current) <= maxStep) {
    return target;
  }

  return current + Math.sign(target - current) * maxStep;
};

const computePhase = (
  phase: OvertakePhase,
  bike: VehicleState,
  car: VehicleState,
  time: number,
  reactionTimeSeconds: number,
) => {
  if (phase === "waiting" && time >= reactionTimeSeconds) {
    return "change-left" as const;
  }

  if (phase === "change-left" && Math.abs(bike.z - LANES.left) <= 0.08) {
    return "pass" as const;
  }

  if (phase === "pass" && bike.x >= car.x + 12) {
    return "return-right" as const;
  }

  if (
    phase === "return-right" &&
    Math.abs(bike.z - LANES.right) <= 0.08 &&
    bike.x >= car.x + 20
  ) {
    return "complete" as const;
  }

  return phase;
};

const targetBikeLane = (phase: OvertakePhase) => {
  if (phase === "change-left" || phase === "pass") {
    return LANES.left;
  }

  return LANES.right;
};

export const defaultSimulationConfig: SimulationConfig = {
  carSpeedKmh: 18,
  bikeStartSpeedKmh: 45,
  bikeTargetSpeedKmh: 45,
  bikeAcceleration: 4.5,
  reactionTimeSeconds: 1.1,
  laneChangeRate: 3.6,
};

export const createInitialSnapshot = (
  config: SimulationConfig,
): SimulationSnapshot => {
  const car: VehicleState = {
    x: 0,
    y: 0,
    z: LANES.right,
    speed: toMps(config.carSpeedKmh),
    width: 2.0,
    length: 4.5,
  };

  const bike: VehicleState = {
    x: -20,
    y: 0,
    z: LANES.right,
    speed: toMps(config.bikeStartSpeedKmh),
    width: 0.9,
    length: 2.2,
  };

  return {
    time: 0,
    phase: "waiting",
    car,
    bike,
    relativeSpeed: bike.speed - car.speed,
    longitudinalClearance: 0,
    lateralClearance: 0,
    timeToCollision: Number.POSITIVE_INFINITY,
    collision: false,
    warning: false,
  };
};

export const advanceSnapshot = (
  snapshot: SimulationSnapshot,
  dt: number,
  config: SimulationConfig,
): SimulationSnapshot => {
  const nextTime = snapshot.time + dt;
  const nextPhase = computePhase(
    snapshot.phase,
    snapshot.bike,
    snapshot.car,
    nextTime,
    config.reactionTimeSeconds,
  );

  const carSpeed = toMps(config.carSpeedKmh);
  const bikeTargetSpeed =
    nextPhase === "waiting"
      ? toMps(config.bikeStartSpeedKmh)
      : toMps(config.bikeTargetSpeedKmh);

  const car: VehicleState = {
    ...snapshot.car,
    speed: carSpeed,
    x: snapshot.car.x + carSpeed * dt,
    z: snapshot.car.z - carSpeed * Math.tan(CAR_LEFT_SHIFT_ANGLE_RAD) * dt,
  };

  const bikeSpeed = moveTowards(
    snapshot.bike.speed,
    bikeTargetSpeed,
    config.bikeAcceleration * dt,
  );
  const bikeLaneTarget = targetBikeLane(nextPhase);

  const bike: VehicleState = {
    ...snapshot.bike,
    speed: bikeSpeed,
    x: snapshot.bike.x + bikeSpeed * dt,
    z: moveTowards(snapshot.bike.z, bikeLaneTarget, config.laneChangeRate * dt),
  };

  const dx = bike.x - car.x;
  const dz = bike.z - car.z;
  const halfLength = (bike.length + car.length) / 2;
  const halfWidth = (bike.width + car.width) / 2;

  const longitudinalClearance = Math.abs(dx) - halfLength;
  const lateralClearance = Math.abs(dz) - halfWidth;
  const collision = Math.abs(dx) < halfLength && Math.abs(dz) < halfWidth;
  const warning = longitudinalClearance < 4 || lateralClearance < 0.7;

  const closingDistance = car.x - bike.x - halfLength;
  const relativeSpeed = bike.speed - car.speed;
  const timeToCollision =
    relativeSpeed > 0 && closingDistance > 0
      ? closingDistance / relativeSpeed
      : Number.POSITIVE_INFINITY;

  return {
    time: nextTime,
    phase: nextPhase,
    car,
    bike,
    relativeSpeed,
    longitudinalClearance,
    lateralClearance,
    timeToCollision,
    collision,
    warning,
  };
};
