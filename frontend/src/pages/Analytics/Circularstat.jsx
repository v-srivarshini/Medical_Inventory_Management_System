import "./Circularstat.css";

/**
 * A single circular-progress stat ring.
 *
 * - `value` / `label` render in the center.
 * - `percent` (0–100) controls how much of the ring is filled.
 *   This is a *visual weight*, not necessarily a literal ratio —
 *   tune it to whatever makes sense for each metric (e.g. severity,
 *   or an actual percentage of total inventory/capacity once you
 *   have that number from the backend).
 * - `color` / `tint` come in pairs so the filled arc and the icon
 *   badge share a hue while the track stays a soft version of it.
 */
export default function CircularStat({
  value,
  label,
  icon,
  color = "#0B6E63",
  tint = "#DCEAE6",
  percent = 70,
  size = 150,
}) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;

  const isShortValue = typeof value !== "string" || value.length <= 7;

  return (
    <div
      className="cs-wrap"
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
      }}
    >
      <svg viewBox="0 0 120 120" className="cs-svg">
        <circle cx="60" cy="60" r={r} strokeWidth="10" className="cs-track" style={{ stroke: color }} />
        <circle
          cx="60"
          cy="60"
          r={r}
          strokeWidth="10"
          strokeLinecap="round"
          className="cs-progress"
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
          transform="rotate(-90 60 60)"
        />
      </svg>

      <div className="cs-center">
        <span className={`cs-value ${isShortValue ? "" : "cs-value-sm"}`}>{value}</span>
        <span className="cs-label">{label}</span>
      </div>

      <div className="cs-badge" style={{ background: tint, color }}>
        {icon}
      </div>
    </div>
  );
}
