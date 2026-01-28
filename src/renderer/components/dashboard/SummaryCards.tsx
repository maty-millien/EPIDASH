import { motion } from "framer-motion"
import type { DashboardSummary } from "@/shared/types"

interface SummaryCardsProps {
  summary: DashboardSummary
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
} as const

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const }
  }
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <motion.div
      className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div
        variants={cardVariants}
        className="border-border bg-surface flex flex-col gap-2 rounded-xl border p-5"
      >
        <span className="text-text-tertiary text-[13px] font-medium tracking-wide uppercase">
          Total Tests
        </span>
        <span className="text-text font-mono text-[32px] leading-none font-semibold">
          {summary.totalTests}
        </span>
        <span className="text-text-tertiary text-[13px]">
          across {summary.totalProjects} projects
        </span>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="border-border bg-surface flex flex-col gap-2 rounded-xl border p-5"
      >
        <span className="text-text-tertiary text-[13px] font-medium tracking-wide uppercase">
          Pass Rate
        </span>
        <span className="text-accent font-mono text-[32px] leading-none font-semibold">
          {Math.round(summary.overallPassRate)}%
        </span>
        <span className="text-text-tertiary text-[13px]">
          {summary.totalPassed} / {summary.totalTests} passed
        </span>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="border-border bg-surface flex flex-col gap-2 rounded-xl border p-5"
      >
        <span className="text-text-tertiary text-[13px] font-medium tracking-wide uppercase">
          Complete
        </span>
        <span className="text-pass font-mono text-[32px] leading-none font-semibold">
          {summary.perfectCount}
        </span>
        <span className="text-text-tertiary text-[13px]">100% pass rate</span>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="border-border bg-surface flex flex-col gap-2 rounded-xl border p-5"
      >
        <span className="text-text-tertiary text-[13px] font-medium tracking-wide uppercase">
          Review
        </span>
        <span className="text-fail font-mono text-[32px] leading-none font-semibold">
          {summary.failingCount + summary.criticalCount}
        </span>
        <span className="text-text-tertiary text-[13px]">
          {summary.criticalCount > 0
            ? `${summary.criticalCount} critical`
            : "below 70%"}
        </span>
      </motion.div>
    </motion.div>
  )
}
