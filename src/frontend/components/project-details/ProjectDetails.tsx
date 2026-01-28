import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import type { EpitestResult, ProjectDetailsResponse } from "@/shared/types/api"
import type { HistoryPoint, ProcessedProject } from "@/shared/types/ui"
import {
  extractConsoleOutput,
  extractCoverage,
  getAllTestsFromDetails,
  processProjectHistory
} from "@/frontend/utils/processData"
import { ConsoleOutput } from "@/frontend/components/project-details/ConsoleOutput"
import { CoveragePanel } from "@/frontend/components/project-details/CoveragePanel"
import { DetailsHeader } from "@/frontend/components/project-details/DetailsHeader"
import { ProgressionChart } from "@/frontend/components/project-details/ProgressionChart"
import { SkillAccordion } from "@/frontend/components/project-details/SkillAccordion"
import { SummaryCards } from "@/frontend/components/project-details/SummaryCards"

const { electronAPI } = window

interface ProjectDetailsProps {
  project: ProcessedProject
  onBack: () => void
}

export function ProjectDetails({ project, onBack }: ProjectDetailsProps) {
  const [details, setDetails] = useState<ProjectDetailsResponse | null>(null)
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const [detailsRes, historyRes] = await Promise.all([
          electronAPI.fetchProjectDetails(
            project.testRunId
          ) as Promise<ProjectDetailsResponse>,
          electronAPI.fetchProjectHistory(
            project.moduleCode,
            project.slug
          ) as Promise<EpitestResult[]>
        ])

        setDetails(detailsRes)
        setHistory(processProjectHistory(historyRes))
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [project.testRunId, project.moduleCode, project.slug])

  const consoleOutput = details
    ? extractConsoleOutput(details.externalItems)
    : null
  const coverage = details
    ? extractCoverage(details.externalItems)
    : { lines: 0, branches: 0 }
  const skillTests = details ? getAllTestsFromDetails(details) : []

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" as const }
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-300 px-8 pt-6 pb-12">
        <DetailsHeader project={project} gitCommit={null} onBack={onBack} />
        <div className="mt-16 flex items-center justify-center">
          <div className="text-text-tertiary flex items-center gap-3 text-sm">
            <motion.div
              className="bg-accent size-2 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            Loading details...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-300 px-8 pt-6 pb-12">
        <DetailsHeader project={project} gitCommit={null} onBack={onBack} />
        <div className="text-fail mt-16 text-center text-sm">{error}</div>
      </div>
    )
  }

  return (
    <motion.div
      className="mx-auto max-w-300 px-8 pt-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <DetailsHeader
          project={project}
          gitCommit={details?.gitCommit ?? null}
          onBack={onBack}
        />
      </motion.div>

      {history.length > 1 && (
        <motion.div variants={itemVariants} className="mt-8">
          <h2 className="text-text-secondary mb-4 text-xs font-semibold tracking-wider uppercase">
            Progression
          </h2>
          <ProgressionChart history={history} status={project.status} />
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="mt-6">
        <SummaryCards project={project} />
      </motion.div>

      {skillTests.length > 0 && (
        <motion.div variants={itemVariants} className="mt-6">
          <div className="flex flex-col gap-2">
            {skillTests.map((skill, index) => (
              <SkillAccordion
                key={skill.skillName}
                skillName={skill.skillName}
                tests={skill.tests}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      )}

      {consoleOutput && (
        <motion.div variants={itemVariants} className="mt-6">
          <ConsoleOutput output={consoleOutput} />
        </motion.div>
      )}

      {(coverage.lines > 0 || coverage.branches > 0) && (
        <motion.div variants={itemVariants} className="mt-6">
          <CoveragePanel lines={coverage.lines} branches={coverage.branches} />
        </motion.div>
      )}
    </motion.div>
  )
}
