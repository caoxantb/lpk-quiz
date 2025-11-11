export function ChartContainer({ className = "", children, ...props }) {
  return (
    <div className={`w-full space-y-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ChartLegend({ items = [], className = "" }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 ${className}`}
    >
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          <span
            className="h-2.5 w-2.5"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function ChartTooltipContent({
  active,
  label,
  payload,
  valueFormatter,
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="border border-slate-200 bg-white/95 px-3 py-2 text-sm shadow-md backdrop-blur">
      <p className="font-semibold text-slate-900">{label}</p>
      <div className="mt-1 flex flex-col gap-1">
        {payload.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center justify-between gap-4"
          >
            <span className="flex items-center gap-2 text-slate-600">
            <span
              className="h-2.5 w-2.5"
              style={{ backgroundColor: entry.color }}
            />
              {entry.name}
            </span>
            <span className="font-semibold text-slate-900">
              {valueFormatter
                ? valueFormatter(entry.value, entry)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
