import { useCallback, useState } from 'react'

import {
  analyzeText,
  analyzeImage,
  analyzeAudio,
  type BackendAnalysisResponse,
} from '../api/rakshakApi'


export type AnalysisInput =
  | {
      mode: 'text'
      text: string
    }
  | {
      mode: 'image'
      file: File
    }
  | {
      mode: 'voice'
      file: File
    }

export type RiskFactor = {
  label: string
  level: 'low' | 'medium' | 'high' | string
}

export type RagEvidence = {
  id: number
  title: string
  excerpt: string
  similarity?: number | string
  category?: string
}

export type LinkAnalysis = {
  url: string
  riskLevel: string
  source: string
  flags: string[]
}

export type Timing = {
  patternAgentSeconds: number
  linkAgentSeconds: number
  verdictCombinationSeconds: number
  explanationLlmSeconds: number
  totalVerificationSeconds: number
}

export type PipelineStep = {
  num: number
  name: string
  desc: string
  time: string
  color: string
  progress: number
}

export type ExplanationStep = {
  step: string
  title: string
  body: string
}

export type HistoryItem = {
  traceId: string
  verdict: string
  confidence: number
  timestamp: string
  inputPreview: string
}

export type TraceJourneyItem = {
  label: string
  detail: string
  color: string
  time: string | null
}

export type TraceResult = {
  traceId: string
  verdict: string
  confidence: number
  timestamp: string
  totalTime: string
  agentCount: number
  journey: TraceJourneyItem[]
}

export type AnalysisResult = {
  verdict: string
  confidence: number
  riskScore: number | null
  traceId: string
  checkedAt: string
  inputPreview: string

  reasons: string[]
  riskFactors: RiskFactor[]

  ragEvidence: RagEvidence[]
  links: LinkAnalysis[]

  explanation: string
  explanationSteps: ExplanationStep[]

  explanationModelUsed: string
  explanationTokens: number
  explanationEstimatedCost: number

  patternModelUsed: string

  groundedness: number | null
  groundednessKeywords: string[]

  timing: Timing
  pipeline: PipelineStep[]

  rawBackendResponse: BackendAnalysisResponse
}

export const HISTORY_STORAGE_KEY =
  'rakshak_history'

function toFiniteNumber(
  value: unknown,
  fallback = 0,
): number {
  const number = Number(value)

  return Number.isFinite(number)
    ? number
    : fallback
}

function confidenceToPercent(
  value: unknown,
): number {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return 0
  }

  if (number >= 0 && number <= 1) {
    return Math.round(number * 100)
  }

  return Math.round(number)
}

function formatSeconds(
  value: number | undefined | null,
): string {
  if (
    value === undefined ||
    value === null ||
    Number.isNaN(value)
  ) {
    return 'Not returned by backend'
  }

  return `${value.toFixed(3)}s`
}

function safeStringArray(
  value: unknown,
): string[] {
  return Array.isArray(value)
    ? value.filter(
        item => typeof item === 'string',
      )
    : []
}

/* =========================================================
   PIPELINE
   ========================================================= */

