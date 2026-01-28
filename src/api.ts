// API calls to epitest.eu (replaces Rust reqwest calls)

const API_BASE = 'https://api.epitest.eu'

export async function fetchEpitestData(token: string): Promise<unknown> {
  const response = await fetch(`${API_BASE}/me/2025`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

export async function fetchProjectDetails(
  token: string,
  testRunId: number
): Promise<unknown> {
  const response = await fetch(`${API_BASE}/me/details/${testRunId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

export async function fetchProjectHistory(
  token: string,
  moduleCode: string,
  projectSlug: string
): Promise<unknown> {
  const response = await fetch(
    `${API_BASE}/me/2025/${moduleCode}/${projectSlug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}
