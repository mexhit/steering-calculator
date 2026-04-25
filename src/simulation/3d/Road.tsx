import { useMemo } from "react";
import * as THREE from "three";
import { RoadLayout } from "@/simulation/engine/types";

// ── Types ──────────────────────────────────────────────────────────────────

type Vec3 = [number, number, number];

interface BushProps {
  position: Vec3;
  scale?: number;
  color?: string;
}

interface ArchStructureProps {
  position: Vec3;
}

interface PlanterBoxProps {
  position: Vec3;
  length?: number;
}

interface RoundaboutProps {
  position: Vec3;
  outerRadius?: number;
  innerRadius?: number;
}

interface TreeProps {
  position: Vec3;
  trunkColor?: string;
  leafColor?: string;
  scale?: number;
}

interface DashedLineProps {
  z: number;
  dashLength?: number;
  gap?: number;
  count?: number;
  y?: number;
}

interface SolidLineProps {
  z: number;
  length?: number;
  color?: string;
  width?: number;
  y?: number;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Bush({ position, scale = 1, color = "#3a7d44" }: BushProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15 * scale, 0]}>
        <sphereGeometry args={[0.18 * scale, 7, 6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0.12 * scale, 0.1 * scale, 0.08 * scale]}>
        <sphereGeometry args={[0.12 * scale, 6, 5]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[-0.1 * scale, 0.08 * scale, -0.05 * scale]}>
        <sphereGeometry args={[0.1 * scale, 6, 5]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  );
}

function ArchStructure({ position }: ArchStructureProps) {
  return (
    <group position={position}>
      {/* Base platform */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 1.2]} />
        <meshStandardMaterial color="#c8a84b" />
      </mesh>
      {/* Left pillar */}
      <mesh position={[-0.9, 0.3, 0]}>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color="#b8942a" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Right pillar */}
      <mesh position={[0.9, 0.3, 0]}>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color="#b8942a" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Arch top */}
      <mesh position={[0, 0.62, 0]}>
        <torusGeometry args={[0.9, 0.06, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Inner fill (semi-transparent green) */}
      <mesh position={[0, 0.32, 0]}>
        <planeGeometry args={[1.6, 0.6]} />
        <meshStandardMaterial
          color="#4a8c55"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function PlanterBox({ position, length = 1.2 }: PlanterBoxProps) {
  return (
    <group position={position}>
      {/* Box */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[length, 0.16, 0.5]} />
        <meshStandardMaterial color="#8B6914" roughness={0.8} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length - 0.05, 0.45]} />
        <meshStandardMaterial color="#4a3520" roughness={1} />
      </mesh>
      {/* Small plants in box */}
      {([-0.3, 0, 0.3] as number[]).slice(0, Math.ceil(length)).map((x, i) => (
        <mesh key={i} position={[x * (length / 1.2), 0.25, 0]}>
          <sphereGeometry args={[0.1, 6, 5]} />
          <meshStandardMaterial color="#5aaa66" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Roundabout({
  position,
  outerRadius = 4.8,
  innerRadius = 2.5,
}: RoundaboutProps) {
  const shrubOffsets = useMemo<Vec3[]>(
    () => [
      [0, 0.1, 0],
      [0.85, 0.08, 0.55],
      [-0.8, 0.08, -0.45],
      [0.2, 0.08, -0.9],
    ],
    [],
  );

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <ringGeometry args={[innerRadius, outerRadius, 40]} />
        <meshStandardMaterial color="#4b5563" roughness={0.96} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
        <ringGeometry args={[innerRadius - 0.14, innerRadius + 0.14, 40]} />
        <meshStandardMaterial color="#f3f4f6" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0]}>
        <circleGeometry args={[innerRadius - 0.18, 40]} />
        <meshStandardMaterial color="#2d5e35" roughness={1} />
      </mesh>
      {shrubOffsets.map((offset, index) => (
        <Bush
          key={`roundabout-bush-${index}`}
          position={offset}
          scale={0.95}
          color={index % 2 === 0 ? "#3c7a46" : "#4a8c4a"}
        />
      ))}
    </group>
  );
}

function Tree({
  position,
  trunkColor = "#6b4226",
  leafColor = "#2d6e3a",
  scale = 1,
}: TreeProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25 * scale, 0]}>
        <cylinderGeometry args={[0.07 * scale, 0.1 * scale, 0.5 * scale, 7]} />
        <meshStandardMaterial color={trunkColor} roughness={1} />
      </mesh>
      <mesh position={[0, 0.65 * scale, 0]}>
        <sphereGeometry args={[0.35 * scale, 8, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.9} />
      </mesh>
      <mesh position={[0.15 * scale, 0.55 * scale, 0.1 * scale]}>
        <sphereGeometry args={[0.22 * scale, 7, 6]} />
        <meshStandardMaterial color="#358040" roughness={0.9} />
      </mesh>
    </group>
  );
}

