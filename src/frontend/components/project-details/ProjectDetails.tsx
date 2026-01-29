import { ConsoleOutput } from "@/frontend/components/project-details/ConsoleOutput";
import { CoveragePanel } from "@/frontend/components/project-details/CoveragePanel";
import { DetailsHeader } from "@/frontend/components/project-details/DetailsHeader";
import { ProgressionChart } from "@/frontend/components/project-details/ProgressionChart";
import { SkillAccordion } from "@/frontend/components/project-details/SkillAccordion";
import { SummaryCards } from "@/frontend/components/project-details/SummaryCards";
import {
  extractConsoleOutput,
  extractCoverage,
  getAllTestsFromDetails,
  processProjectHistory,
} from "@/frontend/utils/processData";
import type { EpitestResult, ProjectDetailsResponse } from "@/shared/types/api";
import type { HistoryPoint, ProcessedProject } from "@/shared/types/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const { electronAPI } = window;

function SkeletonBox({ className }: { className: string }) {
  return <div className={`animate-shimmer rounded ${className}`} />;
}

interface ProjectDetailsProps {
  project: ProcessedProject;
  onBack: () => void;
  selectedYear: number;
}

export function ProjectDetails({
  project,
  onBack,
  selectedYear,
}: ProjectDetailsProps) {
  const [details, setDetails] = useState<ProjectDetailsResponse | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [detailsRes, historyRes] = await Promise.all([
          electronAPI.fetchProjectDetails(
            project.testRunId,
          ) as Promise<ProjectDetailsResponse>,
          electronAPI.fetchProjectHistory(
            project.moduleCode,
            project.slug,
            selectedYear,
          ) as Promise<EpitestResult[]>,
        ]);

        setDetails(detailsRes);
        setHistory(processProjectHistory(historyRes));
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [project.testRunId, project.moduleCode, project.slug, selectedYear]);

  const consoleOutput = details
    ? extractConsoleOutput(details.externalItems)
    : null;
  const coverage = details
    ? extractCoverage(details.externalItems)
    : { lines: 0, branches: 0 };
  const skillTests = details ? getAllTestsFromDetails(details) : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" as const },
    },
  };

  const contentTransition = { duration: 0.25, ease: "easeOut" as const };

  if (error) {
    return (
      <div className="px-8 pt-6 pb-12">
        <DetailsHeader project={project} gitCommit={null} onBack={onBack} />
        <div className="text-fail mt-16 text-center text-sm">{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="px-8 pt-6 pb-12"
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

      <motion.div variants={itemVariants} className="mt-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="chart-skeleton"
              exit={{ opacity: 0 }}
              transition={contentTransition}
            >
              <SkeletonBox className="mb-4 h-4 w-24" />
              <SkeletonBox className="h-89.5 rounded-xl" />
            </motion.div>
          ) : history.length > 1 ? (
            <motion.div
              key="chart-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={contentTransition}
            >
              <h2 className="text-text-secondary mb-4 text-xs font-semibold tracking-wider uppercase">
                Progression
              </h2>
              <ProgressionChart history={history} status={project.status} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="cards-skeleton"
              exit={{ opacity: 0 }}
              transition={contentTransition}
            >
              <div className="grid grid-cols-3 gap-6">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="border-border bg-surface rounded-xl border p-5"
                  >
                    <SkeletonBox className="mb-3 h-3 w-20" />
                    <SkeletonBox className="mb-2 h-8 w-24" />
                    <SkeletonBox className="h-3 w-32" />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="cards-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={contentTransition}
            >
              <SummaryCards project={project} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skills-skeleton"
              exit={{ opacity: 0 }}
              transition={contentTransition}
            >
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-surface border-border flex items-center justify-between rounded-xl border px-5 py-4"
                  >
                    <SkeletonBox className="h-4 w-40" />
                    <div className="flex items-center gap-3">
                      <SkeletonBox className="h-4 w-12" />
                      <SkeletonBox className="h-2 w-24 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : skillTests.length > 0 ? (
            <motion.div
              key="skills-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={contentTransition}
            >
              <div className="flex flex-col gap-2">
                {skillTests.map((skill, index) => (
                  <SkillAccordion
                    key={skill.skillName}
                    skill={skill}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <AnimatePresence mode="wait">
          {!loading && consoleOutput && (
            <motion.div
              key="console-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={contentTransition}
            >
              <ConsoleOutput output={consoleOutput} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <AnimatePresence mode="wait">
          {!loading && (coverage.lines > 0 || coverage.branches > 0) && (
            <motion.div
              key="coverage-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={contentTransition}
            >
              <CoveragePanel
                lines={coverage.lines}
                branches={coverage.branches}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
