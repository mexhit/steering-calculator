"use client";

type SteeringDiagramProps = {
  angle: number;
};

export default function SteeringDiagram({ angle }: SteeringDiagramProps) {
  const angleRadians = angle * (Math.PI / 180);
  const cx = 100;
  const cy = 80;
  const axisLen = 50;
  const wheelW = 10;
  const wheelH = 28;
  const dx = Math.sin(angleRadians) * axisLen;
  const dy = -Math.cos(angleRadians) * axisLen;

  return (
    <svg viewBox="0 0 200 160" width="100%" style={{ maxWidth: 200 }}>
      <defs>
        <marker
          id="arr2"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
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

      <line
        x1={cx}
        y1={cy + 20}
        x2={cx}
        y2={cy - axisLen}
        stroke="var(--muted-color)"
        strokeWidth={1}
        strokeDasharray="5 4"
        markerEnd="url(#arr2)"
        opacity="0.5"
      />

      <line
        x1={cx}
        y1={cy}
        x2={cx + dx}
        y2={cy + dy}
        stroke="#1D9E75"
        strokeWidth={2}
        markerEnd="url(#arr2)"
        opacity="0.9"
      />

      <path
        d={`M ${cx} ${cy - 28} A 28 28 0 0 1 ${cx + Math.sin(angleRadians) * 28} ${cy - Math.cos(angleRadians) * 28}`}
        fill="none"
        stroke="#D85A30"
        strokeWidth={1.5}
      />

      <g transform={`translate(${cx},${cy}) rotate(${-angle})`}>
        <rect
          x={-wheelW / 2}
          y={-wheelH / 2}
          width={wheelW}
          height={wheelH}
          rx={3}
          fill="#1D9E75"
          opacity={0.85}
        />
      </g>

      <text
        x={cx + 14}
        y={cy - 22}
        fontSize={11}
        fill="#D85A30"
        fontWeight="600"
      >
        δ = {angle}°
      </text>

      <text
        x={cx + 4}
        y={cy - axisLen + 2}
        fontSize={10}
        fill="var(--muted-color)"
        opacity="0.6"
      >
        ahead
      </text>

      <text
        x={cx + 4}
        y={cy + 28}
        fontSize={10}
        fill="var(--muted-color)"
        opacity="0.6"
      >
        car axis
      </text>
    </svg>
  );
}
