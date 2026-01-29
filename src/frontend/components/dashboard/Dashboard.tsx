import { IconRefresh } from "@tabler/icons-react"
import { motion } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import type { EpitestResult } from "@/shared/types/api"
import type { FilterStatus, ProcessedProject } from "@/shared/types/ui"
import {
  calculateSummary,
  filterProjects,
  getUniqueModules,
  processAllProjects
} from "@/frontend/utils/processData"
import { FilterBar } from "@/frontend/components/dashboard/FilterBar"
import { ProjectCard } from "@/frontend/components/dashboard/ProjectCard"
import { SummaryCards } from "@/frontend/components/dashboard/SummaryCards"
import { SettingsMenu } from "@/frontend/components/ui/SettingsMenu"

interface DashboardProps {
  data: EpitestResult[]
  onRefresh: () => void
  isRefreshing: boolean
  onSelectProject: (project: ProcessedProject) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const }
  }
}

export function Dashboard({
  data,
  onRefresh,
  isRefreshing,
  onSelectProject
}: DashboardProps) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [moduleFilter, setModuleFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const hasAnimated = useRef(false)

  // Mark as animated after first render to prevent re-animation on filter changes
  useEffect(() => {
    hasAnimated.current = true
  }, [])

  const projects = useMemo(() => processAllProjects(data), [data])
  const summary = useMemo(() => calculateSummary(projects), [projects])
  const modules = useMemo(() => getUniqueModules(projects), [projects])

  const filteredProjects = useMemo(
    () => filterProjects(projects, statusFilter, moduleFilter, searchQuery),
    [projects, statusFilter, moduleFilter, searchQuery]
  )

  const filterKey = `${statusFilter}-${moduleFilter}-${searchQuery}`

  return (
    <motion.div
      className="mx-auto max-w-300 px-8 pt-6 pb-12"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-text text-[28px] font-semibold tracking-tight">
          EPIDASH
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-border bg-elevated text-text-secondary hover:border-border-medium hover:bg-hover hover:text-text flex items-center gap-2 rounded-lg border px-4 py-2 font-sans text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={
                isRefreshing
                  ? { duration: 1, repeat: Infinity, ease: "linear" }
                  : { duration: 0.3, ease: "easeOut" }
              }
              whileTap={!isRefreshing ? { rotate: -360 } : undefined}
            >
              <IconRefresh size={16} stroke={2} />
            </motion.div>
            Refresh
          </button>
          <SettingsMenu />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8">
        <SummaryCards summary={summary} />
      </div>

      {/* Filters */}
      <FilterBar
        status={statusFilter}
        onStatusChange={setStatusFilter}
        modules={modules}
        selectedModule={moduleFilter}
        onModuleChange={setModuleFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Project List */}
      <motion.div
        className="flex flex-col gap-3"
        variants={containerVariants}
        initial={hasAnimated.current ? false : "hidden"}
        animate="show"
      >
        {filteredProjects.length === 0 ? (
          <div className="text-text-tertiary py-12 text-center">
            No projects match your filters
          </div>
        ) : (
          filteredProjects.map((project) => (
            <motion.div key={project.testRunId} variants={itemVariants}>
              <ProjectCard
                project={project}
                onSelect={onSelectProject}
                filterKey={filterKey}
              />
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  )
}
