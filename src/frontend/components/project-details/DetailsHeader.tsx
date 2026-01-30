import { IconArrowLeft, IconGitCommit } from "@tabler/icons-react";
import type { ProcessedProject } from "@/shared/types/ui";

interface DetailsHeaderProps {
  project: ProcessedProject;
  gitCommit: string | null;
  onBack: () => void;
}

const titleColors: Record<ProcessedProject["status"], string> = {
  perfect: "text-pass",
  passing: "text-warning",
  failing: "text-fail",
  critical: "text-crash",
};

export function DetailsHeader({
  project,
  gitCommit,
  onBack,
}: DetailsHeaderProps) {
  const shortCommit = gitCommit?.slice(0, 7);

  return (
    <div>
      <button
        onClick={onBack}
        className="text-text-tertiary hover:text-text hover:bg-elevated mb-4 flex size-8 items-center justify-center rounded-lg transition-all duration-150"
      >
        <IconArrowLeft size={18} stroke={2} />
      </button>

      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <h1
              className={`text-[28px] font-semibold tracking-tight ${titleColors[project.status]}`}
            >
              {project.name}
            </h1>
          </div>
          <div className="text-text-tertiary flex items-center gap-3 text-sm">
            <span className="bg-elevated text-text-secondary rounded px-2 py-0.5 font-mono text-xs font-medium">
              {project.moduleCode}
            </span>
            <span className="bg-text-tertiary size-1 rounded-full" />
            <span>{project.dateRelative}</span>
            {project.collaborators.length > 1 && (
              <>
                <span className="bg-text-tertiary size-1 rounded-full" />
                <span>{project.collaborators.join(", ")}</span>
              </>
            )}
          </div>
        </div>

        {shortCommit && (
          <div className="border-border bg-surface text-text-secondary flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs">
            <IconGitCommit
              size={14}
              stroke={2}
              className="text-text-tertiary"
            />
            {shortCommit}
          </div>
        )}
      </div>
    </div>
  );
}