function buildPipeline(
  backend: BackendAnalysisResponse,
  timing: Timing,
): PipelineStep[] {
  const pattern =
    backend.details?.pattern_analysis

  const link =
    backend.details?.link_analysis

  const spans =
    backend.trace?.spans ?? []

  const hasAgent =
    (
      name: string,
    ) =>
      spans.some(
        span =>
          span.agent_name
            ?.toLowerCase()
            .includes(
              name.toLowerCase(),
            ),
      )

  const intakeDone =
    Boolean(
      backend.extracted_text ||
      backend.input_text ||
      hasAgent('intake'),
    )

  const linkDone =
    Boolean(
      link ||
      hasAgent('link'),
    )

  const patternDone =
    Boolean(
      pattern ||
      hasAgent('pattern'),
    )

  const verificationDone =
    Boolean(
      backend.final_verdict ||
      hasAgent('verification'),
    )

  return [
    {
      num: 1,
      name: 'Intake Agent',
      desc:
        'Detect input type & extract text',
      time:
        intakeDone
          ? 'Completed'
          : 'Not returned by backend',
      color: '#22d3ee',
      progress:
        intakeDone
          ? 100
          : 0,
    },

    {
      num: 2,
      name: 'Link Agent',
      desc:
        'Analyze URLs via rule-based engine',
      time:
        linkDone
          ? formatSeconds(
              timing.linkAgentSeconds,
            )
          : 'Not returned by backend',
      color: '#4ade80',
      progress:
        linkDone
          ? 100
          : 0,
    },

    {
      num: 3,
      name: 'Pattern Agent',
      desc:
        'RAG-based semantic matching',
      time:
        patternDone
          ? formatSeconds(
              timing.patternAgentSeconds,
            )
          : 'Not returned by backend',
      color: '#a78bfa',
      progress:
        patternDone
          ? 100
          : 0,
    },

    {
      num: 4,
      name: 'Verification Agent',
      desc:
        'Combine results & detect conflicts',
      time:
        verificationDone
          ? formatSeconds(
              timing.totalVerificationSeconds,
            )
          : 'Not returned by backend',
      color: '#fb923c',
      progress:
        verificationDone
          ? 100
          : 0,
    },
  ]
}
/* =========================================================
   REASONS
   ========================================================= */

function buildReasons(
  backend: BackendAnalysisResponse,
): string[] {
  const pattern =
    backend.details?.pattern_analysis

  const reasons: string[] = []

  if (pattern?.reason) {
    reasons.push(pattern.reason)
  }

  if (
    backend.explanation &&
    !reasons.includes(
      backend.explanation,
    )
  ) {
    reasons.push(
      backend.explanation,
    )
  }

  if (
    backend.contradiction_detected ===
    true
  ) {
    reasons.push(
      'A contradiction was detected between the available agent analyses.',
    )
  } else if (
    backend.contradiction_detected ===
    false
  ) {
    reasons.push(
      'No contradiction detected between the available agent analyses.',
    )
  }

  if (reasons.length === 0) {
    reasons.push(
      'No additional reasoning was returned by the backend.',
    )
  }

  return reasons
}

/* =========================================================
   RISK FACTORS
   ========================================================= */

function buildRiskFactors(
  backend: BackendAnalysisResponse,
): RiskFactor[] {
  const pattern =
    backend.details?.pattern_analysis

  const link =
    backend.details?.link_analysis

  const factors: RiskFactor[] = []

  if (pattern?.reason) {
    factors.push({
      label:
        'Known scam pattern match',
      level: 'high',
    })
  }

  const groundedness =
    pattern?.groundedness_score ??
    backend.system_info
      ?.groundedness_score

  if (groundedness !== undefined) {
    const score =
      toFiniteNumber(groundedness)

    factors.push({
      label:
        `Groundedness score: ${score}`,
      level:
        score >= 0.75
          ? 'high'
          : score >= 0.4
            ? 'medium'
            : 'low',
    })
  }

  const keywords =
    safeStringArray(
      pattern?.groundedness_matched_keywords,
    )

  if (keywords.length > 0) {
    factors.push({
      label:
        `Matched keywords: ${keywords.join(', ')}`,
      level: 'medium',
    })
  }

  const urlsFound =
    toFiniteNumber(
      link?.urls_found,
    )

  if (urlsFound > 0) {
    factors.push({
      label:
        `${urlsFound} URL(s) detected`,
      level: 'high',
    })
  }

  const linkFlags =
    Array.isArray(link?.results)
      ? link.results.flatMap(
          item =>
            safeStringArray(
              item?.flags,
            ),
        )
      : []

  if (linkFlags.length > 0) {
    factors.push({
      label:
        `${linkFlags.length} URL risk flag(s) returned by Link Agent`,
      level: 'high',
    })
  }

  if (factors.length === 0) {
    factors.push({
      label:
        'No explicit risk factors were returned by the backend.',
      level: 'low',
    })
  }

  return factors
}

/* =========================================================
   RAG
   ========================================================= */

