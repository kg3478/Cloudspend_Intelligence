const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

let authToken: string | null = null

export function setAuthToken(token: string) {
  authToken = token

  if (typeof window !== 'undefined') {
    localStorage.setItem('cs_token', token)
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken

  if (typeof window !== 'undefined') {
    return localStorage.getItem('cs_token')
  }

  return null
}

export function clearAuthToken() {
  authToken = null

  if (typeof window !== 'undefined') {
    localStorage.removeItem('cs_token')
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    if (res.status === 401) {
      clearAuthToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    const err = await res
      .json()
      .catch(() => ({ error: res.statusText }))

    throw new Error(
      err.detail || err.error || res.statusText
    )
  }

  return res.json() as Promise<T>
}

export const api = {
  health: () =>
    request<{
      status: string
      database: string
      cache: string
      version: string
      llm_available: boolean
      llm_provider: string
    }>('/health'),

  login: (email: string, password: string) =>
    request<{
      access_token: string
      token_type: string
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  listDatasets: () =>
    request<any[]>('/datasets'),

  getDataset: (id: string) =>
    request<any>(`/datasets/${id}`),

  deleteDataset: (id: string) =>
    request<any>(`/datasets/${id}`, { method: 'DELETE' }),

  ingestDataset: async (
    file: File,
    datasetName: string,
    sourceUrl?: string
  ) => {
    const token = getAuthToken()

    const form = new FormData()
    form.append('file', file)

    const url =
      `${API_URL}/datasets/ingest?dataset_name=${encodeURIComponent(datasetName)}` +
      (sourceUrl
        ? `&source_url=${encodeURIComponent(sourceUrl)}`
        : '')

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
      body: form,
    })

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
      const err = await res
        .json()
        .catch(() => ({ error: res.statusText }))

      throw new Error(
        err.detail || err.error || res.statusText
      )
    }

    return res.json()
  },

  spendSummary: (
    datasetId: string,
    periodStart?: string,
    periodEnd?: string
  ) => {
    const params = new URLSearchParams({
      dataset_id: datasetId,
    })

    if (periodStart) {
      params.set('period_start', periodStart)
    }

    if (periodEnd) {
      params.set('period_end', periodEnd)
    }

    return request<any>(
      `/spend/summary?${params}`
    )
  },

  spendTrend: (
    datasetId: string,
    granularity = 'daily',
    periodStart?: string,
    periodEnd?: string
  ) => {
    const params = new URLSearchParams({
      dataset_id: datasetId,
      granularity,
    })

    if (periodStart) {
      params.set('period_start', periodStart)
    }

    if (periodEnd) {
      params.set('period_end', periodEnd)
    }

    return request<any>(
      `/spend/trend?${params}`
    )
  },

  spendBreakdown: (
    datasetId: string,
    dimension = 'service',
    periodStart?: string,
    periodEnd?: string,
    limit = 10
  ) => {
    const params = new URLSearchParams({
      dataset_id: datasetId,
      dimension,
      limit: String(limit),
    })

    if (periodStart) {
      params.set('period_start', periodStart)
    }

    if (periodEnd) {
      params.set('period_end', periodEnd)
    }

    return request<any[]>(
      `/spend/breakdown?${params}`
    )
  },

  anomalies: (
    datasetId: string,
    entityType = 'service'
  ) =>
    request<any>(
      `/anomalies?dataset_id=${datasetId}&entity_type=${entityType}`
    ),

  opportunities: (datasetId: string) =>
    request<any>(
      `/opportunities?dataset_id=${datasetId}`
    ),

  forecasts: (
    datasetId: string,
    horizonDays = 30
  ) =>
    request<any>(
      `/forecasts?dataset_id=${datasetId}&horizon_days=${horizonDays}`
    ),

  budgets: () =>
    request<any[]>('/budgets'),

  createBudget: (data: any) =>
    request<any>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  runPipeline: (datasetId: string) =>
    request<any>(
      `/agent-runs?dataset_id=${datasetId}`,
      { method: 'POST' }
    ),

  dataQuality: (datasetId: string) =>
    request<any>(
      `/data-quality?dataset_id=${datasetId}`
    ),
}