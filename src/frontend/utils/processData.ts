import type {
  EpitestResult,
  ProjectDetailsResponse,
  DetailedExternalItem,
  SkillReport,
  TestResult
} from "@/shared/types/api"
import type {
  ProcessedProject,
  ProcessedSkill,
  ProjectStatus,
  LintSeverity,
  DashboardSummary,
  FilterStatus,
  SortOption,
  HistoryPoint
} from "@/shared/types/ui"
import { MODULE_NAMES } from "@/shared/constants/modules"

function getRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 1) return "just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getSkillStatus(skill: ProcessedSkill): ProcessedSkill["status"] {
  if (skill.crashed > 0) return "crashed"
  if (skill.passed === skill.count) return "perfect"
  if (skill.passed > 0) return "passed"
  return "failed"
}

function getProjectStatus(project: {
  passRate: number
  hasCrashes: boolean
  hasMandatoryFailed: boolean
}): ProjectStatus {
  if (project.hasCrashes || project.hasMandatoryFailed) return "critical"
  if (project.passRate === 100) return "perfect"
  if (project.passRate >= 50) return "passing"
  return "failing"
}

function getLintSeverity(
  lintCounts: ProcessedProject["lintCounts"]
): LintSeverity {
  if (lintCounts.fatal > 0) return "fatal"
  if (lintCounts.major > 0) return "major"
  if (lintCounts.minor > 0) return "minor"
  return "clean"
}

export function processProject(result: EpitestResult): ProcessedProject {
  const { project, results, date } = result

  // Process skills
  const skills: ProcessedSkill[] = Object.entries(results.skills).map(
    ([name, stats]) => {
      const failed = stats.count - stats.passed - stats.crashed
      const passRate = stats.count > 0 ? (stats.passed / stats.count) * 100 : 0
      const skill: ProcessedSkill = {
        name,
        count: stats.count,
        passed: stats.passed,
        crashed: stats.crashed,
        failed,
        mandatoryFailed: stats.mandatoryFailed,
        passRate,
        status: "failed"
      }
      skill.status = getSkillStatus(skill)
      return skill
    }
  )

  // Sort skills: failed/crashed first, then by name
  skills.sort((a, b) => {
    const statusOrder = { crashed: 0, failed: 1, passed: 2, perfect: 3 }
    const orderDiff = statusOrder[a.status] - statusOrder[b.status]
    if (orderDiff !== 0) return orderDiff
    return a.name.localeCompare(b.name)
  })

  // Calculate totals
  const totalTests = skills.reduce((sum, s) => sum + s.count, 0)
  const passedTests = skills.reduce((sum, s) => sum + s.passed, 0)
  const crashedTests = skills.reduce((sum, s) => sum + s.crashed, 0)
  const failedTests = totalTests - passedTests - crashedTests
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0

  // Parse lint counts
  const lintCounts = {
    fatal: 0,
    major: 0,
    minor: 0,
    info: 0,
    note: 0
  }

  for (const item of results.externalItems) {
    if (item.type === "lint.fatal") lintCounts.fatal = item.value
    else if (item.type === "lint.major") lintCounts.major = item.value
    else if (item.type === "lint.minor") lintCounts.minor = item.value
    else if (item.type === "lint.info") lintCounts.info = item.value
    else if (item.type === "lint.note") lintCounts.note = item.value
  }

  const hasCrashes = crashedTests > 0
  const hasMandatoryFailed = results.mandatoryFailed > 0

  const processed: ProcessedProject = {
    slug: project.slug,
    name: project.name,
    moduleCode: project.module.code,
    moduleName: MODULE_NAMES[project.module.code] || project.module.code,
    date: new Date(date),
    dateRelative: getRelativeDate(new Date(date)),
    collaborators: results.logins.map((login) => login.split("@")[0]),
    totalTests,
    passedTests,
    failedTests,
    crashedTests,
    passRate,
    status: "failing",
    hasCrashes,
    hasMandatoryFailed,
    lintSeverity: getLintSeverity(lintCounts),
    lintCounts,
    skills,
    testRunId: results.testRunId
  }

  processed.status = getProjectStatus(processed)

  return processed
}

export function processAllProjects(
  results: EpitestResult[]
): ProcessedProject[] {
  return results
    .map(processProject)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}

export function calculateSummary(
  projects: ProcessedProject[]
): DashboardSummary {
  const totalProjects = projects.length
  const totalTests = projects.reduce((sum, p) => sum + p.totalTests, 0)
  const totalPassed = projects.reduce((sum, p) => sum + p.passedTests, 0)
  const overallPassRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0

  const perfectCount = projects.filter((p) => p.status === "perfect").length
  const passingCount = projects.filter((p) => p.status === "passing").length
  const failingCount = projects.filter((p) => p.status === "failing").length
  const criticalCount = projects.filter((p) => p.status === "critical").length

  return {
    totalProjects,
    totalTests,
    totalPassed,
    overallPassRate,
    perfectCount,
    passingCount,
    failingCount,
    criticalCount
  }
}