function buildRagEvidence(
  backend: BackendAnalysisResponse,
): RagEvidence[] {
  const patterns =
    safeStringArray(
      backend.details
        ?.pattern_analysis
        ?.retrieved_patterns,
    )

  return patterns.map(
    (item, index) => {
      const colonIndex =
        item.indexOf(':')

      if (colonIndex > 0) {
        return {
          id: index + 1,
          title:
            item
              .substring(
                0,
                colonIndex,
              )
              .trim(),
          excerpt:
            item
              .substring(
                colonIndex + 1,
              )
              .trim(),
          category:
            'Scam Pattern',
        }
      }

      return {
        id: index + 1,
        title:
          `Retrieved Pattern ${index + 1}`,
        excerpt: item,
        category:
          'Scam Pattern',
      }
    },
  )
}

/* =========================================================
   LINKS
   ========================================================= */

function buildLinks(
  backend: BackendAnalysisResponse,
): LinkAnalysis[] {
  const link =
    backend.details?.link_analysis

  if (
    !link ||
    !Array.isArray(link.results)
  ) {
    return []
  }

  return link.results
    .filter(item =>
      Boolean(item?.url),
    )
    .map(item => ({
      url: String(item.url),

      riskLevel:
        item.risk ??
        item.risk_level ??
        link.overall_link_risk ??
        'unknown',

      source:
        'Extracted from message · Link Agent',

      flags:
        safeStringArray(
          item.flags,
        ),
    }))
}

/* =========================================================
   EXPLANATION STEPS
   ========================================================= */

function buildExplanationSteps(
  backend: BackendAnalysisResponse,
): ExplanationStep[] {
  const pattern =
    backend.details?.pattern_analysis

  const link =
    backend.details?.link_analysis

  const steps: ExplanationStep[] =
    []

  if (pattern?.reason) {
    steps.push({
      step: '01',
      title:
        'Pattern Analysis',
      body: pattern.reason,
    })
  }

  const retrieved =
    safeStringArray(
      pattern?.retrieved_patterns,
    )

  if (retrieved.length > 0) {
    steps.push({
      step: '02',
      title:
        'RAG Evidence',
      body:
        `The Pattern Agent retrieved ${retrieved.length} matching scam pattern(s) from the knowledge base.`,
    })
  }

  if (link) {
    const urlsFound =
      toFiniteNumber(
        link.urls_found,
      )

    steps.push({
      step: '03',
      title:
        'Link Analysis',
      body:
        urlsFound > 0
          ? `${urlsFound} URL(s) were detected and analyzed by the Link Agent.`
          : 'No URLs were detected in the submitted message.',
    })
  }

  if (backend.final_verdict) {
    const confidence =
      confidenceToPercent(
        backend.confidence,
      )

    steps.push({
      step: '04',
      title:
        'Final Verification',
      body:
        backend.explanation ||
        `The final verdict is "${backend.final_verdict}" with a confidence of ${confidence}%.`,
    })
  }

  return steps
}

/* =========================================================
   NORMALIZE BACKEND RESULT
   ========================================================= */

