import Badge from "./ui/Badge";

const MetricCard = ({ title, value, trend, tone, icon: Icon }) => {
  return (
    <div className="card-surface px-5 py-4 transition duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">
            {value}
          </p>
          <div className="mt-3">
            <Badge label={trend} tone={tone} />
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-800/70">
          <Icon className="text-slate-200" size={20} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
