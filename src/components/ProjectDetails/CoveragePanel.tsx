import { IconCode, IconGitBranch } from "@tabler/icons-react"

interface CoveragePanelProps {
  lines: number
  branches: number
}

function getCoverageColor(value: number): string {
  if (value >= 80) return "text-pass"
  if (value >= 50) return "text-warning"
  return "text-fail"
}

function getCoverageBg(value: number): string {
  if (value >= 80) return "bg-pass"
  if (value >= 50) return "bg-warning"
  return "bg-fail"
}

export function CoveragePanel({ lines, branches }: CoveragePanelProps) {
  return (
    <div className="bg-surface border-border rounded-xl border p-5">
      <h2 className="text-text-secondary mb-4 text-xs font-semibold uppercase tracking-wider">
        Coverage
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Lines coverage */}
        <div className="flex items-center gap-4">
          <div className="bg-elevated flex size-10 shrink-0 items-center justify-center rounded-lg">
            <IconCode size={20} stroke={2} className="text-text-tertiary" />
          </div>
          <div className="flex-1">
            <div className="text-text-tertiary mb-1 text-xs">Lines</div>
            <div className="mb-2 flex items-baseline gap-2">
              <span className={`font-mono text-2xl font-bold ${getCoverageColor(lines)}`}>
                {lines}%
              </span>
            </div>
            <div className="bg-elevated h-1.5 w-full overflow-hidden rounded-full">
              <div
                className={`h-full transition-all duration-500 ${getCoverageBg(lines)}`}
                style={{ width: `${lines}%` }}
              />
            </div>
          </div>
        </div>

        {/* Branches coverage */}
        <div className="flex items-center gap-4">
          <div className="bg-elevated flex size-10 shrink-0 items-center justify-center rounded-lg">
            <IconGitBranch size={20} stroke={2} className="text-text-tertiary" />
          </div>
          <div className="flex-1">
            <div className="text-text-tertiary mb-1 text-xs">Branches</div>
            <div className="mb-2 flex items-baseline gap-2">
              <span className={`font-mono text-2xl font-bold ${getCoverageColor(branches)}`}>
                {branches}%
              </span>
            </div>
            <div className="bg-elevated h-1.5 w-full overflow-hidden rounded-full">
              <div
                className={`h-full transition-all duration-500 ${getCoverageBg(branches)}`}
                style={{ width: `${branches}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
