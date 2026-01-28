import { motion } from "framer-motion"
import type { ProcessedSkill, LintSeverity } from "@/shared/types"

interface SkillsPanelProps {
  skills: ProcessedSkill[]
  lintSeverity: LintSeverity
  lintCounts: {
    fatal: number
    major: number
    minor: number
    info: number
    note: number
  }
}

const statusColors: Record<ProcessedSkill["status"], string> = {
  perfect: "stroke-pass",
  passed: "stroke-warning",
  failed: "stroke-fail",
  crashed: "stroke-crash"
}

const bgColors: Record<ProcessedSkill["status"], string> = {
  perfect: "stroke-pass/20",
  passed: "stroke-warning/20",
  failed: "stroke-fail/20",
  crashed: "stroke-crash/20"
}

function SkillProgressRing({ skill }: { skill: ProcessedSkill }) {
  const percent = skill.count > 0 ? (skill.passed / skill.count) * 100 : 0
  const size = 18
  const strokeWidth = 2.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className={bgColors[skill.status]}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={statusColors[skill.status]}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        style={{ strokeDasharray: circumference }}
      />
    </svg>
  )
}

function SkillCount({ skill }: { skill: ProcessedSkill }) {
  return (
    <span className="text-text-secondary font-mono text-xs">
      {skill.passed}/{skill.count}
    </span>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" as const }
  }
}

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" as const }
  }
}

const statusOrder: Record<ProcessedSkill["status"], number> = {
  perfect: 0,
  passed: 1,
  failed: 2,
  crashed: 3
}

export function SkillsPanel({
  skills,
  lintSeverity,
  lintCounts
}: SkillsPanelProps) {
  const hasLintIssues =
    lintCounts.fatal > 0 || lintCounts.major > 0 || lintCounts.minor > 0

  const sortedSkills = [...skills].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="border-border border-t px-5 pb-5">
      <motion.div
        className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 pt-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {sortedSkills.map((skill) => (
          <motion.div
            key={skill.name}
            variants={itemVariants}
            className="bg-elevated flex items-center gap-3 rounded-lg px-3 py-2.5"
          >
            <SkillProgressRing skill={skill} />
            <span className="text-text min-w-0 flex-1 truncate text-sm">
              {skill.name}
            </span>
            <SkillCount skill={skill} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="border-border mt-4 flex gap-2 border-t border-dashed pt-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {lintSeverity === "clean" && (
          <motion.span
            variants={badgeVariants}
            className="bg-pass-dim text-pass rounded px-2.5 py-1 font-mono text-xs font-medium"
          >
            Lint Clean
          </motion.span>
        )}
        {lintCounts.fatal > 0 && (
          <motion.span
            variants={badgeVariants}
            className="bg-crash-dim text-crash rounded px-2.5 py-1 font-mono text-xs font-medium"
          >
            {lintCounts.fatal} Fatal
          </motion.span>
        )}
        {lintCounts.major > 0 && (
          <motion.span
            variants={badgeVariants}
            className="bg-fail-dim text-fail rounded px-2.5 py-1 font-mono text-xs font-medium"
          >
            {lintCounts.major} Major
          </motion.span>
        )}
        {lintCounts.minor > 0 && (
          <motion.span
            variants={badgeVariants}
            className="bg-warning-dim text-warning rounded px-2.5 py-1 font-mono text-xs font-medium"
          >
            {lintCounts.minor} Minor
          </motion.span>
        )}
        {!hasLintIssues && lintSeverity !== "clean" && (
          <motion.span
            variants={badgeVariants}
            className="bg-pass-dim text-pass rounded px-2.5 py-1 font-mono text-xs font-medium"
          >
            Lint OK
          </motion.span>
        )}
      </motion.div>
    </div>
  )
}
