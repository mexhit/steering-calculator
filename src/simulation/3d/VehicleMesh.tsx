import { Suspense, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import type { Group, Material, Mesh } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const renaultClioGlbPath = "/models/renault_clio_5door_2010.glb";
const hondaAdvFbxPath = "/models/honda_adv_350_2025.fbx";
const hondaPcxPaintMaterialNames = new Set(["Body", "PCX AZUL-Lateral"]);
const hondaAdvBodyMeshNames = new Set([
  "cuerpo_principal",
  "cuerpo_principal_palstico_brillante",
  "cuerpo_principal_plastico",
  "guardafango_delantero",
  "guardafango_delantero_gloss",
  "cubre_manetas",
  "pantalla",
  "soporte_cupula",
  "marco_luz_delantera",
  "marco_reflector_delantero",
]);
const hondaAdvGreyColor = "#8a8f98";

type VehicleVariant = "box" | "renault-clio" | "honda-pcx";

type VehicleMeshProps = {
  position: [number, number, number];
  color: string;
  size: [number, number, number];
  yaw?: number;
  variant?: VehicleVariant;
};

function BoxVehicleMesh({
  position,
  color,
  size,
  yaw = 0,
}: Omit<VehicleMeshProps, "variant">) {
  return (
    <group position={position} rotation={[0, Math.PI / 2 + yaw, 0]}>
      <mesh castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[0, size[1] * 0.55, 0]} castShadow>
        <boxGeometry args={[size[0] * 0.7, size[1] * 0.4, size[2] * 0.55]} />
        <meshStandardMaterial color="#f0f4ff" opacity={0.8} transparent />
      </mesh>
    </group>
  );
}

function RenaultClioMesh({
  position,
  size,
  yaw = 0,
}: Omit<VehicleMeshProps, "color" | "variant">) {
  const groundClearanceOffsetMeters = 0.29;
  const modelWidthUnits = 205.87;
  const modelHeightUnits = 170.36;
  const modelHalfHeightUnits = modelHeightUnits / 2;
  const gltf = useLoader(GLTFLoader, renaultClioGlbPath);
  const object = gltf.scene as Group;

  const uniformScale = size[0] / modelWidthUnits;
  const renderedHeight = modelHeightUnits * uniformScale;
  const groundedPosition: [number, number, number] = [
    position[0],
    position[1] - renderedHeight / 2 + groundClearanceOffsetMeters,
    position[2],
  ];

  useEffect(() => {
    object.traverse((child) => {
      child.castShadow = true;
      child.receiveShadow = true;

      const mesh = child as Mesh;
      if (!("isMesh" in mesh) || !mesh.isMesh) {
        return;
      }

      const materialList = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materialList.forEach((material) => {
        if (!material) {
          return;
        }

        const nextMaterial = material as Material & {
          name?: string;
          opacity?: number;
          transparent?: boolean;
          depthWrite?: boolean;
        };
        const materialName = nextMaterial.name?.toLowerCase() ?? "";
        const isGlass = materialName.includes("glass");

        nextMaterial.transparent = isGlass;
        nextMaterial.opacity = isGlass
          ? Math.min(nextMaterial.opacity ?? 0.3, 0.35)
          : 1;
        nextMaterial.depthWrite = !isGlass;
        nextMaterial.needsUpdate = true;
      });
    });
  }, [object]);

  return (
    <group position={groundedPosition} rotation={[0, Math.PI / 2 + yaw, 0]}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={uniformScale}>
        <group position={[0, -modelHalfHeightUnits, 0]}>
          <primitive object={object} />
        </group>
      </group>
    </group>
  );
}

function HondaPcxMesh({
  position,
  color,
  size,
  yaw = 0,
}: Omit<VehicleMeshProps, "variant">) {
  const groundClearanceOffsetMeters = -0.08;
  const modelWidthUnits = 89.4;
  const modelHeightUnits = 132.63;
  const object = useLoader(FBXLoader, hondaAdvFbxPath) as Group;
  const uniformScale = size[0] / modelWidthUnits;
  const renderedHeight = modelHeightUnits * uniformScale;
  const groundedPosition: [number, number, number] = [
    position[0],
    position[1] - renderedHeight / 2 + groundClearanceOffsetMeters,
    position[2],
  ];

  useEffect(() => {
    object.traverse((child) => {
      child.castShadow = true;
      child.receiveShadow = true;

      const mesh = child as Mesh;
      if (!("isMesh" in mesh) || !mesh.isMesh) {
        return;
      }

      const shouldTintHondaAdvMesh = hondaAdvBodyMeshNames.has(mesh.name);

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((material) => {
          if (!material) {
            return material;
          }

          const nextMaterial = material.clone() as Material & {
            name?: string;
            color?: { set: (value: string) => void };
          };

          if (
            ((nextMaterial.name &&
              hondaPcxPaintMaterialNames.has(nextMaterial.name)) ||
              shouldTintHondaAdvMesh) &&
            nextMaterial.color
          ) {
            nextMaterial.color.set(hondaAdvGreyColor);
          }

          nextMaterial.needsUpdate = true;
          return nextMaterial;
        });

        return;
      }

      if (!mesh.material) {
        return;
      }

      const nextMaterial = mesh.material.clone() as Material & {
        name?: string;
        color?: { set: (value: string) => void };
      };

      if (
        ((nextMaterial.name &&
          hondaPcxPaintMaterialNames.has(nextMaterial.name)) ||
          shouldTintHondaAdvMesh) &&
        nextMaterial.color
      ) {
        nextMaterial.color.set(hondaAdvGreyColor);
      }

      nextMaterial.needsUpdate = true;
      mesh.material = nextMaterial;
    });
  }, [color, object]);

  return (
    <group position={groundedPosition} rotation={[0, Math.PI / 2 + yaw, 0]}>
      <group rotation={[0, 0, 0]} scale={uniformScale}>
        <primitive object={object} />
      </group>
    </group>
  );
}

export default function VehicleMesh({
  position,
  color,
  size,
  yaw = 0,
  variant = "box",
}: VehicleMeshProps) {
  if (variant === "renault-clio") {
    return (
      <Suspense fallback={null}>
        <RenaultClioMesh position={position} size={size} yaw={yaw} />
      </Suspense>
    );
  }

  if (variant === "honda-pcx") {
    return (
      <Suspense fallback={null}>
        <HondaPcxMesh position={position} color={color} size={size} yaw={yaw} />
      </Suspense>
    );
  }

  return (
    <BoxVehicleMesh position={position} color={color} size={size} yaw={yaw} />
  );
}

useLoader.preload(GLTFLoader, renaultClioGlbPath);
useLoader.preload(FBXLoader, hondaAdvFbxPath);
