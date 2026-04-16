export type OvertakePhase =
  | "waiting"
  | "change-left"
  | "pass"
  | "return-right"
  | "complete";

export type LaneSide = "left" | "right";

export type VehicleState = {
  x: number;
  y: number;
  z: number;
  heading: number;
  speed: number;
  width: number;
  length: number;
};

export type SimulationConfig = {
  carSpeedKmh: number;
  carSteeringAngleDeg: number;
  carSteeringDelaySeconds?: number;
  bikeStartSpeedKmh: number;
  bikeTargetSpeedKmh: number;
  bikeAcceleration: number;
  reactionTimeSeconds: number;
  laneChangeRate: number;
  roadLayout: RoadLayout;
  initialLane: LaneSide;
  initialCarZ?: number;
  initialBikeZ?: number;
  fixedBikeZ?: number;
};

export type RoadLayout = {
  laneWidth: number;
  medianWidth: number;
  sidewalkWidth: number;
  totalRoadWidth: number;
  laneDividerZ: number;
  outerEdgeZ: number;
  rightLaneCenter: number;
  leftLaneCenter: number;
};

export type SimulationSnapshot = {
  time: number;
  phase: OvertakePhase;
  car: VehicleState;
  bike: VehicleState;
  relativeSpeed: number;
  longitudinalClearance: number;
  lateralClearance: number;
  timeToCollision: number;
  collision: boolean;
  warning: boolean;
};
