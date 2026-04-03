type VehicleMeshProps = {
  position: [number, number, number];
  color: string;
  size: [number, number, number];
  yaw?: number;
};

export default function VehicleMesh({
  position,
  color,
  size,
  yaw = 0,
}: VehicleMeshProps) {
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
