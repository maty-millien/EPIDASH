import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import type { HistoryPoint, ProjectStatus } from "@/shared/types/ui"

interface ProgressionChartProps {
  history: HistoryPoint[]
  status: ProjectStatus
}

const statusColors: Record<ProjectStatus, { line: string; fill: string }> = {
  perfect: {
    line: "#00ff9f",
    fill: "rgba(0, 255, 159, 0.15)"
  },
  passing: {
    line: "#ffcc00",
    fill: "rgba(255, 204, 0, 0.15)"
  },
  failing: {
    line: "#ff3366",
    fill: "rgba(255, 51, 102, 0.15)"
  },
  critical: {
    line: "#ff6b35",
    fill: "rgba(255, 107, 53, 0.15)"
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function formatAxisDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  })
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: HistoryPoint }>
  lineColor: string
}

function CustomTooltip({ active, payload, lineColor }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload as HistoryPoint

  return (
    <div className="bg-elevated border-border rounded-lg border px-3 py-2 shadow-lg">
      <div
        className="font-mono text-lg font-semibold"
        style={{ color: lineColor }}
      >
        {Math.round(data.passRate)}%
      </div>
      <div className="text-text-tertiary text-xs">
        {data.passedTests}/{data.totalTests} tests
      </div>
      <div className="text-text-tertiary mt-1 font-mono text-[10px]">
        {formatDate(data.date)}
      </div>
    </div>
  )
}

export function ProgressionChart({ history, status }: ProgressionChartProps) {
  const colors = statusColors[status]
  const gradientId = `progressionGradient-${status}`

  return (
    <div className="bg-surface border-border relative rounded-xl border py-6">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={history}
          margin={{ top: 20, right: 48, left: 24, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.line} stopOpacity={0.3} />
              <stop offset="100%" stopColor={colors.line} stopOpacity={0} />
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
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v) => `${v}%`}
            stroke="var(--color-text-tertiary)"
            tick={{ fontSize: 10, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            width={40}
          />

          <Tooltip
            content={<CustomTooltip lineColor={colors.line} />}
            cursor={{ stroke: colors.line, strokeOpacity: 0.3 }}
          />

          <Area
            type="monotone"
            dataKey="passRate"
            stroke={colors.line}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={{
              fill: colors.line,
              r: 4,
              strokeWidth: 0
            }}
            activeDot={{
              r: 6,
              fill: colors.line,
              strokeWidth: 0,
              style: { filter: `drop-shadow(0 0 6px ${colors.line})` }
            }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
