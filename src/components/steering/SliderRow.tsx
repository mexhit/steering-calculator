type SliderRowProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit: string;
  decimals: number;
  onChange: (value: number) => void;
};

export default function SliderRow({
  label,
  min,
  max,
  step,
  value,
  unit,
  decimals,
  onChange,
}: SliderRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 14,
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: "var(--muted)",
          width: 120,
          flexShrink: 0,
        }}
      >
        {label}
      </span>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: "var(--accent)" }}
      />

      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text)",
          minWidth: 64,
          textAlign: "right",
          fontFamily: "var(--mono)",
        }}
      >
        {value.toFixed(decimals)} {unit}
      </span>
    </div>
  );
}
