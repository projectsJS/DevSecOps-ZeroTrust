const Card = ({ className = "", children }) => (
  <div className={`card-surface ${className}`.trim()}>{children}</div>
);

const CardHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h3 className="font-display text-base text-slate-100">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export { Card, CardHeader };
