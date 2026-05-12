const StatCard = ({ title, value, detail }) => (
  <div className="glass-panel px-4 py-4">
    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
    <p className="text-xs text-slate-400">{detail}</p>
  </div>
);

export default StatCard;
