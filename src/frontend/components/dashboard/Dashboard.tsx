import { ActivityTrends } from "@/frontend/components/dashboard/ActivityTrends";
import { FilterBar } from "@/frontend/components/dashboard/FilterBar";
import { ProjectCard } from "@/frontend/components/dashboard/ProjectCard";
import { SummaryCards } from "@/frontend/components/dashboard/SummaryCards";
import { AppFooter } from "@/frontend/components/ui/AppFooter";
import { SettingsMenu } from "@/frontend/components/ui/SettingsMenu";
import {
  calculateSummary,
  filterProjects,
  getUniqueModules,
  processAllProjects,
} from "@/frontend/utils/processData";
import type { EpitestResult } from "@/shared/types/api";
import type { FilterStatus, ProcessedProject } from "@/shared/types/ui";
import { IconCalendar, IconRefresh } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

interface DashboardProps {
  data: EpitestResult[];
  onRefresh: () => void;
  isRefreshing: boolean;
  onSelectProject: (project: ProcessedProject) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

const YEARS = Array.from({ length: 12 }, (_, i) => 2025 - i);

export function Dashboard({
  data,
  onRefresh,
  isRefreshing,
  onSelectProject,
  selectedYear,
  onYearChange,
}: DashboardProps) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const hasAnimated = useRef(false);

  useEffect(() => {
    hasAnimated.current = true;
  }, []);

  const projects = useMemo(() => processAllProjects(data), [data]);
  const summary = useMemo(() => calculateSummary(projects), [projects]);
  const modules = useMemo(() => getUniqueModules(projects), [projects]);

  const filteredProjects = useMemo(
    () => filterProjects(projects, statusFilter, moduleFilter, searchQuery),
    [projects, statusFilter, moduleFilter, searchQuery],
  );

  const filterKey = `${statusFilter}-${moduleFilter}-${searchQuery}`;

  return (
    <motion.div
      className="px-8 pt-6 pb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-text font-display text-2xl tracking-wide">
          EPIDASH
        </h1>
        <div className="flex items-center gap-2">
          <div className="border-border bg-elevated hover:border-border-medium hover:bg-hover relative flex items-center gap-2 rounded-lg border transition-all duration-150">
            <IconCalendar
              size={16}
              stroke={2}
              className="text-text-secondary pointer-events-none absolute left-3"
            />
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="text-text-secondary bg-transparent py-2 pr-3 pl-9 font-sans text-sm font-medium outline-none [-webkit-appearance:none] appearance-none"
            >
              {YEARS.map((year) => (
                <option key={year} value={year} className="bg-elevated">
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-border bg-elevated text-text-secondary hover:border-border-medium hover:bg-hover hover:text-text flex items-center justify-center rounded-lg border p-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
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
              <IconRefresh size={18} stroke={2} />
            </motion.div>
          </button>
          <SettingsMenu />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6">
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
        className="grid grid-cols-1 gap-3 xl:grid-cols-2"
        variants={containerVariants}
        initial={hasAnimated.current ? false : "hidden"}
        animate="show"
      >
        {filteredProjects.length === 0 ? (
          <div className="text-text-tertiary py-12 text-center items-center col-span-full">
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

      {/* Activity Trends */}
      <ActivityTrends projects={projects} />

      {/* Footer */}
      <AppFooter />
    </motion.div>
  );
}