export function normalizeAnalysisResult(
  raw: BackendAnalysisResponse,
): AnalysisResult {
  /*
   * The backend response may be returned directly
   * or wrapped inside result / analysis / data.
   *
   * Find the actual analysis payload first.
   */

  const findPayload = (
    value: any,
  ): any => {
    if (!value || typeof value !== 'object') {
      return {}
    }

    if (
      value.final_verdict !== undefined ||
      value.verdict !== undefined ||
      value.trace_id !== undefined ||
      value.confidence !== undefined
    ) {
      return value
    }

    if (
      value.result &&
      typeof value.result === 'object'
    ) {
      return findPayload(value.result)
    }

    if (
      value.analysis &&
      typeof value.analysis === 'object'
    ) {
      return findPayload(value.analysis)
    }

    if (
      value.data &&
      typeof value.data === 'object'
    ) {
      return findPayload(value.data)
    }

    if (
      value.response &&
      typeof value.response === 'object'
    ) {
      return findPayload(value.response)
    }

    return value
  }

  const backend: any =
    findPayload(raw)

  /*
   * Support both the current backend names
   * and equivalent aliases.
   */

  const finalVerdict =
    backend.final_verdict ??
    backend.verdict ??
    backend.result?.final_verdict ??
    backend.result?.verdict ??
    backend.analysis?.final_verdict ??
    backend.analysis?.verdict ??
    'unknown'

  const confidence =
    backend.confidence ??
    backend.result?.confidence ??
    backend.analysis?.confidence ??
    0

  const traceId =
    backend.trace_id ??
    backend.traceId ??
    backend.result?.trace_id ??
    backend.analysis?.trace_id ??
    ''

  const extractedText =
    backend.extracted_text ??
    backend.input_text ??
    backend.message ??
    backend.text ??
    backend.result?.extracted_text ??
    backend.result?.input_text ??
    ''

  const details =
    backend.details ??
    backend.result?.details ??
    backend.analysis?.details ??
    {}

  const pattern =
    details.pattern_analysis ??
    details.pattern ??
    backend.pattern_analysis ??
    backend.pattern ??
    {}

  const link =
    details.link_analysis ??
    details.links ??
    backend.link_analysis ??
    {}

  const systemInfo =
    backend.system_info ??
    backend.result?.system_info ??
    backend.analysis?.system_info ??
    {}

  const backendTiming =
    backend.timing ??
    backend.result?.timing ??
    backend.analysis?.timing ??
    {}

  /*
   * Timing
   */

  const timing: Timing = {
    patternAgentSeconds:
      toFiniteNumber(
        backendTiming.pattern_agent_seconds ??
        backendTiming.pattern_seconds ??
        pattern.duration_seconds ??
        0,
      ),

    linkAgentSeconds:
      toFiniteNumber(
        backendTiming.link_agent_seconds ??
        backendTiming.link_seconds ??
        link.duration_seconds ??
        0,
      ),

    verdictCombinationSeconds:
      toFiniteNumber(
        backendTiming.verdict_combination_seconds ??
        backendTiming.verification_seconds ??
        0,
      ),

    explanationLlmSeconds:
      toFiniteNumber(
        backendTiming.explanation_llm_seconds ??
        backendTiming.explanation_seconds ??
        0,
      ),

    totalVerificationSeconds:
      toFiniteNumber(
        backendTiming.total_verification_seconds ??
        backendTiming.total_duration_seconds ??
        backend.total_duration_seconds ??
        0,
      ),
  }

  /*
   * Groundedness
   */

  const groundedness =
    pattern.groundedness_score ??
    systemInfo.groundedness_score ??
    null

  /*
   * Models
   */

  const patternModelUsed =
    systemInfo.pattern_model_used ??
    pattern.pattern_model_used ??
    backend.pattern_model_used ??
    'Not returned by backend'

  const explanationModelUsed =
    systemInfo.explanation_model_used ??
    backend.explanation_model_used ??
    'Not returned by backend'

  const explanationTokens =
    toFiniteNumber(
      systemInfo.explanation_tokens ??
      backend.explanation_tokens ??
      0,
    )

  const explanationEstimatedCost =
    toFiniteNumber(
      systemInfo.explanation_estimated_cost ??
      backend.explanation_estimated_cost ??
      0,
    )
  const riskScore =
  raw.risk_score !== undefined &&
  raw.risk_score !== null
    ? toFiniteNumber(raw.risk_score)
    : null

  /*
   * Explanation
   */

   const traceExplanation =
  backend.trace?.spans
    ?.find(
      (span: {
        agent_name?: string
        output_summary?: string
      }) =>
        span.agent_name
          ?.toLowerCase()
          .includes('verification'),
    )
    ?.output_summary

const explanation =
  backend.explanation ??
  backend.reason ??
  pattern.reason ??
  backend.result?.explanation ??
  traceExplanation ??
  'The backend did not return a detailed explanation.'
  /*
   * Reasons
   */

  const reasons: string[] = []

  if (pattern.reason) {
    reasons.push(
      String(pattern.reason),
    )
  }

  if (
    explanation &&
    !reasons.includes(
      String(explanation),
    )
  ) {
    reasons.push(
      String(explanation),
    )
  }

  if (
    backend.contradiction_detected ===
    true
  ) {
    reasons.push(
      'A contradiction was detected between the available agent analyses.',
    )
  }

  if (reasons.length === 0) {
    reasons.push(
      'No additional reasoning was returned by the backend.',
    )
  }

  /*
   * RAG evidence
   */

  const retrievedPatterns =
    safeStringArray(
      pattern.retrieved_patterns,
    )

  const ragEvidence: RagEvidence[] =
    retrievedPatterns.map(
      (item, index) => {
        const colonIndex =
          item.indexOf(':')

        if (colonIndex > 0) {
          return {
            id: index + 1,
            title:
              item
                .substring(
                  0,
                  colonIndex,
                )
                .trim(),

            excerpt:
              item
                .substring(
                  colonIndex + 1,
                )
                .trim(),

            category:
              'Scam Pattern',
          }
        }

        return {
          id: index + 1,
          title:
            `Retrieved Pattern ${index + 1}`,
          excerpt: item,
          category:
            'Scam Pattern',
        }
      },
    )

  /*
   * Link analysis
   *
   * Support:
   * details.link_analysis.results
   * details.link_analysis.urls
   * details.link_analysis.links
   */

  const rawLinks =
    Array.isArray(link.results)
      ? link.results
      : Array.isArray(link.urls)
        ? link.urls.map(
            (url: string) => ({
              url,
            }),
          )
        : Array.isArray(link.links)
          ? link.links
          : []

  const links: LinkAnalysis[] =
    rawLinks
      .map(
        (item: any) => {
          if (
            typeof item ===
            'string'
          ) {
            return {
              url: item,
              riskLevel:
                link.overall_link_risk ??
                link.risk_level ??
                'unknown',
              source:
                'Extracted from message · Link Agent',
              flags: [],
            }
          }

          return {
            url:
              item?.url ??
              item?.link ??
              '',

            riskLevel:
              item?.risk ??
              item?.risk_level ??
              item?.riskLevel ??
              link.overall_link_risk ??
              link.risk_level ??
              'unknown',

            source:
              'Extracted from message · Link Agent',

            flags:
              safeStringArray(
                item?.flags,
              ),
          }
        },
      )
      .filter(
  (item: { url?: string }) =>
    Boolean(item.url),
)

  /*
   * Risk factors
   */

  const riskFactors: RiskFactor[] = []

  if (
    String(
      pattern.verdict ??
      '',
    ).toLowerCase() ===
    'scam'
  ) {
    riskFactors.push({
      label:
        'Known scam pattern match',
      level: 'high',
    })
  }

  if (
    String(
      finalVerdict,
    ).toLowerCase() ===
    'scam'
  ) {
    riskFactors.push({
      label:
        'Final verification classified the message as a scam',
      level: 'high',
    })
  }


  const keywords =
  safeStringArray(
    pattern.groundedness_matched_keywords,
  )
  const urlsFound =
    toFiniteNumber(
      link.urls_found,
    )

  if (urlsFound > 0) {
    riskFactors.push({
      label:
        `${urlsFound} URL(s) detected`,
      level: 'high',
    })
  }

  if (links.length > 0) {
    riskFactors.push({
      label:
        `${links.length} URL(s) analyzed by the Link Agent`,
      level: 'high',
    })
  }

  if (riskFactors.length === 0) {
    riskFactors.push({
      label:
        'No explicit risk factors were returned by the backend.',
      level: 'low',
    })
  }

  /*
   * Explanation steps
   */

  const explanationSteps: ExplanationStep[] =
    []

  if (pattern.reason) {
    explanationSteps.push({
      step: '01',
      title:
        'Pattern Analysis',
      body:
        String(pattern.reason),
    })
  }

  if (
    retrievedPatterns.length >
    0
  ) {
    explanationSteps.push({
      step: '02',
      title:
        'RAG Evidence',
      body:
        `The Pattern Agent retrieved ${retrievedPatterns.length} matching scam pattern(s) from the knowledge base.`,
    })
  }

  if (
    urlsFound > 0 ||
    links.length > 0
  ) {
    explanationSteps.push({
      step: '03',
      title:
        'Link Analysis',
      body:
        `${urlsFound || links.length} URL(s) were detected and analyzed by the Link Agent.`,
    })
  }

  if (
    finalVerdict &&
    finalVerdict !== 'unknown'
  ) {
    explanationSteps.push({
      step: '04',
      title:
        'Final Verification',
      body:
        String(explanation),
    })
  }

  /*
   * Final normalized result
   */

  const normalized: AnalysisResult = {
    verdict:
      String(
        finalVerdict,
      )
        .trim()
        .toLowerCase(),

    confidence:
      confidenceToPercent(
        confidence,
      ),

      riskScore,

    traceId:
      String(traceId),

    checkedAt:
      new Date().toLocaleString(),

    inputPreview:
      String(
        extractedText,
      ),

    reasons,

    riskFactors,

    ragEvidence,

    links,

    explanation:
      String(explanation),

    explanationSteps,

    explanationModelUsed,

    explanationTokens,

    explanationEstimatedCost,

    patternModelUsed,

    groundedness:
      groundedness !== null &&
      groundedness !== undefined
        ? toFiniteNumber(
            groundedness,
          )
        : null,

    groundednessKeywords:
      keywords,

    timing,

    pipeline:
      buildPipeline(
        backend,
        timing,
      ),

    rawBackendResponse:
      raw,
  }

  /*
   * DEBUG:
   * This will show us the actual backend
   * payload if something is still different.
   */
  console.log(
    '[Rakshak] Backend payload:',
    raw,
  )

  console.log(
    '[Rakshak] Normalized result:',
    normalized,
  )

  return normalized
}

