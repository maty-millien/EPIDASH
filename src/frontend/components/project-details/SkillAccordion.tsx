import {
  IconCheck,
  IconChevronDown,
  IconFlame,
  IconX
} from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import type { TestResult } from "@/shared/types/api"

interface SkillAccordionProps {
  skillName: string
  tests: TestResult[]
  index: number
}

export function SkillAccordion({
  skillName,
  tests,
  index
}: SkillAccordionProps) {
  const [expanded, setExpanded] = useState(false)

  const passedCount = tests.filter((t) => t.passed).length
  const totalCount = tests.length
  const allPassed = passedCount === totalCount
  const hasCrashes = tests.some((t) => t.crashed)
  const hasFailures = tests.some((t) => !t.passed && !t.crashed && !t.skipped)

  // Expandable if there are any logs to show
  const isSingleTest = tests.length === 1
  const hasLogs = tests.some((t) => t.comment && t.comment.length > 0)
  const isExpandable = hasLogs

  const statusColor = hasCrashes
    ? "text-crash"
    : hasFailures
      ? "text-fail"
      : allPassed
        ? "text-pass"
        : "text-warning"

  const bgColor = hasCrashes
    ? "bg-crash-dim"
    : hasFailures
      ? "bg-fail-dim"
      : allPassed
        ? "bg-pass-dim"
        : "bg-warning-dim"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="bg-surface border-border overflow-hidden rounded-xl border"
    >
      <div
        onClick={() => isExpandable && setExpanded(!expanded)}
        className={`flex w-full items-center justify-between px-5 py-4 transition-colors duration-150 ${isExpandable ? "hover:bg-hover cursor-pointer" : ""}`}
      >
        <div className="flex items-center gap-3">
          {isExpandable && (
            <IconChevronDown
              size={16}
              stroke={2}
              className={`text-text-tertiary transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
            />
          )}
          <span className="text-text font-medium">{skillName}</span>
        </div>

        <div className="flex items-center gap-3">
          {isSingleTest ? (
            allPassed ? (
              <IconCheck size={18} stroke={2.5} className="text-pass" />
            ) : hasCrashes ? (
              <IconFlame size={18} stroke={2} className="text-crash" />
            ) : (
              <IconX size={18} stroke={2.5} className="text-fail" />
            )
          ) : (
            <>
              <span
                className={`font-mono text-sm font-semibold ${statusColor}`}
              >
                {passedCount}/{totalCount}
              </span>
              <div
                className={`h-2 w-16 overflow-hidden rounded-full ${bgColor}`}
              >
                <motion.div
                  className={statusColor.replace("text-", "bg-")}
                  initial={{ width: 0 }}
                  animate={{ width: `${(passedCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ height: "100%" }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && isExpandable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" as const }}
          >
            <div className="border-border border-t p-3">
              <div className="flex flex-col gap-2">
                {tests
                  .filter((t) => t.comment && t.comment.length > 0)
                  .map((test, i) => (
                    <pre
                      key={i}
                      className="bg-elevated text-text-secondary overflow-x-auto rounded-lg p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap"
                    >
                      {test.comment}
                    </pre>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
