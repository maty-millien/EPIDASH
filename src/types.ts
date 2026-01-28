// Raw API types from Epitest
export interface EpitestResult {
  project: {
    slug: string
    name: string
    module: {
      code: string
    }
    skills: unknown[]
  }
  results: {
    testRunId: number
    logins: string[]
    prerequisites: number
    externalItems: ExternalItem[]
    mandatoryFailed: number
    skills: Record<string, SkillStats>
  }
  date: string
}

export interface ExternalItem {
  type: string
  value: number
}

export interface SkillStats {
  count: number
  passed: number
  crashed: number
  mandatoryFailed: number
}

// Processed types for display
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

// Details API response types
export interface ProjectDetailsResponse {
  instance: {
    moduleCode: string
    projectSlug: string
    projectName: string
    code: string
    city: string
    year: number
  }
  type: string
  date: string
  skills: SkillReport[]
  externalItems: DetailedExternalItem[]
  gitCommit: string
}

export type SkillReport =
  | { FullSkillReport: { name: string; tests: TestResult[] } }
  | { BreakdownSkillReport: { name: string; breakdown: SkillStats } }

export interface TestResult {
  name: string
  passed: boolean
  crashed: boolean
  skipped: boolean
  mandatory: boolean
  comment: string
}

export interface DetailedExternalItem {
  type: string
  value: number
  comment: string
}

// History for progression charts
export interface HistoryPoint {
  date: Date
  testRunId: number
  passedTests: number
  totalTests: number
  passRate: number
}

// View navigation
export type View =
  | { type: "dashboard" }
  | { type: "project-details"; project: ProcessedProject }
