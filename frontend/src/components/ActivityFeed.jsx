const ActivityFeed = ({ items }) => (
  <div className="space-y-4">
    {items.map((item) => (
      <div key={item.id} className="flex items-start gap-4">
        <div className="mt-1 h-2 w-2 rounded-full bg-teal-400" />
        <div>
          <p className="text-sm text-slate-200">{item.title}</p>
          <p className="text-xs text-slate-500">
            {item.time} - {item.actor}
          </p>
        </div>
      </div>
    ))}
  </div>
);

export default ActivityFeed;