function DashedLine({
  z,
  dashLength = 3,
  gap = 2,
  count = 30,
  y = 0.012,
}: DashedLineProps) {
  const dashes = useMemo<number[]>(() => {
    const arr: number[] = [];
    const total = dashLength + gap;
    for (let i = 0; i < count; i++) {
      arr.push(i * total - (count * total) / 2 + dashLength / 2);
    }
    return arr;
  }, [count, dashLength, gap]);

  return (
    <>
      {dashes.map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, y, z]}>
          <planeGeometry args={[dashLength, 0.12]} />
          <meshStandardMaterial color="#f0e060" />
        </mesh>
      ))}
    </>
  );
}

function SolidLine({
  z,
  length = 320,
  color = "#f0e060",
  width = 0.12,
  y = 0.012,
}: SolidLineProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, z]}>
      <planeGeometry args={[length, width]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

// Road layout:
//  Total width: ~20 units
//  Median island: 6.0 units wide (centre)
//  Bike lanes: 1.2 units each side (adjacent to median)
//  Traffic lanes: 2 lanes each side, divided by dashed line
//  Sidewalks: outer edges

type RoadProps = {
  layout: RoadLayout;
};

export default function Road({ layout }: RoadProps) {
  const roadLength = 320;
  const roadStartX = -roadLength / 2;
  const roadEndX = roadLength / 2;
  const medianHalf = layout.medianWidth / 2;
  const sidewalkCenterZ = layout.outerEdgeZ + layout.sidewalkWidth / 2;
  const connectorLength = 20;
  const initialCarFrontX = 2.25;
  const connectorStartX = initialCarFrontX;
  const connectorEndX = connectorStartX + connectorLength;
  const connectorCenterX = connectorStartX + connectorLength / 2;
  const connectorClearance = 4;
  const medianCurbDepth = 0.1;
  const roundaboutOuterRadius = layout.medianWidth / 2;
  const roundaboutInnerRadius = Math.max(roundaboutOuterRadius - 1.5, 2.2);
  const leftMedianLength = connectorStartX - roadStartX;
  const rightMedianLength = roadEndX - connectorEndX;
  const leftMedianCenterX = roadStartX + leftMedianLength / 2;
  const rightMedianCenterX = connectorEndX + rightMedianLength / 2;

  const archPositions = useMemo<number[]>(() => {
    const positions: number[] = [];
    for (let x = -135; x <= 135; x += 30) positions.push(x);
    return positions;
  }, []);

  const treePositions = useMemo<number[]>(() => {
    const positions: number[] = [];
    for (let x = -150; x <= 150; x += 8) positions.push(x);
    return positions;
  }, []);

  const planterPositions = useMemo<number[]>(() => {
    const positions: number[] = [];
    for (let x = -148; x <= 148; x += 5) positions.push(x);
    return positions;
  }, []);

  const sidewalkTreeXPositions = useMemo<number[]>(
    () => Array.from({ length: 25 }, (_, i) => i * 12 - 144),
    [],
  );

  return (
    <group>
      {/* ── OUTER ROAD SURFACE ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[roadLength, layout.totalRoadWidth]} />
        <meshStandardMaterial color="#2a2e38" roughness={0.95} />
      </mesh>

      {/* ── MEDIAN BASE ── */}
      {(
        [
          { key: "west", centerX: leftMedianCenterX, length: leftMedianLength },
          {
            key: "east",
            centerX: rightMedianCenterX,
            length: rightMedianLength,
          },
        ] as const
      ).map(({ key, centerX, length }) => (
        <mesh
          key={`median-base-${key}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[centerX, 0.02, 0]}
        >
          <planeGeometry args={[length, layout.medianWidth]} />
          <meshStandardMaterial color="#1e2128" roughness={0.9} />
        </mesh>
      ))}

      {/* ── MEDIAN GREEN STRIP ── */}
      {(
        [
          { key: "west", centerX: leftMedianCenterX, length: leftMedianLength },
          {
            key: "east",
            centerX: rightMedianCenterX,
            length: rightMedianLength,
          },
        ] as const
      ).map(({ key, centerX, length }) => (
        <mesh
          key={`median-green-${key}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[centerX, 0.04, 0]}
        >
          <planeGeometry
            args={[length, Math.max(layout.medianWidth - 0.4, 1.2)]}
          />
          <meshStandardMaterial color="#2d5e35" roughness={1} />
        </mesh>
      ))}

      {/* ── SIDEWALKS ── */}
      {([-sidewalkCenterZ, sidewalkCenterZ] as number[]).map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, z]}>
          <planeGeometry args={[roadLength, layout.sidewalkWidth]} />
          <meshStandardMaterial color="#888c94" roughness={0.9} />
        </mesh>
      ))}

      {/* ── CONNECTOR OPENING ── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[connectorCenterX, 0.015, 0]}
      >
        <planeGeometry args={[connectorLength, layout.totalRoadWidth]} />
        <meshStandardMaterial color="#2a2e38" roughness={0.95} />
      </mesh>
      <Roundabout
        position={[connectorCenterX, 0, 0]}
        outerRadius={roundaboutOuterRadius}
        innerRadius={roundaboutInnerRadius}
      />

      {/* ── LANE MARKINGS ── */}

      {/* Dashed white: lane divider at center of each carriageway */}
      <DashedLine
        z={-layout.laneDividerZ}
        dashLength={2.5}
        gap={2}
        count={55}
        y={0.02}
      />
      <DashedLine
        z={layout.laneDividerZ}
        dashLength={2.5}
        gap={2}
        count={55}
        y={0.02}
      />

      {/* Solid white: outer road edge */}
      <SolidLine z={-layout.outerEdgeZ} color="#d9d6be" width={0.16} y={0.02} />
      <SolidLine z={layout.outerEdgeZ} color="#d9d6be" width={0.16} y={0.02} />

      {/* ── MEDIAN CURB EDGES ── */}
      {([-medianHalf, medianHalf] as number[]).map((z) => (
        <group key={`median-curb-${z}`}>
          <mesh
            position={[
              leftMedianCenterX,
              0.06,
              z - Math.sign(z) * (medianCurbDepth / 2),
            ]}
          >
            <boxGeometry args={[leftMedianLength, 0.12, medianCurbDepth]} />
            <meshStandardMaterial color="#c8c0a0" roughness={0.8} />
          </mesh>
          <mesh
            position={[
              rightMedianCenterX,
              0.06,
              z - Math.sign(z) * (medianCurbDepth / 2),
            ]}
          >
            <boxGeometry args={[rightMedianLength, 0.12, medianCurbDepth]} />
            <meshStandardMaterial color="#c8c0a0" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ── MEDIAN ARCH STRUCTURES ── */}
      {archPositions
        .filter(
          (x) =>
            x < connectorStartX - connectorClearance ||
            x > connectorEndX + connectorClearance,
        )
        .map((x) => (
          <ArchStructure key={`arch-n-${x}`} position={[x, 0.04, -0.5]} />
        ))}
      {archPositions
        .filter(
          (x) =>
            x < connectorStartX - connectorClearance ||
            x > connectorEndX + connectorClearance,
        )
        .map((x) => (
          <ArchStructure key={`arch-s-${x}`} position={[x, 0.04, 0.5]} />
        ))}

      {/* ── MEDIAN TREES ── */}
      {treePositions
        .filter(
          (x) =>
            x < connectorStartX - connectorClearance ||
            x > connectorEndX + connectorClearance,
        )
        .filter((_, i) => i % 3 === 0)
        .map((x) => (
          <Tree
            key={`tree-${x}`}
            position={[x, 0.04, 0]}
            scale={1.4}
            leafColor="#2e7d42"
          />
        ))}

      {/* ── MEDIAN SHRUBS ── */}
      {treePositions
        .filter(
          (x) =>
            x < connectorStartX - connectorClearance ||
            x > connectorEndX + connectorClearance,
        )
        .filter((_, i) => i % 3 !== 0)
        .map((x) => (
          <Bush
            key={`bush-${x}`}
            position={[x, 0.04, x % 2 === 0 ? 0.5 : -0.5]}
            scale={1.1}
            color={x % 4 === 0 ? "#3a7d44" : "#4a8c4a"}
          />
        ))}

      {/* ── PLANTER BOXES ── */}
      {planterPositions
        .filter(
          (x) =>
            x < connectorStartX - connectorClearance ||
            x > connectorEndX + connectorClearance,
        )
        .map((x) => (
          <PlanterBox
            key={`planter-n-${x}`}
            position={[x, 0.02, -(medianHalf - 0.5)]}
            length={3.5}
          />
        ))}
      {planterPositions
        .filter(
          (x) =>
            x < connectorStartX - connectorClearance ||
            x > connectorEndX + connectorClearance,
        )
        .map((x) => (
          <PlanterBox
            key={`planter-s-${x}`}
            position={[x, 0.02, medianHalf - 0.5]}
            length={3.5}
          />
        ))}

      {/* ── SIDEWALK TREES ── */}
      {sidewalkTreeXPositions.map((x) => (
        <Tree
          key={`stree-n-${x}`}
          position={[x, 0.03, -sidewalkCenterZ]}
          scale={1.0}
          leafColor="#265c30"
        />
      ))}
      {sidewalkTreeXPositions.map((x) => (
        <Tree
          key={`stree-s-${x}`}
          position={[x, 0.03, sidewalkCenterZ]}
          scale={1.0}
          leafColor="#265c30"
        />
      ))}
    </group>
  );
}
