import {
  aggregateActivityTrends,
  type ActivityTrendPoint,
} from "@/frontend/utils/processData";
import type { ProcessedProject } from "@/shared/types/ui";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ActivityTrendsProps {
  projects: ProcessedProject[];
}

function formatAxisDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTooltipDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ActivityTrendPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-elevated border-border rounded-lg border px-3 py-2 shadow-lg">
      <div className="text-accent font-mono text-lg font-semibold">
        {Math.round(data.passRate)}%
      </div>
      <div className="text-text-tertiary text-xs">
        {data.testRuns} test run{data.testRuns !== 1 ? "s" : ""}
      </div>
      <div className="text-text-tertiary mt-1 font-mono text-[10px]">
        {formatTooltipDate(data.date)}
      </div>
    </div>
  );
}

export function ActivityTrends({ projects }: ActivityTrendsProps) {
  const trendData = useMemo(
    () => aggregateActivityTrends(projects, "all"),
    [projects],
  );

  if (projects.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="bg-surface border-border relative overflow-hidden rounded-xl border">
        {trendData.length === 0 ? (
          <div className="text-text-tertiary flex h-50 items-center justify-center text-sm">
            No activity data
          </div>
        ) : (
          <>
            <div className="px-4 pt-4">
              <h2 className="text-text-secondary text-xs font-medium tracking-widest">
                ACTIVITY
              </h2>
            </div>

            <div className="py-4">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={trendData}
                  margin={{ top: 20, right: 48, left: 24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="activityGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--color-accent)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--color-accent)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="var(--color-border)"
                    horizontal={true}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tickFormatter={formatAxisDate}
                    stroke="var(--color-text-tertiary)"
                    tick={{ fontSize: 10, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={false}
                    height={40}
                    tickMargin={24}
                    interval="preserveStartEnd"
                  />

                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 50, 100]}
                    tickFormatter={(v) => `${v}%`}
                    stroke="var(--color-text-tertiary)"
                    tick={{ fontSize: 10, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: "var(--color-accent)",
                      strokeOpacity: 0.3,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="passRate"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    fill="url(#activityGradient)"
                    dot={{
                      fill: "var(--color-accent)",
                      r: 3,
                      strokeWidth: 0,
                    }}
                    activeDot={{
                      r: 5,
                      fill: "var(--color-accent)",
                      strokeWidth: 0,
                      style: {
                        filter: "drop-shadow(0 0 6px var(--color-accent))",
                      },
                    }}
                    animationDuration={600}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
