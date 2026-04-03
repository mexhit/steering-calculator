"use client";

import { useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { PCFShadowMap, Vector3 } from "three";
import Road from "@/simulation/3d/Road";
import VehicleMesh from "@/simulation/3d/VehicleMesh";
import { CAR_LEFT_SHIFT_ANGLE_DEG } from "@/simulation/engine/physics";
import { SimulationSnapshot } from "@/simulation/engine/types";

export type CameraMode = "orbit" | "chase-bike" | "follow-car" | "top";

type CameraRigProps = {
  snapshot: SimulationSnapshot;
  mode: CameraMode;
  distance: number;
};

function CameraRig({ snapshot, mode, distance }: CameraRigProps) {
  const { camera } = useThree();
  const lookAtTarget = useMemo(() => new Vector3(), []);
  const desiredPosition = useMemo(() => new Vector3(), []);

  useFrame(() => {
    if (mode === "orbit") {
      return;
    }

    const centerX = (snapshot.car.x + snapshot.bike.x) / 2;
    const centerZ = (snapshot.car.z + snapshot.bike.z) / 2;

    lookAtTarget.set(centerX, 0.5, centerZ);

    if (mode === "chase-bike") {
      desiredPosition.set(
        snapshot.bike.x - 1.8 * distance,
        0.9 + 0.45 * distance,
        snapshot.bike.z + 1.1 * distance,
      );
    } else if (mode === "follow-car") {
      desiredPosition.set(
        snapshot.car.x - 2.4 * distance,
        1.1 + 0.4 * distance,
        snapshot.car.z + 1.3 * distance,
      );
    } else {
      desiredPosition.set(centerX, 2 + distance * 2.2, centerZ + 0.001);
    }

    camera.position.lerp(desiredPosition, 0.1);
    camera.lookAt(lookAtTarget);
  });

  return null;
}

type SimulationSceneProps = {
  snapshot: SimulationSnapshot;
  cameraMode: CameraMode;
  cameraDistance: number;
};

export default function SimulationScene({
  snapshot,
  cameraMode,
  cameraDistance,
}: SimulationSceneProps) {
  const carYaw = (CAR_LEFT_SHIFT_ANGLE_DEG * Math.PI) / 180;

  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      camera={{ position: [0, 10, 14], fov: 48 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#0c1018"]} />
      <ambientLight intensity={0.46} />
      <directionalLight
        castShadow
        position={[20, 26, 14]}
        intensity={1.05}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Road />

      <VehicleMesh
        position={[snapshot.car.x, snapshot.car.y + 0.55, snapshot.car.z]}
        size={[snapshot.car.width, 1.1, snapshot.car.length]}
        color="#3b82f6"
        yaw={carYaw}
      />
      <VehicleMesh
        position={[snapshot.bike.x, snapshot.bike.y + 0.4, snapshot.bike.z]}
        size={[snapshot.bike.width, 0.8, snapshot.bike.length]}
        color="#ef4444"
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[460, 120]} />
        <meshStandardMaterial color="#121827" />
      </mesh>

      <CameraRig
        snapshot={snapshot}
        mode={cameraMode}
        distance={cameraDistance}
      />
      <OrbitControls
        enabled={cameraMode === "orbit"}
        makeDefault
        target={[
          (snapshot.car.x + snapshot.bike.x) / 2,
          0.5,
          (snapshot.car.z + snapshot.bike.z) / 2,
        ]}
        minDistance={4}
        maxDistance={90}
        maxPolarAngle={Math.PI / 2.03}
      />
    </Canvas>
  );
}
