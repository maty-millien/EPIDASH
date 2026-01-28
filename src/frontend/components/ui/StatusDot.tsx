import type { ProjectStatus } from "@/shared/types"

const statusStyles: Record<ProjectStatus, string> = {
  perfect: "bg-pass shadow-[0_0_8px_var(--color-pass)]",
  passing: "bg-warning shadow-[0_0_8px_var(--color-warning)]",
  failing: "bg-fail",
  critical: "bg-crash animate-pulse-glow text-crash"
}

interface StatusDotProps {
  status: ProjectStatus
  className?: string
}

export function StatusDot({ status, className = "" }: StatusDotProps) {
  return (
    <div
      className={`size-2.5 shrink-0 rounded-full ${statusStyles[status]} ${className}`}
    />
  )
}
