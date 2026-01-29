import { IconAlertTriangle, IconCheck } from "@tabler/icons-react";
import type { ProcessedProject } from "@/shared/types/ui";

interface SummaryCardsProps {
  project: ProcessedProject;
}

const statusColors: Record<ProcessedProject["status"], string> = {
  perfect: "text-pass",
  passing: "text-warning",
  failing: "text-fail",
  critical: "text-crash",
};

export function SummaryCards({ project }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Pass Rate */}
      <div className="border-border bg-surface flex flex-col gap-2 rounded-xl border p-5">
        <span className="text-text-tertiary text-[13px] font-medium tracking-wide uppercase">
          Pass Rate
        </span>
        <span
          className={`font-mono text-[32px] leading-none font-semibold ${statusColors[project.status]}`}
        >
          {Math.round(project.passRate)}%
        </span>
        <span className="text-text-tertiary text-[13px]">
          {project.passedTests} / {project.totalTests} passed
        </span>
      </div>

      {/* Tests */}
      <div className="border-border bg-surface flex flex-col gap-2 rounded-xl border p-5">
        <span className="text-text-tertiary text-[13px] font-medium tracking-wide uppercase">
          Tests
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-text font-mono text-[32px] leading-none font-semibold">
            {project.passedTests}
          </span>
          <span className="text-text-tertiary font-mono text-lg">
            / {project.totalTests}
          </span>
        </div>
        <div className="text-text-tertiary flex items-center gap-3 text-[13px]">
          <span className="text-pass flex items-center gap-1">
            <IconCheck size={12} stroke={3} />
            {project.passedTests} passed
          </span>
          <span className="text-fail flex items-center gap-1">
            {project.failedTests} failed
          </span>
        </div>
      </div>

      {/* Coding Style */}
      <div className="border-border bg-surface flex flex-col gap-2 rounded-xl border p-5">
        <span className="text-text-tertiary text-[13px] font-medium tracking-wide uppercase">
          Coding Style
        </span>
        <div className="flex flex-col gap-2">
          {project.lintCounts.fatal > 0 && (
            <div className="text-crash flex items-center gap-2 text-sm font-medium">
              <IconAlertTriangle size={16} stroke={2} />
              {project.lintCounts.fatal} fatal
            </div>
          )}
          {project.lintCounts.major > 0 && (
            <div className="text-fail flex items-center gap-2 text-sm font-medium">
              <IconAlertTriangle size={16} stroke={2} />
              {project.lintCounts.major} major
            </div>
          )}
          {project.lintCounts.minor > 0 && (
            <div className="text-warning flex items-center gap-2 text-sm font-medium">
              <IconAlertTriangle size={16} stroke={2} />
              {project.lintCounts.minor} minor
            </div>
          )}
          {project.lintSeverity === "clean" && (
            <div className="text-pass flex items-center gap-2 text-sm font-medium">
              <IconCheck size={16} stroke={2} />
              No style issues
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
