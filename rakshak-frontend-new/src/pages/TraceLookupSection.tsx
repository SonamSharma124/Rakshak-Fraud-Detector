import { useState } from 'react'

type TraceSpan = {
  agent_name?: string
  input_summary?: string
  output_summary?: string
  duration_seconds?: number
  timestamp?: string
}

type TraceResponse = {
  trace_id?: string
  total_spans?: number
  total_duration_seconds?: number
  spans?: TraceSpan[]
}

type DerivedAnalysis = {
  patternVerdict: string
  patternConfidence: number | null
  patternReason: string
  retrievedPatterns: string[]
  patternModel: string
  groundednessScore: number | null
  groundednessKeywords: string[]

  urlsFound: number
  linkRisk: string
  linkResults: Array<{
    url: string
    domain: string
    risk: string
    flags: string[]
  }>

  patternSeconds: number | null
  linkSeconds: number | null
  verdictSeconds: number | null
  explanationSeconds: number | null
  totalVerificationSeconds: number | null

  explanationModel: string
  explanationTokens: number | null
  explanationCost: number | null
}

type ParsedTrace = {
  traceId: string
  verdict: string
  confidence: number | null
  duration: number
  spans: TraceSpan[]
  derived: DerivedAnalysis
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000'

/* ============================================================
   BASIC HELPERS
   ============================================================ */

function parseNumber(value: string | undefined): number | null {
  if (!value) return null

  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

function parseStringField(
  source: string,
  field: string
): string {
  const regex = new RegExp(
    `['"]${field}['"]\\s*:\\s*['"]([^'"]*)['"]`,
    'i'
  )

  return source.match(regex)?.[1] ?? ''
}

function parseNumberField(
  source: string,
  field: string
): number | null {
  const regex = new RegExp(
    `['"]${field}['"]\\s*:\\s*(-?[0-9]+(?:\\.[0-9]+)?)`,
    'i'
  )

  return parseNumber(source.match(regex)?.[1])
}

function parseArrayField(
  source: string,
  field: string
): string[] {
  const regex = new RegExp(
    `['"]${field}['"]\\s*:\\s*\\[([^\\]]*)\\]`,
    'i'
  )

  const match = source.match(regex)

  if (!match) return []

  return Array.from(
    match[1].matchAll(/['"]([^'"]+)['"]/g)
  ).map((item) => item[1])
}

/* ============================================================
   PARSE LINK RESULTS
   ============================================================ */

function parseLinkResults(
  outputSummary: string
): Array<{
  url: string
  domain: string
  risk: string
  flags: string[]
}> {
  const resultsMatch = outputSummary.match(
    /['"]results['"]\s*:\s*\[(.*?)\]\s*,\s*['"]overall_link_risk['"]/i
  )

  if (!resultsMatch) {
    return []
  }

  const resultsText = resultsMatch[1]

  const resultBlocks = resultsText.match(
    /\{.*?\}/g
  )

  if (!resultBlocks) {
    return []
  }

  return resultBlocks.map((block) => ({
    url: parseStringField(block, 'url'),
    domain: parseStringField(block, 'domain'),
    risk: parseStringField(block, 'risk') || 'unknown',
    flags: parseArrayField(block, 'flags'),
  }))
}

/* ============================================================
   PARSE VERIFICATION OUTPUT
   ============================================================ */

function parseVerificationOutput(
  outputSummary?: string
): {
  verdict: string
  confidence: number | null
  derived: DerivedAnalysis
} {
  const emptyDerived: DerivedAnalysis = {
    patternVerdict: 'Not returned',
    patternConfidence: null,
    patternReason: '',
    retrievedPatterns: [],
    patternModel: 'Not returned',
    groundednessScore: null,
    groundednessKeywords: [],

    urlsFound: 0,
    linkRisk: 'Not returned',
    linkResults: [],

    patternSeconds: null,
    linkSeconds: null,
    verdictSeconds: null,
    explanationSeconds: null,
    totalVerificationSeconds: null,

    explanationModel: 'Not returned',
    explanationTokens: null,
    explanationCost: null,
  }

  if (!outputSummary) {
    return {
      verdict: 'unknown',
      confidence: null,
      derived: emptyDerived,
    }
  }

  /*
   * The backend stores the verification result as a
   * Python-style dictionary string inside output_summary.
   *
   * Example:
   *
   * {
   *   'final_verdict': 'scam',
   *   'confidence': 0.9,
   *   'pattern_analysis': {...},
   *   'link_analysis': {...},
   *   'timing': {...}
   * }
   */

  const verdict =
    parseStringField(
      outputSummary,
      'final_verdict'
    ) || 'unknown'

  const confidence =
    parseNumberField(
      outputSummary,
      'confidence'
    )

  /* ---------------- Pattern Analysis ---------------- */

  const patternMatch = outputSummary.match(
    /['"]pattern_analysis['"]\s*:\s*\{(.*?)\}\s*,\s*['"]link_analysis['"]/is
  )

  const patternText =
    patternMatch?.[1] ?? ''

  const patternVerdict =
    parseStringField(
      patternText,
      'verdict'
    ) || 'Not returned'

  const patternConfidence =
    parseNumberField(
      patternText,
      'confidence'
    )

  const patternReason =
    parseStringField(
      patternText,
      'reason'
    )

  const patternModel =
    parseStringField(
      patternText,
      'pattern_model_used'
    ) || 'Not returned'

  const groundednessScore =
    parseNumberField(
      patternText,
      'groundedness_score'
    )

  const groundednessKeywords =
    parseArrayField(
      patternText,
      'groundedness_matched_keywords'
    )

  const retrievedPatterns =
    parseArrayField(
      patternText,
      'retrieved_patterns'
    )

  /* ---------------- Link Analysis ---------------- */

  const linkMatch = outputSummary.match(
    /['"]link_analysis['"]\s*:\s*\{(.*?)\}\s*,\s*['"]timing['"]/is
  )

  const linkText =
    linkMatch?.[1] ?? ''

  const urlsFound =
    parseNumberField(
      linkText,
      'urls_found'
    ) ?? 0

  const linkRisk =
    parseStringField(
      linkText,
      'overall_link_risk'
    ) || 'Not returned'

  const linkResults =
    parseLinkResults(
      outputSummary
    )

  /* ---------------- Timing ---------------- */

  const timingMatch = outputSummary.match(
    /['"]timing['"]\s*:\s*\{(.*?)\}\s*\}?$/is
  )

  const timingText =
    timingMatch?.[1] ?? outputSummary

  const patternSeconds =
    parseNumberField(
      timingText,
      'pattern_agent_seconds'
    )

  const linkSeconds =
    parseNumberField(
      timingText,
      'link_agent_seconds'
    )

  const verdictSeconds =
    parseNumberField(
      timingText,
      'verdict_combination_seconds'
    )

  const explanationSeconds =
    parseNumberField(
      timingText,
      'explanation_llm_seconds'
    )

  const totalVerificationSeconds =
    parseNumberField(
      timingText,
      'total_verification_seconds'
    )

  /* ---------------- System Info ---------------- */

  const explanationModel =
    parseStringField(
      outputSummary,
      'explanation_model_used'
    ) || 'Not returned'

  const explanationTokens =
    parseNumberField(
      outputSummary,
      'explanation_tokens'
    )

  const explanationCost =
    parseNumberField(
      outputSummary,
      'explanation_estimated_cost'
    )

  return {
    verdict,
    confidence,

    derived: {
      patternVerdict,
      patternConfidence,
      patternReason,
      retrievedPatterns,
      patternModel,
      groundednessScore,
      groundednessKeywords,

      urlsFound,
      linkRisk,
      linkResults,

      patternSeconds,
      linkSeconds,
      verdictSeconds,
      explanationSeconds,
      totalVerificationSeconds,

      explanationModel,
      explanationTokens,
      explanationCost,
    },
  }
}

/* ============================================================
   PARSE COMPLETE TRACE
   ============================================================ */

function parseTrace(
  data: TraceResponse
): ParsedTrace {
  const spans =
    Array.isArray(data.spans)
      ? data.spans
      : []

  const verificationSpan =
    spans.find(
      (span) =>
        span.agent_name?.toLowerCase() ===
        'verification_agent'
    )

  const verification =
    parseVerificationOutput(
      verificationSpan?.output_summary
    )

  return {
    traceId:
      data.trace_id ?? '',

    verdict:
      verification.verdict,

    confidence:
      verification.confidence,

    duration:
      data.total_duration_seconds ?? 0,

    spans,

    derived:
      verification.derived,
  }
}

/* ============================================================
   FORMATTERS
   ============================================================ */

function formatSeconds(
  value?: number | null
): string {
  if (
    value === undefined ||
    value === null ||
    Number.isNaN(value)
  ) {
    return 'Not returned'
  }

  return `${value.toFixed(3)}s`
}

function formatTimestamp(
  value?: string
): string {
  if (!value) {
    return 'Unknown time'
  }

  return value
}

/* ============================================================
   TRACE LOOKUP COMPONENT
   ============================================================ */

export default function TraceLookupSection() {
  const [traceId, setTraceId] =
    useState('')

  const [trace, setTrace] =
    useState<ParsedTrace | null>(null)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  /* ==========================================================
     LOOKUP
     ========================================================== */

  const handleLookup = async () => {
    const id =
      traceId.trim()

    if (!id) {
      setError(
        'Please enter a trace ID.'
      )

      setTrace(null)

      return
    }

    setLoading(true)
    setError(null)
    setTrace(null)

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/traces/${encodeURIComponent(id)}`
        )

      if (!response.ok) {
        throw new Error(
          `Trace lookup failed with HTTP ${response.status}.`
        )
      }

      const data =
        (await response.json()) as TraceResponse

      const parsed =
        parseTrace(data)

      setTrace(parsed)
    } catch (err) {
      console.error(
        'Trace lookup error:',
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to retrieve this trace.'
      )
    } finally {
      setLoading(false)
    }
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <section className="mb-16">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8">

        <div
          className="text-slate-500 text-xs uppercase tracking-widest mb-2"
          style={{
            fontFamily:
              'JetBrains Mono',
          }}
        >
          Trace Lookup
        </div>

        <h2
          className="font-display font-700 text-2xl text-white mb-3"
          style={{
            fontFamily:
              'Outfit',
            fontWeight: 700,
          }}
        >
          Inspect any check by trace ID
        </h2>

        <p
          className="text-slate-500 max-w-2xl leading-relaxed"
          style={{
            fontFamily:
              'Inter',
          }}
        >
          Every analysis run generates a unique
          trace ID you can use to replay or audit
          the full agent pipeline.
        </p>

      </div>

      {/* =====================================================
          INPUT
      ===================================================== */}

      <div className="flex gap-3 mb-6">

        <input
          value={traceId}
          onChange={(event) =>
            setTraceId(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleLookup()
            }
          }}
          placeholder="e.g. bb0e8385"
          className="flex-1 rounded-xl px-4 py-3 outline-none text-sm text-slate-200"
          style={{
            background:
              '#0f1629',

            border:
              '1px solid rgba(34,211,238,0.20)',

            fontFamily:
              'JetBrains Mono',
          }}
        />

        <button
          onClick={handleLookup}
          disabled={loading}
          className="rounded-xl px-6 py-3 text-sm font-semibold transition-all"
          style={{
            background:
              loading
                ? '#16465a'
                : '#083b50',

            color:
              '#22d3ee',

            border:
              '1px solid rgba(34,211,238,0.30)',

            fontFamily:
              'Inter',

            opacity:
              loading ? 0.7 : 1,
          }}
        >
          {loading
            ? 'Looking up...'
            : 'Look up'}
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="rounded-xl px-5 py-4 mb-6 text-sm text-red-300"
          style={{
            background:
              'rgba(239,68,68,0.06)',

            border:
              '1px solid rgba(239,68,68,0.25)',

            fontFamily:
              'Inter',
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================================
          TRACE RESULT
      ===================================================== */}

      {trace && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background:
              '#0f1629',

            border:
              '1px solid rgba(255,255,255,0.08)',
          }}
        >

          {/* =================================================
              TRACE SUMMARY
          ================================================= */}

          <div
            className="px-6 py-5 flex items-center justify-between"
            style={{
              borderBottom:
                '1px solid rgba(255,255,255,0.07)',
            }}
          >

            <div className="flex items-center gap-4">

              <span
                className="px-3 py-1 rounded-md text-xs uppercase"
                style={{
                  background:
                    trace.verdict ===
                    'scam'
                      ? 'rgba(239,68,68,0.10)'
                      : trace.verdict ===
                        'suspicious'
                      ? 'rgba(234,179,8,0.10)'
                      : 'rgba(34,197,94,0.10)',

                  color:
                    trace.verdict ===
                    'scam'
                      ? '#f87171'
                      : trace.verdict ===
                        'suspicious'
                      ? '#facc15'
                      : '#4ade80',

                  border:
                    '1px solid rgba(255,255,255,0.10)',

                  fontFamily:
                    'JetBrains Mono',
                }}
              >
                {trace.verdict}
              </span>

              <span
                className="text-cyan-400 text-sm"
                style={{
                  fontFamily:
                    'JetBrains Mono',
                }}
              >
                {trace.traceId}
              </span>

              {trace.confidence !== null && (
                <span
                  className="text-slate-500 text-sm"
                  style={{
                    fontFamily:
                      'JetBrains Mono',
                  }}
                >
                  ·{' '}
                  {Math.round(
                    trace.confidence * 100
                  )}
                  % confidence
                </span>
              )}

            </div>

            <div
              className="text-slate-500 text-sm text-right"
              style={{
                fontFamily:
                  'JetBrains Mono',
              }}
            >
              {formatSeconds(
                trace.duration
              )}{' '}
              total ·{' '}
              {trace.spans.length}{' '}
              recorded spans
            </div>

          </div>

          {/* =================================================
              REQUEST JOURNEY
          ================================================= */}

          <div className="px-6 py-7">

            <div
              className="text-slate-500 text-xs uppercase tracking-widest mb-6"
              style={{
                fontFamily:
                  'JetBrains Mono',
              }}
            >
              Request Journey
            </div>

            <div className="space-y-7">

              {trace.spans.map(
                (span, index) => {

                  const isVerification =
                    span.agent_name
                      ?.toLowerCase() ===
                    'verification_agent'

                  return (
                    <div
                      key={`${span.agent_name}-${index}`}
                      className="relative pl-9"
                    >

                      {/* Timeline dot */}

                      <div
                        className="absolute left-0 top-1.5 w-3 h-3 rounded-full"
                        style={{
                          background:
                            isVerification
                              ? '#4ade80'
                              : '#22d3ee',

                          boxShadow:
                            `0 0 12px ${
                              isVerification
                                ? 'rgba(74,222,128,0.35)'
                                : 'rgba(34,211,238,0.35)'
                            }`,
                        }}
                      />

                      {/* Connector */}

                      {index <
                        trace.spans.length -
                          1 && (
                        <div
                          className="absolute left-[5px] top-5 w-px"
                          style={{
                            height:
                              'calc(100% + 28px)',

                            background:
                              'rgba(255,255,255,0.08)',
                          }}
                        />
                      )}

                      <div className="flex items-start justify-between gap-6">

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-3 mb-2">

                            <span
                              className="text-sm font-semibold"
                              style={{
                                color:
                                  isVerification
                                    ? '#4ade80'
                                    : '#22d3ee',

                                fontFamily:
                                  'Inter',
                              }}
                            >
                              {span.agent_name ??
                                'unknown_agent'}
                            </span>

                          </div>

                          <div
                            className="text-slate-500 text-xs leading-relaxed break-words whitespace-pre-wrap"
                            style={{
                              fontFamily:
                                'JetBrains Mono',
                            }}
                          >
                            {span.output_summary ??
                              span.input_summary ??
                              'No trace details returned.'}
                          </div>

                          {span.timestamp && (
                            <div
                              className="mt-2 text-slate-700 text-[11px]"
                              style={{
                                fontFamily:
                                  'JetBrains Mono',
                              }}
                            >
                              {formatTimestamp(
                                span.timestamp
                              )}
                            </div>
                          )}

                        </div>

                        <div
                          className="shrink-0 text-slate-500 text-xs"
                          style={{
                            fontFamily:
                              'JetBrains Mono',
                          }}
                        >
                          {formatSeconds(
                            span.duration_seconds
                          )}
                        </div>

                      </div>

                    </div>
                  )
                }
              )}

            </div>

          </div>

          {/* =================================================
              DERIVED AGENT ANALYSIS
          ================================================= */}

          <div
            className="px-6 py-7"
            style={{
              borderTop:
                '1px solid rgba(255,255,255,0.07)',
            }}
          >

            <div
              className="text-slate-500 text-xs uppercase tracking-widest mb-6"
              style={{
                fontFamily:
                  'JetBrains Mono',
              }}
            >
              Agent Analysis
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Pattern Agent */}

              <div
                className="rounded-xl border p-5"
                style={{
                  background:
                    '#10172a',

                  borderColor:
                    'rgba(167,139,250,0.20)',
                }}
              >

                <div className="flex items-center justify-between mb-4">

                  <span
                    className="text-sm font-semibold text-purple-300"
                    style={{
                      fontFamily:
                        'Inter',
                    }}
                  >
                    Pattern Agent
                  </span>

                  <span
                    className="text-xs text-slate-500"
                    style={{
                      fontFamily:
                        'JetBrains Mono',
                    }}
                  >
                    {formatSeconds(
                      trace.derived.patternSeconds
                    )}
                  </span>

                </div>

                <div
                  className="text-xs text-slate-500 mb-2"
                  style={{
                    fontFamily:
                      'JetBrains Mono',
                  }}
                >
                  Verdict
                </div>

                <div className="text-sm text-slate-200 mb-4">
                  {trace.derived.patternVerdict}
                </div>

                {trace.derived.patternReason && (
                  <>
                    <div
                      className="text-xs text-slate-500 mb-2"
                      style={{
                        fontFamily:
                          'JetBrains Mono',
                      }}
                    >
                      Reason
                    </div>

                    <div className="text-sm text-slate-400 leading-relaxed">
                      {trace.derived.patternReason}
                    </div>
                  </>
                )}

                <div className="mt-4 flex flex-wrap gap-2">

                  {trace.derived.patternModel !==
                    'Not returned' && (
                    <span
                      className="px-2 py-1 rounded-md text-[11px] text-purple-300"
                      style={{
                        background:
                          'rgba(167,139,250,0.08)',

                        border:
                          '1px solid rgba(167,139,250,0.18)',

                        fontFamily:
                          'JetBrains Mono',
                      }}
                    >
                      {trace.derived.patternModel}
                    </span>
                  )}

                  {trace.derived.groundednessScore !==
                    null && (
                    <span
                      className="px-2 py-1 rounded-md text-[11px] text-slate-400"
                      style={{
                        background:
                          'rgba(255,255,255,0.04)',

                        fontFamily:
                          'JetBrains Mono',
                      }}
                    >
                      Groundedness:{' '}
                      {
                        trace.derived
                          .groundednessScore
                      }
                    </span>
                  )}

                </div>

              </div>

              {/* Link Agent */}

              <div
                className="rounded-xl border p-5"
                style={{
                  background:
                    '#10172a',

                  borderColor:
                    'rgba(74,222,128,0.20)',
                }}
              >

                <div className="flex items-center justify-between mb-4">

                  <span
                    className="text-sm font-semibold text-green-300"
                    style={{
                      fontFamily:
                        'Inter',
                    }}
                  >
                    Link Agent
                  </span>

                  <span
                    className="text-xs text-slate-500"
                    style={{
                      fontFamily:
                        'JetBrains Mono',
                    }}
                  >
                    {formatSeconds(
                      trace.derived.linkSeconds
                    )}
                  </span>

                </div>

                <div
                  className="text-xs text-slate-500 mb-2"
                  style={{
                    fontFamily:
                      'JetBrains Mono',
                  }}
                >
                  URLs Found
                </div>

                <div className="text-sm text-slate-200 mb-4">
                  {trace.derived.urlsFound}
                </div>

                <div
                  className="text-xs text-slate-500 mb-2"
                  style={{
                    fontFamily:
                      'JetBrains Mono',
                  }}
                >
                  Overall Link Risk
                </div>

                <div
                  className="text-sm font-semibold mb-4"
                  style={{
                    color:
                      trace.derived.linkRisk ===
                      'high'
                        ? '#f87171'
                        : trace.derived.linkRisk ===
                          'medium'
                        ? '#facc15'
                        : '#4ade80',
                  }}
                >
                  {trace.derived.linkRisk}
                </div>

                {trace.derived.linkResults.length >
                  0 && (
                  <div className="space-y-3">

                    {trace.derived.linkResults.map(
                      (link, index) => (
                        <div
                          key={`${link.url}-${index}`}
                          className="rounded-lg p-3"
                          style={{
                            background:
                              'rgba(255,255,255,0.03)',
                          }}
                        >

                          <div
                            className="text-xs text-cyan-300 break-all mb-2"
                            style={{
                              fontFamily:
                                'JetBrains Mono',
                            }}
                          >
                            {link.url}
                          </div>

                          {link.flags.map(
                            (flag, flagIndex) => (
                              <div
                                key={`${flag}-${flagIndex}`}
                                className="text-xs text-slate-500"
                              >
                                • {flag}
                              </div>
                            )
                          )}

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              TIMING
          ================================================= */}

          <div
            className="px-6 py-7"
            style={{
              borderTop:
                '1px solid rgba(255,255,255,0.07)',
            }}
          >

            <div
              className="text-slate-500 text-xs uppercase tracking-widest mb-6"
              style={{
                fontFamily:
                  'JetBrains Mono',
              }}
            >
              Verification Timing
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

              <div>
                <div className="text-xs text-slate-600 mb-2">
                  Pattern
                </div>

                <div
                  className="text-sm text-slate-300"
                  style={{
                    fontFamily:
                      'JetBrains Mono',
                  }}
                >
                  {formatSeconds(
                    trace.derived.patternSeconds
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-600 mb-2">
                  Link
                </div>

                <div
                  className="text-sm text-slate-300"
                  style={{
                    fontFamily:
                      'JetBrains Mono',
                  }}
                >
                  {formatSeconds(
                    trace.derived.linkSeconds
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-600 mb-2">
                  Verdict
                </div>

                <div
                  className="text-sm text-slate-300"
                  style={{
                    fontFamily:
                      'JetBrains Mono',
                  }}
                >
                  {formatSeconds(
                    trace.derived.verdictSeconds
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-600 mb-2">
                  Explanation
                </div>

                <div
                  className="text-sm text-slate-300"
                  style={{
                    fontFamily:
                      'JetBrains Mono',
                  }}
                >
                  {formatSeconds(
                    trace.derived.explanationSeconds
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-600 mb-2">
                  Total Verification
                </div>

                <div
                  className="text-sm text-slate-300"
                  style={{
                    fontFamily:
                      'JetBrains Mono',
                  }}
                >
                  {formatSeconds(
                    trace.derived
                      .totalVerificationSeconds
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </section>
  )
}