import {
  LaneSide,
  OvertakePhase,
  RoadLayout,
  SimulationConfig,
  SimulationSnapshot,
  VehicleState,
} from "@/simulation/engine/types";

const toMps = (kmh: number) => kmh / 3.6;
export const CAR_LEFT_SHIFT_ANGLE_DEG = 3;
const CAR_WHEELBASE_METERS = 2.7;

const getLaneCenter = (roadLayout: RoadLayout, lane: LaneSide) =>
  lane === "left" ? roadLayout.leftLaneCenter : roadLayout.rightLaneCenter;

export const legacyRoadLayout: RoadLayout = {
  laneWidth: 2.05,
  medianWidth: 3.6,
  sidewalkWidth: 1.6,
  totalRoadWidth: 20,
  laneDividerZ: 4.625,
  outerEdgeZ: 7.4,
  rightLaneCenter: 4.35,
  leftLaneCenter: 2.3,
};

export const buildTwoLaneRoadLayout = (
  laneWidth: number,
  medianWidth = 3.6,
  sidewalkWidth = 1.6,
): RoadLayout => {
  const laneDividerZ = medianWidth / 2 + laneWidth;
  const outerEdgeZ = medianWidth / 2 + laneWidth * 2;

  return {
    laneWidth,
    medianWidth,
    sidewalkWidth,
    totalRoadWidth: medianWidth + laneWidth * 4 + sidewalkWidth * 2,
    laneDividerZ,
    outerEdgeZ,
    leftLaneCenter: medianWidth / 2 + laneWidth / 2,
    rightLaneCenter: medianWidth / 2 + laneWidth * 1.5,
  };
};

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
  roadLayout: RoadLayout,
  time: number,
  reactionTimeSeconds: number,
) => {
  if (phase === "waiting" && time >= reactionTimeSeconds) {
    return "change-left" as const;
  }

  if (phase === "change-left" && Math.abs(bike.z - roadLayout.leftLaneCenter) <= 0.08) {
    return "pass" as const;
  }

  if (phase === "pass" && bike.x >= car.x + 12) {
    return "return-right" as const;
  }

  if (
    phase === "return-right" &&
    Math.abs(bike.z - roadLayout.rightLaneCenter) <= 0.08 &&
    bike.x >= car.x + 20
  ) {
    return "complete" as const;
  }

  return phase;
};

const targetBikeLane = (phase: OvertakePhase, roadLayout: RoadLayout) => {
  if (phase === "change-left" || phase === "pass") {
    return roadLayout.leftLaneCenter;
  }

  return roadLayout.rightLaneCenter;
};

export const defaultSimulationConfig: SimulationConfig = {
  carSpeedKmh: 18,
  carSteeringAngleDeg: CAR_LEFT_SHIFT_ANGLE_DEG,
  carSteeringDelaySeconds: 0,
  bikeStartSpeedKmh: 45,
  bikeTargetSpeedKmh: 45,
  bikeAcceleration: 4.5,
  reactionTimeSeconds: 1.1,
  laneChangeRate: 3.6,
  roadLayout: legacyRoadLayout,
  initialLane: "right",
};

export const createInitialSnapshot = (
  config: SimulationConfig,
): SimulationSnapshot => {
  const initialLaneCenter = getLaneCenter(config.roadLayout, config.initialLane);
  const initialCarZ = config.initialCarZ ?? initialLaneCenter;
  const initialBikeZ = config.initialBikeZ ?? initialLaneCenter;

  const car: VehicleState = {
    x: 0,
    y: 0,
    z: initialCarZ,
    heading: 0,
    speed: toMps(config.carSpeedKmh),
    width: 2.0,
    length: 4.5,
  };

  const bike: VehicleState = {
    x: -20,
    y: 0,
    z: initialBikeZ,
    heading: 0,
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
    config.roadLayout,
    nextTime,
    config.reactionTimeSeconds,
  );

  const carSpeed = toMps(config.carSpeedKmh);
  const activeCarSteeringAngleDeg =
    nextTime >= (config.carSteeringDelaySeconds ?? 0)
      ? config.carSteeringAngleDeg
      : 0;
  const carSteeringAngleRad = (activeCarSteeringAngleDeg * Math.PI) / 180;
  const carYawRate =
    carSpeed === 0
      ? 0
      : (-carSpeed / CAR_WHEELBASE_METERS) * Math.tan(carSteeringAngleRad);
  const nextCarHeading = snapshot.car.heading + carYawRate * dt;
  const averageCarHeading = (snapshot.car.heading + nextCarHeading) / 2;
  const bikeTargetSpeed =
    nextPhase === "waiting"
      ? toMps(config.bikeStartSpeedKmh)
      : toMps(config.bikeTargetSpeedKmh);

  const car: VehicleState = {
    ...snapshot.car,
    speed: carSpeed,
    heading: nextCarHeading,
    x: snapshot.car.x + carSpeed * Math.cos(averageCarHeading) * dt,
    z: snapshot.car.z + carSpeed * Math.sin(averageCarHeading) * dt,
  };

  const bikeSpeed = moveTowards(
    snapshot.bike.speed,
    bikeTargetSpeed,
    config.bikeAcceleration * dt,
  );
  const bikeLaneTarget =
    config.fixedBikeZ ?? targetBikeLane(nextPhase, config.roadLayout);

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
