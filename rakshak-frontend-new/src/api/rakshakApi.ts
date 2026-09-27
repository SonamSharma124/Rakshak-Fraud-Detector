/* =========================================================
   API CONFIG
   ========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000'

/* =========================================================
   BACKEND RESPONSE TYPES
   ========================================================= */

export interface BackendPatternAnalysis {
  verdict?: string
  confidence?: number
  reason?: string
  retrieved_patterns?: string[]
  pattern_model_used?: string
  groundedness_score?: number
  groundedness_matched_keywords?: string[]
}

export interface BackendLinkResult {
  url?: string
  domain?: string
  flags?: string[]
  risk?: string
  risk_level?: string
  riskLevel?: string
}

export interface BackendLinkAnalysis {
  urls_found?: number
  results?: BackendLinkResult[]
  overall_link_risk?: string
}

export interface BackendSystemInfo {
  pattern_model_used?: string
  explanation_model_used?: string
  explanation_tokens?: number
  explanation_estimated_cost?: number
  groundedness_score?: number
}

export interface BackendTiming {
  pattern_agent_seconds?: number
  link_agent_seconds?: number
  verdict_combination_seconds?: number
  explanation_llm_seconds?: number
  total_verification_seconds?: number
}

export interface BackendAnalysisResponse {
  trace_id?: string
  input_type?: string
  extracted_text?: string
  input_text?: string
  final_verdict?: string
  confidence?: number
  contradiction_detected?: boolean
  explanation?: string

  details?: {
    pattern_analysis?: BackendPatternAnalysis
    link_analysis?: BackendLinkAnalysis
    [key: string]: unknown
  }

  system_info?: BackendSystemInfo
  timing?: BackendTiming

    trace?: BackendTraceResponse



  [key: string]: unknown
}

/* =========================================================
   TRACE TYPES
   ========================================================= */

export interface TraceJourneyItem {
  label: string
  detail: string
  color: string
  time: string | null
}

export interface TraceResult {
  traceId: string
  verdict: string
  confidence: number
  timestamp: string
  totalTime: string
  agentCount: number
  journey: TraceJourneyItem[]
}

export interface BackendTraceSpan {
  agent_name: string
  input_summary?: string
  output_summary?: string
  duration_seconds?: number
  timestamp?: string
}

export interface BackendTraceResponse {
  trace_id: string
  total_spans: number
  total_duration_seconds: number
  spans: BackendTraceSpan[]
}

/* =========================================================
   HELPERS
   ========================================================= */

function formatTime(seconds: unknown): string {
  const value = Number(seconds)

  if (!Number.isFinite(value)) {
    return 'Not returned by backend'
  }

  if (value < 1) {
    return `${value.toFixed(3)}s`
  }

  return `${value.toFixed(1)}s`
}

/* =========================================================
   TEXT ANALYSIS
   ========================================================= */

export async function analyzeText(
  text: string,
): Promise<BackendAnalysisResponse> {
  const cleanText = text.trim()

  if (!cleanText) {
    throw new Error(
      'Please enter a message to analyze.',
    )
  }

  const response = await fetch(
    `${API_BASE_URL}/analyze-auto-text`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: cleanText,
      }),
    },
  )

  if (!response.ok) {
    const message =
      await response.text()

    throw new Error(
      `Backend returned ${response.status}: ${message}`,
    )
  }

  const data =
    (await response.json()) as BackendAnalysisResponse

  /*
   * The analysis endpoint gives us the verdict,
   * confidence and trace_id.
   *
   * The detailed agent telemetry is available from
   * /traces/{trace_id}.
   */

  if (data.trace_id) {
    try {
      const traceResponse =
        await fetch(
          `${API_BASE_URL}/traces/${encodeURIComponent(
            data.trace_id,
          )}`,
        )

      if (traceResponse.ok) {
        data.trace =
          (await traceResponse.json()) as BackendTraceResponse
      }
    } catch (error) {
      console.warn(
        '[Rakshak] Trace fetch failed:',
        error,
      )
    }
  }

  return data
}

