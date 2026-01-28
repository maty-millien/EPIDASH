import { useState } from "react"
import { IconChevronDown } from "@tabler/icons-react"
import { motion, AnimatePresence } from "framer-motion"
import type { ProcessedProject } from "../types"
import { MiniBar } from "./MiniBar"
import { SkillsPanel } from "./SkillsPanel"

interface ProjectCardProps {
  project: ProcessedProject
  onSelect: (project: ProcessedProject) => void
  filterKey?: string
}

const titleColors: Record<ProcessedProject["status"], string> = {
  perfect: "text-pass",
  passing: "text-warning",
  failing: "text-fail",
  critical: "text-crash"
}

const rateColors: Record<ProcessedProject["status"], string> = {
  perfect: "text-pass",
  passing: "text-warning",
  failing: "text-fail",
  critical: "text-crash"
}

export function ProjectCard({
  project,
  onSelect,
  filterKey
}: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false)

  const handleCardClick = () => {
    onSelect(project)
  }

  return (
    <div
      className={`border-border bg-surface hover:border-border-medium overflow-hidden rounded-xl border transition-all duration-150 hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.3)]`}
    >
      <div
        className="flex cursor-pointer items-center px-5 py-4 select-none"
        onClick={handleCardClick}
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2.5">
            <span
              className={`truncate text-base font-semibold ${titleColors[project.status]}`}
            >
              {project.name}
            </span>
            <span className="bg-elevated text-text-secondary shrink-0 rounded px-2 py-0.5 font-mono text-[11px] font-medium">
              {project.moduleCode}
            </span>
          </div>
          <div className="text-text-tertiary flex items-center gap-3 text-[13px]">
            <span>{project.dateRelative}</span>
            {project.collaborators.length > 1 && (
              <>
                <span className="bg-text-tertiary size-0.75 rounded-full" />
                <span>{project.collaborators.length} collaborators</span>
              </>
            )}
          </div>
        </div>

        <div className="ml-5 flex items-center gap-4 pl-5">
          <div className="flex items-center gap-3">
            <span
              className={`font-mono text-lg font-semibold ${rateColors[project.status]}`}
            >
              {Math.round(project.passRate)}%
            </span>
            <MiniBar
              passed={project.passedTests}
              total={project.totalTests}
              status={project.status}
              filterKey={filterKey}
            />
          </div>

          <button
            className={`text-text-tertiary hover:text-text flex size-8 items-center justify-center rounded-md transition-all duration-150`}
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
          >
            <IconChevronDown
              size={16}
              stroke={2}
              className={`transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <SkillsPanel
              skills={project.skills}
              lintSeverity={project.lintSeverity}
              lintCounts={project.lintCounts}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
