export type ProjectStatus = "perfect" | "passing" | "failing" | "critical"
export type LintSeverity = "clean" | "minor" | "major" | "fatal"

export interface ProcessedSkill {
  name: string
  count: number
  passed: number
  crashed: number
  failed: number
  mandatoryFailed: number
  passRate: number
  status: "perfect" | "passed" | "failed" | "crashed"
}

export interface ProcessedProject {
  slug: string
  name: string
  moduleCode: string
  moduleName: string
  date: Date
  dateRelative: string
  collaborators: string[]
  totalTests: number
  passedTests: number
  failedTests: number
  crashedTests: number
  passRate: number
  status: ProjectStatus
  hasCrashes: boolean
  hasMandatoryFailed: boolean
  lintSeverity: LintSeverity
  lintCounts: {
    fatal: number
    major: number
    minor: number
    info: number
    note: number
  }
  skills: ProcessedSkill[]
  testRunId: number
}

export interface DashboardSummary {
  totalProjects: number
  totalTests: number
  totalPassed: number
  overallPassRate: number
  perfectCount: number
  passingCount: number
  failingCount: number
  criticalCount: number
}

export type FilterStatus = "all" | "perfect" | "passing" | "needs-work"
export type SortOption = "date" | "name" | "passRate" | "status"

export interface HistoryPoint {
  date: Date
  testRunId: number
  passedTests: number
  totalTests: number
  passRate: number
}

export type View =
  | { type: "dashboard" }
  | { type: "project-details"; project: ProcessedProject }