/* =========================================================
   HISTORY STORAGE
   ========================================================= */

function saveToHistory(
  result: AnalysisResult,
) {
  try {
    const raw =
      localStorage.getItem(
        HISTORY_STORAGE_KEY,
      )

    const existing: HistoryItem[] =
      raw
        ? JSON.parse(raw)
        : []

    const item: HistoryItem = {
      traceId:
        result.traceId ||
        `local-${Date.now()}`,

      verdict:
        result.verdict ||
        'unknown',

      confidence:
        Number.isFinite(
          result.confidence,
        )
          ? result.confidence
          : 0,

      timestamp:
        result.checkedAt ||
        new Date().toLocaleString(),

      inputPreview:
        result.inputPreview ||
        '',
    }

    const filtered =
      existing.filter(
        historyItem =>
          historyItem.traceId !==
          item.traceId,
      )

    const updated = [
      item,
      ...filtered,
    ].slice(0, 50)

    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(updated),
    )

    /*
     * storage events do not fire in the same tab,
     * so dispatch our own event.
     */
    window.dispatchEvent(
      new Event(
        'rakshak-history-updated',
      ),
    )
  } catch (error) {
    console.warn(
      '[Rakshak] Could not save history:',
      error,
    )
  }
}

/* =========================================================
   MAIN HOOK
   ========================================================= */