export function filterProjects(
  projects: ProcessedProject[],
  status: FilterStatus,
  moduleFilter: string | null,
  searchQuery: string
): ProcessedProject[] {
  return projects.filter((project) => {
    // Status filter
    if (status === "perfect" && project.status !== "perfect") return false
    if (status === "passing" && project.status !== "passing") return false
    if (
      status === "needs-work" &&
      project.status !== "failing" &&
      project.status !== "critical"
    )
      return false

    // Module filter
    if (moduleFilter && project.moduleCode !== moduleFilter) return false

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = project.name.toLowerCase().includes(query)
      const matchesSlug = project.slug.toLowerCase().includes(query)
      const matchesModule = project.moduleCode.toLowerCase().includes(query)
      if (!matchesName && !matchesSlug && !matchesModule) return false
    }

    return true
  })
}

export function sortProjects(
  projects: ProcessedProject[],
  sortBy: SortOption
): ProcessedProject[] {
  const sorted = [...projects]

  switch (sortBy) {
    case "date":
      sorted.sort((a, b) => b.date.getTime() - a.date.getTime())
      break
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "passRate":
      sorted.sort((a, b) => b.passRate - a.passRate)
      break
    case "status":
      const statusOrder = { critical: 0, failing: 1, passing: 2, perfect: 3 }
      sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
      break
  }

  return sorted
}

export function getUniqueModules(projects: ProcessedProject[]): string[] {
  const modules = new Set(projects.map((p) => p.moduleCode))
  return Array.from(modules).sort()
}

// Process history data for progression chart
export function processProjectHistory(
  history: EpitestResult[]
): HistoryPoint[] {
  return history
    .map((result) => {
      const skills = Object.values(result.results.skills)
      const totalTests = skills.reduce((sum, s) => sum + s.count, 0)
      const passedTests = skills.reduce((sum, s) => sum + s.passed, 0)
      const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0

      return {
        date: new Date(result.date),
        testRunId: result.results.testRunId,
        passedTests,
        totalTests,
        passRate
      }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

// Extract console output from external items
export function extractConsoleOutput(
  externalItems: DetailedExternalItem[]
): string | null {
  const tracePool = externalItems.find((item) => item.type === "trace-pool")
  return tracePool?.comment || null
}

// Process skill report to get test results
export function extractTestsFromSkill(
  skill: SkillReport
): { name: string; tests: TestResult[] } | null {
  if ("FullSkillReport" in skill) {
    return {
      name: skill.FullSkillReport.name,
      tests: skill.FullSkillReport.tests
    }
  }
  return null
}

// Get all tests from details response
export function getAllTestsFromDetails(
  details: ProjectDetailsResponse
): { skillName: string; tests: TestResult[] }[] {
  return details.skills
    .map((skill) => {
      const extracted = extractTestsFromSkill(skill)
      if (extracted) {
        return { skillName: extracted.name, tests: extracted.tests }
      }
      return null
    })
    .filter(
      (item): item is { skillName: string; tests: TestResult[] } =>
        item !== null
    )
}

// Get coverage info from external items
export function extractCoverage(externalItems: DetailedExternalItem[]): {
  lines: number
  branches: number
} {
  const lineCoverage = externalItems.find(
    (item) => item.type === "coverage.lines"
  )
  const branchCoverage = externalItems.find(
    (item) => item.type === "coverage.branches"
  )

  return {
    lines: lineCoverage?.value ?? 0,
    branches: branchCoverage?.value ?? 0
  }
}

export interface ActivityTrendPoint {
  date: Date
  passRate: number
  testRuns: number
}

export function aggregateActivityTrends(
  projects: ProcessedProject[],
  range: "7d" | "30d" | "all"
): ActivityTrendPoint[] {
  const now = new Date()
  const cutoff = new Date()

  if (range === "7d") {
    cutoff.setDate(now.getDate() - 7)
  } else if (range === "30d") {
    cutoff.setDate(now.getDate() - 30)
  } else {
    cutoff.setFullYear(2000)
  }

  const filtered = projects.filter((p) => p.date >= cutoff)

  const grouped = new Map<string, { passRates: number[]; count: number }>()

  for (const project of filtered) {
    const dateKey = project.date.toISOString().split("T")[0]
    const existing = grouped.get(dateKey)
    if (existing) {
      existing.passRates.push(project.passRate)
      existing.count++
    } else {
      grouped.set(dateKey, { passRates: [project.passRate], count: 1 })
    }
  }

  const result: ActivityTrendPoint[] = []
  for (const [dateStr, data] of grouped) {
    const avgPassRate =
      data.passRates.reduce((a, b) => a + b, 0) / data.passRates.length
    result.push({
      date: new Date(dateStr),
      passRate: avgPassRate,
      testRuns: data.count
    })
  }

  return result.sort((a, b) => a.date.getTime() - b.date.getTime())
}
