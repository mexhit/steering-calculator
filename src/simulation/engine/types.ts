export type OvertakePhase =
  | "waiting"
  | "change-left"
  | "pass"
  | "return-right"
  | "complete";

export type VehicleState = {
  x: number;
  y: number;
  z: number;
  speed: number;
  width: number;
  length: number;
};

export type SimulationConfig = {
  carSpeedKmh: number;
  bikeStartSpeedKmh: number;
  bikeTargetSpeedKmh: number;
  bikeAcceleration: number;
  reactionTimeSeconds: number;
  laneChangeRate: number;
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
