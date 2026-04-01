type MetricCardProps = {
  label: string;
  value: string;
  unit: string;
  color?: string;
};

export default function MetricCard({
  label,
  value,
  unit,
  color,
}: MetricCardProps) {
  return (
    <div
      style={{
        background: "var(--surface2)",
        borderRadius: 10,
        padding: "14px 12px",
        textAlign: "center",
        border: "1px solid var(--border)",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--muted)",
          marginBottom: 6,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: color || "var(--text)",
          fontFamily: "var(--mono)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
        {unit}
      </div>
    </div>
  );
}
