import { motion } from "framer-motion"
import type { ProjectStatus } from "@/shared/types/ui"

interface MiniBarProps {
  passed: number
  total: number
  status: ProjectStatus
  filterKey?: string
}

const barColors: Record<ProjectStatus, { bg: string; fill: string }> = {
  perfect: { bg: "bg-pass-dim", fill: "bg-pass" },
  passing: { bg: "bg-warning-dim", fill: "bg-warning" },
  failing: { bg: "bg-fail-dim", fill: "bg-fail" },
  critical: { bg: "bg-crash-dim", fill: "bg-crash" }
}

export function MiniBar({ passed, total, status, filterKey }: MiniBarProps) {
  const passPercent = total > 0 ? (passed / total) * 100 : 0
  const colors = barColors[status]

  return (
    <div
      className={`flex h-1.5 w-20 overflow-hidden rounded-full ${colors.bg}`}
    >
      <motion.div
        key={filterKey}
        className={`h-full ${colors.fill}`}
        initial={{ width: 0 }}
        animate={{ width: `${passPercent}%` }}
        transition={{ duration: 0.3, ease: [0, 0.7, 0.3, 1] }}
      />
    </div>
  )
}
