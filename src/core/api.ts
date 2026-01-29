// API calls to epitest.eu (replaces Rust reqwest calls)

const API_BASE = "https://api.epitest.eu";

export async function fetchEpitestData(
  token: string,
  year: number,
): Promise<unknown> {
  const response = await fetch(`${API_BASE}/me/${year}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchProjectDetails(
  token: string,
  testRunId: number,
): Promise<unknown> {
  const response = await fetch(`${API_BASE}/me/details/${testRunId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchProjectHistory(
  token: string,
  moduleCode: string,
  projectSlug: string,
  year: number,
): Promise<unknown> {
  const response = await fetch(
    `${API_BASE}/me/${year}/${moduleCode}/${projectSlug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