export function useAnalysis() {
  const [result, setResult] =
    useState<AnalysisResult | null>(
      null,
    )

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  /* TEXT */

  const runTextAnalysis =
    useCallback(
      async (text: string) => {
        setLoading(true)
        setError(null)

        try {
          const raw =
            await analyzeText(text)

          const normalized =
            normalizeAnalysisResult(
              raw,
            )

          setResult(normalized)

          saveToHistory(
            normalized,
          )

          return normalized
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Analysis failed.'

          setError(message)

          throw err
        } finally {
          setLoading(false)
        }
      },
      [],
    )

  /* IMAGE */

  const runImageAnalysis =
    useCallback(
      async (file: File) => {
        setLoading(true)
        setError(null)

        try {
          const raw =
            await analyzeImage(file)

          const normalized =
            normalizeAnalysisResult(
              raw,
            )

          setResult(normalized)

          saveToHistory(
            normalized,
          )

          return normalized
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Image analysis failed.'

          setError(message)

          throw err
        } finally {
          setLoading(false)
        }
      },
      [],
    )
      /* VOICE */

  const runVoiceAnalysis =
    useCallback(
      async (file: File) => {
        setLoading(true)
        setError(null)

        try {
          const raw =
            await analyzeAudio(file)

          const normalized =
            normalizeAnalysisResult(raw)

          setResult(normalized)

          saveToHistory(normalized)

          return normalized
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Voice analysis failed.'

          setError(message)

          throw err
        } finally {
          setLoading(false)
        }
      },
      [],
    )

  return {
    result,
    loading,
    error,
    runTextAnalysis,
    runImageAnalysis,
    runVoiceAnalysis,
    setResult,
  }
}