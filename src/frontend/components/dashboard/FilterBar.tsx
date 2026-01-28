import { IconChevronDown, IconSearch } from "@tabler/icons-react"
import { motion } from "framer-motion"
import type { FilterStatus } from "@/shared/types/ui"

interface FilterBarProps {
  status: FilterStatus
  onStatusChange: (status: FilterStatus) => void
  modules: string[]
  selectedModule: string | null
  onModuleChange: (module: string | null) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "perfect", label: "Complete" },
  { value: "passing", label: "Partial" },
  { value: "needs-work", label: "Review" }
]

export function FilterBar({
  status,
  onStatusChange,
  modules,
  selectedModule,
  onModuleChange,
  searchQuery,
  onSearchChange
}: FilterBarProps) {
  return (
    <motion.div
      className="mb-6 flex flex-wrap items-center gap-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
    >
      <div className="border-border bg-surface flex h-10 gap-1 rounded-lg border p-1">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={`rounded-md px-4 py-1 font-sans text-sm font-medium transition-all duration-150 ${
              status === option.value
                ? "bg-accent-dim text-accent"
                : "text-text-secondary hover:bg-hover hover:text-text"
            } `}
          >
            {option.label}
          </button>
        ))}
      </div>

      {modules.length > 1 && (
        <div className="relative">
          <select
            value={selectedModule || ""}
            onChange={(e) => onModuleChange(e.target.value || null)}
            className="border-border bg-surface text-text focus:border-accent h-10 cursor-pointer appearance-none rounded-lg border py-2 pr-8 pl-3 font-sans text-sm focus:outline-none"
          >
            <option value="">All Modules</option>
            {modules.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
          <IconChevronDown
            size={16}
            stroke={2}
            className="text-text-tertiary pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
          />
        </div>
      )}

      <div className="relative min-w-50 flex-1">
        <IconSearch
          size={16}
          stroke={2}
          className="text-text-tertiary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-border bg-surface text-text placeholder:text-text-tertiary focus:border-accent h-10 w-full rounded-lg border py-2 pr-3 pl-9 font-sans text-sm focus:outline-none"
        />
      </div>
    </motion.div>
  )
}