/* =========================================================
   IMAGE ANALYSIS
   ========================================================= */

export async function analyzeImage(
  file: File,
): Promise<BackendAnalysisResponse> {
  if (!file) {
    throw new Error(
      'Please select an image.',
    )
  }

  const formData = new FormData()

  formData.append(
    'file',
    file,
  )

  const response = await fetch(
    `${API_BASE_URL}/analyze-auto`,
    {
      method: 'POST',
      body: formData,
    },
  )

  if (!response.ok) {
    const message = await response.text()

    throw new Error(
      `Backend returned ${response.status}: ${message}`,
    )
  }

  const data: unknown =
    await response.json()

  return data as BackendAnalysisResponse
}

/* =========================================================
   AUDIO ANALYSIS
   ========================================================= */

export async function analyzeAudio(
  file: File,
): Promise<BackendAnalysisResponse> {
  if (!file) {
    throw new Error(
      'Please select an audio file.',
    )
  }

  const formData = new FormData()

  formData.append(
    'file',
    file,
  )

  const response = await fetch(
    `${API_BASE_URL}/analyze-auto`,
    {
      method: 'POST',
      body: formData,
    },
  )

  if (!response.ok) {
    const message =
      await response.text()

    throw new Error(
      `Backend returned ${response.status}: ${message}`,
    )
  }

  const data =
    (await response.json()) as BackendAnalysisResponse

  /*
   * Fetch trace telemetry just like text analysis.
   */
  if (data.trace_id) {
    try {
      const traceResponse =
        await fetch(
          `${API_BASE_URL}/traces/${encodeURIComponent(
            data.trace_id,
          )}`,
        )

      if (traceResponse.ok) {
        data.trace =
          (await traceResponse.json()) as BackendTraceResponse
      }
    } catch (error) {
      console.warn(
        '[Rakshak] Voice trace fetch failed:',
        error,
      )
    }
  }

  return data
}

/* =========================================================
   TRACE LOOKUP
   ========================================================= */

export async function lookupTrace(
  traceId: string,
): Promise<TraceResult> {
  const cleanTraceId = traceId.trim()

  if (!cleanTraceId) {
    throw new Error(
      'Trace ID is required.',
    )
  }

  const response = await fetch(
    `${API_BASE_URL}/traces/${encodeURIComponent(cleanTraceId)}`,
  )

  if (!response.ok) {
    const message =
      await response.text()

    throw new Error(
      `Trace lookup failed (${response.status}): ${message}`,
    )
  }

  const data: unknown =
    await response.json()

  const backend =
    data as BackendTraceResponse

  const spans =
    Array.isArray(backend.spans)
      ? backend.spans
      : []

  return {
    traceId: backend.trace_id,
    verdict: 'UNKNOWN',
    confidence: 0,
    timestamp:
      spans[0]?.timestamp ??
      '',
    totalTime: formatTime(
      backend.total_duration_seconds,
    ),
    agentCount:
      backend.total_spans ??
      spans.length,
    journey: spans.map(
      (span, index) => ({
        label: span.agent_name,
        detail:
          span.output_summary ??
          span.input_summary ??
          'Agent completed.',
        color:
          index === 0
            ? '#22d3ee'
            : index === 1
              ? '#4ade80'
              : index === 2
                ? '#a78bfa'
                : '#fb923c',
        time:
          span.duration_seconds !==
          undefined
            ? formatTime(
                span.duration_seconds,
              )
            : null,
      }),
    ),
  }
}

/* =========================================================
   HISTORY
   ========================================================= */

export async function fetchHistory(
  limit = 20,
): Promise<never[]> {
  console.warn(
    `[Rakshak] History endpoint is not exposed by the backend. Requested limit: ${limit}`,
  )

  return []
}

