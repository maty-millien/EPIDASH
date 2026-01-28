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
