const toneMap = {
  good: "bg-teal-400/20 text-teal-300",
  warn: "bg-amber-400/20 text-amber-300",
  alert: "bg-rose-400/20 text-rose-300",
  info: "bg-cyan-400/20 text-cyan-300"
};

const Badge = ({ label, tone = "info" }) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
      toneMap[tone] || toneMap.info
    }`}
  >
    {label}
  </span>
);

export default Badge;
