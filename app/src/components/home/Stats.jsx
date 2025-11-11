import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartLegend, ChartTooltipContent } from "../ui/chart";
import { useAtomValue } from "jotai";
import { testAtom } from "../../stores/tests";
import { questionAtom } from "../../stores/questions";
import { categoryMap } from "../../utils/categoryMap";

const DISPLAY_OPTIONS = [
  { id: "count", label: "Raw counts" },
  { id: "percentage", label: "Percentages" },
];

const SERIES_COLORS = {
  correct: "#34d399",
  wrong: "#f87171",
  flagged: "#facc15",
};

const splitCategoryLabel = (label) => {
  const words = label.split(" ");
  if (words.length <= 1) return [label];

  const midpoint = Math.ceil(words.length / 2);
  const firstLine = words.slice(0, midpoint).join(" ");
  const secondLine = words.slice(midpoint).join(" ");

  return [firstLine, secondLine];
};

const CategoryTick = ({ x, y, payload }) => {
  const lines = splitCategoryLabel(payload.value);

  return (
    <g transform={`translate(${x},${y + 10})`}>
      {lines.map((line, idx) => (
        <text
          key={`${payload.value}-${idx}`}
          x={0}
          y={idx * 14}
          textAnchor="middle"
          fill="#475569"
          fontSize={12}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

function Stats({ onBack }) {
  const [mode, setMode] = useState("count");
  const testSuites = useAtomValue(testAtom);
  const questions = useAtomValue(questionAtom);

  const questionList = Object.entries(questions).flatMap(([key, qs]) => {
    const suite = testSuites[key] || {};

    return [
      suite.session1 === "done" ? qs.filter((q) => q.session === 1) : [],
      suite.session2 === "done" ? qs.filter((q) => q.session === 2) : [],
    ].flat();
  });

  const stats = Object.values(
    questionList.reduce((acc, q) => {
      const name = categoryMap(q.category) || q.category;
      if (!acc[name])
        acc[name] = { category: name, correct: 0, wrong: 0, flagged: 0 };

      if (q.flag) acc[name].flagged++;
      else if (q.userChoice === q.solution) acc[name].correct++;
      else acc[name].wrong++;

      return acc;
    }, {})
  );

  const { chartData, maxTotal } = useMemo(() => {
    const data = stats.map((topic) => {
      const total = topic.correct + topic.wrong + topic.flagged;

      if (mode === "percentage") {
        const safeTotal = total || 1;
        const toPercent = (value) =>
          Number(((value / safeTotal) * 100).toFixed(1));

        return {
          ...topic,
          correct: toPercent(topic.correct),
          wrong: toPercent(topic.wrong),
          flagged: toPercent(topic.flagged),
          total: total ? 100 : 0,
        };
      }

      return {
        ...topic,
        total,
      };
    });

    return {
      chartData: data,
      maxTotal: Math.max(...data.map((topic) => topic.total)),
    };
  }, [mode, stats]);

  const maxAxisValue =
    mode === "percentage"
      ? 100
      : Math.max(Math.ceil((maxTotal || 5) / 5) * 5, 5);

  const axisTicks = useMemo(() => {
    const ticks = [];
    for (let value = 0; value <= maxAxisValue; value += 5) {
      ticks.push(value);
    }
    return ticks;
  }, [maxAxisValue]);

  const formatValue = (value, entry) => {
    if (mode === "percentage") {
      return `${value.toFixed ? value.toFixed(1) : value}%`;
    }

    const total = entry?.payload?.total ?? 0;
    return `${value} / ${total}`;
  };

  const axisFormatter = (value) =>
    mode === "percentage" ? `${value}%` : `${value}`;

  return (
    <section className="min-h-screen space-y-6 px-[10%] pt-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">
            Answer distribution
          </h3>
          <p className="text-sm text-slate-500">
            Answer distribution by raw counts or by percentage.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 text-sm font-medium text-slate-600">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            View mode
          </span>
          <div className="flex flex-wrap gap-2">
            {DISPLAY_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`inline-flex items-center gap-2 cursor-pointer rounded-full border px-3 py-1.5 transition ${
                  mode === option.id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                <input
                  type="radio"
                  name="stats-display"
                  value={option.id}
                  checked={mode === option.id}
                  onChange={() => setMode(option.id)}
                  className="h-4 w-4 cursor-pointer accent-indigo-600"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      </header>

      <div className="space-y-6">
        <ChartLegend
          items={[
            { label: "Correct responses", color: SERIES_COLORS.correct },
            { label: "Incorrect responses", color: SERIES_COLORS.wrong },
            { label: "Flagged for review", color: SERIES_COLORS.flagged },
          ]}
        />

        <ChartContainer>
          <div className="h-[32rem] w-full">
            <ResponsiveContainer>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tick={<CategoryTick />}
                  interval={0}
                  height={60}
                />
                <YAxis
                  tickFormatter={axisFormatter}
                  ticks={axisTicks}
                  allowDecimals={false}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#475569", fontSize: 12 }}
                  domain={[0, maxAxisValue]}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.15)" }}
                  content={<ChartTooltipContent valueFormatter={formatValue} />}
                />
                <Bar
                  dataKey="correct"
                  stackId="answers"
                  fill={SERIES_COLORS.correct}
                  name="Correct"
                />
                <Bar
                  dataKey="wrong"
                  stackId="answers"
                  fill={SERIES_COLORS.wrong}
                  name="Incorrect"
                />
                <Bar
                  dataKey="flagged"
                  stackId="answers"
                  fill={SERIES_COLORS.flagged}
                  name="Flagged"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      {onBack ? (
        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={onBack}
            className="border border-blue-500 bg-blue-500 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition 
                      hover:border-blue-600 hover:bg-transparent hover:text-blue-600 cursor-pointer"
          >
            Back to home
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default Stats;
