"use client";

type SteeringDiagramProps = {
  angle: number;
};

const VIEWBOX = { width: 680, height: 480 };
const CENTER = { x: 340, y: 380 };
const AXIS_LENGTH = 300;
const WHEEL = { width: 40, height: 100, rx: 8 };
const ARC_RADIUS = 85;

function toRadians(deg: number) {
  return deg * (Math.PI / 180);
}

function getSteeringEnd(angle: number, length: number) {
  const r = toRadians(angle);
  return {
    x: CENTER.x + Math.sin(r) * length,
    y: CENTER.y - Math.cos(r) * length,
  };
}

function ArrowMarker() {
  return (
    <defs>
      <marker
        id="arrow"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path
          d="M2 1L8 5L2 9"
          fill="none"
          stroke="context-stroke"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </marker>
    </defs>
  );
}

function ForwardAxis() {
  return (
    <>
      <line
        x1={CENTER.x}
        y1={CENTER.y}
        x2={CENTER.x}
        y2={CENTER.y - AXIS_LENGTH}
        stroke="var(--color-text-tertiary)"
        strokeWidth="1.5"
        strokeDasharray="8 6"
        markerEnd="url(#arrow)"
        opacity="0.55"
      />
      <text
        x={CENTER.x + 14}
        y={CENTER.y - AXIS_LENGTH + 14}
        fontSize={14}
        fill="var(--color-text-secondary)"
      >
        forward
      </text>
      <text
        x={CENTER.x + 14}
        y={CENTER.y + 26}
        fontSize={14}
        fill="var(--color-text-secondary)"
      >
        car axis
      </text>
    </>
  );
}

function SteeringAxis({ angle }: { angle: number }) {
  const end = getSteeringEnd(angle, AXIS_LENGTH);
  return (
    <line
      x1={CENTER.x}
      y1={CENTER.y}
      x2={end.x}
      y2={end.y}
      stroke="#1D9E75"
      strokeWidth="3"
      markerEnd="url(#arrow)"
      opacity="0.95"
    />
  );
}

function AngleArc({ angle }: { angle: number }) {
  const arcEnd = getSteeringEnd(angle, ARC_RADIUS);
  const largeArc = angle > 180 ? 1 : 0;
  return (
    <path
      d={`M ${CENTER.x} ${CENTER.y - ARC_RADIUS} A ${ARC_RADIUS} ${ARC_RADIUS} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`}
      fill="none"
      stroke="#D85A30"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  );
}

function AngleLabel({ angle }: { angle: number }) {
  const end = getSteeringEnd(angle, ARC_RADIUS);
  return (
    <text
      x={end.x + 10}
      y={end.y - 10}
      fontSize={20}
      fill="#D85A30"
      fontWeight="500"
    >
      δ = {angle}°
    </text>
  );
}

const TREAD_Y_OFFSETS = [20, 38, 56, 74];

function Wheel({ angle }: { angle: number }) {
  return (
    <g
      transform={`translate(${CENTER.x},${CENTER.y}) rotate(${angle}) translate(${-CENTER.x},${-CENTER.y})`}
    >
      <rect
        x={CENTER.x - WHEEL.width / 2}
        y={CENTER.y - WHEEL.height}
        width={WHEEL.width}
        height={WHEEL.height}
        rx={WHEEL.rx}
        fill="#1D9E75"
        opacity={0.9}
      />
      {TREAD_Y_OFFSETS.map((offset) => (
        <line
          key={offset}
          x1={CENTER.x - WHEEL.width / 2 + 2}
          y1={CENTER.y - WHEEL.height + offset}
          x2={CENTER.x + WHEEL.width / 2 - 2}
          y2={CENTER.y - WHEEL.height + offset}
          stroke="white"
          strokeWidth="1.5"
          opacity="0.4"
        />
      ))}
    </g>
  );
}

function Legend() {
  return (
    <>
      <line
        x1={60}
        y1={420}
        x2={100}
        y2={420}
        stroke="#1D9E75"
        strokeWidth="3"
      />
      <text x={108} y={425} fontSize={13} fill="var(--color-text-secondary)">
        steering direction
      </text>

      <line
        x1={60}
        y1={448}
        x2={100}
        y2={448}
        stroke="var(--color-text-tertiary)"
        strokeWidth="1.5"
        strokeDasharray="8 5"
      />
      <text x={108} y={453} fontSize={13} fill="var(--color-text-secondary)">
        car forward axis
      </text>

      <line
        x1={280}
        y1={420}
        x2={320}
        y2={420}
        stroke="#D85A30"
        strokeWidth="2.5"
      />
      <text x={328} y={425} fontSize={13} fill="var(--color-text-secondary)">
        steering angle δ
      </text>
    </>
  );
}

export default function SteeringDiagram({ angle }: SteeringDiagramProps) {
  const leftAngle = -angle;
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      width="100%"
      style={{ maxWidth: VIEWBOX.width }}
    >
      <ArrowMarker />
      <ForwardAxis />
      <AngleArc angle={leftAngle} />
      <SteeringAxis angle={leftAngle} />
      <AngleLabel angle={angle} />
      <Wheel angle={leftAngle} />
      <Legend />
    </svg>
  );
}
