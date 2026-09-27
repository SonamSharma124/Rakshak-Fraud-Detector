import { useState } from 'react'
import {
  IconWarning,
  IconCheck,
  IconLink,
  IconArrowRight,
  IconExternal,
} from '../../components/icons'

import type { AnalysisResult } from '../../hooks/useAnalysis'

type Tab =
  | 'analysis'
  | 'evidence'
  | 'links'
  | 'explanation'

type Props = {
  result: AnalysisResult
}

export default function AnalysisPanel({
  result,
}: Props) {
  const [tab, setTab] =
    useState<Tab>('analysis')

  /*
   * IMPORTANT:
   * Always normalize arrays before rendering.
   * This prevents crashes when the backend omits
   * an optional field.
   */

  const reasons = Array.isArray(result?.reasons)
    ? result.reasons
    : []

  const riskFactors = Array.isArray(
    result?.riskFactors,
  )
    ? result.riskFactors
    : []

  const ragEvidence = Array.isArray(
    result?.ragEvidence,
  )
    ? result.ragEvidence
    : []

  const links = Array.isArray(result?.links)
    ? result.links
    : []

  const explanationSteps =
    Array.isArray(result?.explanationSteps)
      ? result.explanationSteps
      : []

  const tabs: {
    id: Tab
    label: string
  }[] = [
    {
      id: 'analysis',
      label: 'AI Analysis',
    },
    {
      id: 'evidence',
      label: 'RAG Evidence',
    },
    {
      id: 'links',
      label: 'Link Analysis',
    },
    {
      id: 'explanation',
      label: 'Explanation',
    },
  ]

  return (
    <section className="mb-20 animate-fade-in-up">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background:
            'rgba(15,22,41,0.7)',
          border:
            '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* TAB BAR */}

        <div className="flex items-center gap-1 px-6 pt-5">
          {tabs.map(tabItem => (
            <button
              key={tabItem.id}
              type="button"
              onClick={() =>
                setTab(tabItem.id)
              }
              className="px-4 py-2 rounded-lg text-sm transition-all duration-200"
              style={{
                fontFamily: 'Inter',
                fontWeight:
                  tab === tabItem.id
                    ? 500
                    : 400,
                background:
                  tab === tabItem.id
                    ? 'rgba(34,211,238,0.1)'
                    : 'transparent',
                color:
                  tab === tabItem.id
                    ? '#22d3ee'
                    : 'rgba(148,163,184,0.6)',
              }}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        <div
          className="h-px mx-6 mt-4"
          style={{
            background:
              'rgba(255,255,255,0.05)',
          }}
        />

        {/* TAB CONTENT */}

        <div className="p-8">
          {tab === 'analysis' && (
            <AnalysisTab
              result={result}
              reasons={reasons}
              riskFactors={riskFactors}
            />
          )}

          {tab === 'evidence' && (
            <EvidenceTab
              ragEvidence={ragEvidence}
            />
          )}

          {tab === 'links' && (
            <LinksTab
              links={links}
            />
          )}

          {tab === 'explanation' && (
            <ExplanationTab
              explanationSteps={
                explanationSteps
              }
            />
          )}
        </div>
      </div>
    </section>
  )
}

/* =========================================================
   AI ANALYSIS TAB
   ========================================================= */

function AnalysisTab({
  result,
  reasons,
  riskFactors,
}: {
  result: AnalysisResult
  reasons: string[]
  riskFactors: AnalysisResult['riskFactors']
}) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-5 gap-8">

        {/* LEFT */}

        <div className="col-span-3 space-y-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <IconWarning className="w-5 h-5 text-red-400 flex-shrink-0" />

              <div>
                <div
                  className="text-slate-400 text-xs uppercase tracking-widest"
                  style={{
                    fontFamily:
                      'JetBrains Mono',
                  }}
                >
                  Final Verdict
                </div>

                <div
                  className="font-display text-xl text-red-400"
                  style={{
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                  }}
                >
                  {result?.verdict || 'unknown'}
                </div>
              </div>
            </div>

            <p
              className="text-slate-400 text-sm leading-relaxed"
              style={{
                fontFamily: 'Inter',
              }}
            >
              {reasons.length > 0
                ? reasons[0]
                : 'The backend did not return a detailed explanation.'}
            </p>
          </div>

          {/* KEY REASONS */}

          <div>
            <div
              className="text-cyan-500 text-xs uppercase tracking-widest mb-3"
              style={{
                fontFamily:
                  'JetBrains Mono',
              }}
            >
              Key Reasons
            </div>

            {reasons.length > 0 ? (
              <ul className="space-y-2.5">
                {reasons.map(
                  (reason, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                      style={{
                        fontFamily: 'Inter',
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />

                      <span>
                        {reason}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p
                className="text-slate-500 text-sm"
                style={{
                  fontFamily: 'Inter',
                }}
              >
                No reasons were returned
                by the backend.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT — RISK FACTORS */}

        <div className="col-span-2 space-y-3">
          <div
            className="text-slate-500 text-xs uppercase tracking-widest mb-4"
            style={{
              fontFamily:
                'JetBrains Mono',
            }}
          >
            Risk Factors
          </div>

          {riskFactors.length > 0 ? (
            riskFactors.map(
              (factor, index) => {
                const level =
                  String(
                    factor?.level ??
                      'unknown',
                  ).toLowerCase()

                const isHigh =
                  level === 'high'

                const isMedium =
                  level === 'medium'

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2.5 border-b"
                    style={{
                      borderColor:
                        'rgba(255,255,255,0.05)',
                    }}
                  >
                    <div
                      className="flex items-center gap-2.5 text-sm text-slate-300"
                      style={{
                        fontFamily:
                          'Inter',
                      }}
                    >
                      <IconWarning
                        className={`w-3.5 h-3.5 ${
                          isHigh
                            ? 'text-red-400'
                            : isMedium
                              ? 'text-yellow-400'
                              : 'text-slate-400'
                        }`}
                      />

                      {factor?.label ??
                        'Unknown risk factor'}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-xs font-600 ${
                        isHigh
                          ? 'text-red-300'
                          : isMedium
                            ? 'text-yellow-300'
                            : 'text-slate-300'
                      }`}
                      style={{
                        fontFamily:
                          'JetBrains Mono',
                        background:
                          isHigh
                            ? 'rgba(239,68,68,0.1)'
                            : isMedium
                              ? 'rgba(234,179,8,0.1)'
                              : 'rgba(148,163,184,0.1)',
                        border:
                          isHigh
                            ? '1px solid rgba(239,68,68,0.2)'
                            : isMedium
                              ? '1px solid rgba(234,179,8,0.2)'
                              : '1px solid rgba(148,163,184,0.2)',
                      }}
                    >
                      {String(
                        factor?.level ??
                          'UNKNOWN',
                      ).toUpperCase()}
                    </span>
                  </div>
                )
              },
            )
          ) : (
            <div
              className="p-4 rounded-xl"
              style={{
                background:
                  'rgba(148,163,184,0.05)',
                border:
                  '1px solid rgba(148,163,184,0.12)',
              }}
            >
              <p
                className="text-slate-500 text-sm"
                style={{
                  fontFamily: 'Inter',
                }}
              >
                No explicit risk factors
                were returned.
              </p>
            </div>
          )}

          {/* RECOMMENDED ACTION */}

          <div
            className="mt-4 p-4 rounded-xl"
            style={{
              background:
                'rgba(34,197,94,0.05)',
              border:
                '1px solid rgba(34,197,94,0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <IconCheck className="w-4 h-4 text-green-400" />

              <span
                className="text-green-400 text-xs font-600 uppercase tracking-wider"
                style={{
                  fontFamily: 'Outfit',
                }}
              >
                Recommended Action
              </span>
            </div>

            <p
              className="text-slate-400 text-xs leading-relaxed"
              style={{
                fontFamily: 'Inter',
              }}
            >
              Do not click links, send money,
              share OTPs, passwords, or other
              sensitive information. Verify the
              request through the organization's
              official channel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   RAG EVIDENCE
   ========================================================= */

function EvidenceTab({
  ragEvidence,
}: {
  ragEvidence: AnalysisResult['ragEvidence']
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p
          className="text-slate-500 text-sm"
          style={{
            fontFamily: 'Inter',
          }}
        >
          Retrieved scam-pattern evidence
          returned by the Pattern Agent.
        </p>

        <button
          type="button"
          className="text-cyan-500 text-xs flex items-center gap-1"
          style={{
            fontFamily: 'Inter',
          }}
        >
          View all
          <IconArrowRight className="w-3 h-3" />
        </button>
      </div>

      {ragEvidence.length > 0 ? (
        ragEvidence.map(
          (evidence, index) => (
            <div
              key={
                evidence?.id ??
                index
              }
              className="flex items-start gap-5 py-5 border-b"
              style={{
                borderColor:
                  'rgba(255,255,255,0.05)',
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-600 flex-shrink-0 mt-0.5"
                style={{
                  background:
                    'rgba(34,211,238,0.1)',
                  color: '#22d3ee',
                  fontFamily:
                    'JetBrains Mono',
                  border:
                    '1px solid rgba(34,211,238,0.2)',
                }}
              >
                {evidence?.id ??
                  index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <div
                    className="font-600 text-sm text-slate-200"
                    style={{
                      fontFamily:
                        'Inter',
                    }}
                  >
                    {evidence?.title ??
                      'Retrieved Pattern'}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="px-2 py-0.5 rounded text-xs text-slate-500"
                      style={{
                        fontFamily:
                          'JetBrains Mono',
                        background:
                          'rgba(255,255,255,0.04)',
                        border:
                          '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      {evidence?.category ??
                        'Scam Pattern'}
                    </span>

                    {evidence?.similarity !==
                      undefined &&
                      evidence?.similarity !==
                        null && (
                        <span
                          className="text-cyan-400 text-xs font-600"
                          style={{
                            fontFamily:
                              'JetBrains Mono',
                          }}
                        >
                          {evidence.similarity}
                        </span>
                      )}
                  </div>
                </div>

                <p
                  className="text-slate-500 text-sm leading-relaxed"
                  style={{
                    fontFamily: 'Inter',
                  }}
                >
                  {evidence?.excerpt ?? ''}
                </p>
              </div>
            </div>
          ),
        )
      ) : (
        <div className="py-10 text-center">
          <p
            className="text-slate-500 text-sm"
            style={{
              fontFamily: 'Inter',
            }}
          >
            No RAG evidence was returned
            by the backend.
          </p>
        </div>
      )}
    </div>
  )
}

/* =========================================================
   LINK ANALYSIS
   ========================================================= */

function LinksTab({
  links,
}: {
  links: AnalysisResult['links']
}) {
  if (links.length === 0) {
    return (
      <div className="py-6">
        <p
          className="text-slate-500 text-sm"
          style={{
            fontFamily: 'Inter',
          }}
        >
          No links detected by the Link Agent.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {links.map((link, index) => {
        const flags = Array.isArray(
          link?.flags,
        )
          ? link.flags
          : []

        return (
          <div
            key={`${link?.url ?? 'link'}-${index}`}
            className="space-y-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <IconLink className="w-4 h-4 text-cyan-500" />

                  <span
                    className="text-white font-600 text-base break-all"
                    style={{
                      fontFamily:
                        'Outfit',
                    }}
                  >
                    {link?.url ??
                      'Unknown URL'}
                  </span>

                  {link?.url && (
                    <button
                      type="button"
                      className="text-slate-600 hover:text-slate-400 transition-colors"
                      onClick={() => {
                        const url =
                          link.url.startsWith(
                            'http',
                          )
                            ? link.url
                            : `https://${link.url}`

                        window.open(
                          url,
                          '_blank',
                          'noopener,noreferrer',
                        )
                      }}
                      title="Open link"
                    >
                      <IconExternal className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div
                  className="text-slate-500 text-xs"
                  style={{
                    fontFamily:
                      'JetBrains Mono',
                  }}
                >
                  {link?.source ??
                    'Link Agent'}
                </div>
              </div>

              <span
                className="px-3 py-1 rounded-lg text-xs font-600 text-red-300"
                style={{
                  fontFamily:
                    'JetBrains Mono',
                  background:
                    'rgba(239,68,68,0.1)',
                  border:
                    '1px solid rgba(239,68,68,0.25)',
                }}
              >
                {link?.riskLevel ??
                  'unknown'}
              </span>
            </div>

            {flags.length > 0 && (
              <div className="space-y-2.5">
                {flags.map(
                  (flag, flagIndex) => (
                    <div
                      key={flagIndex}
                      className="flex items-start gap-2.5 text-sm text-slate-400"
                      style={{
                        fontFamily:
                          'Inter',
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />

                      {flag}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* =========================================================
   EXPLANATION
   ========================================================= */

function ExplanationTab({
  explanationSteps,
}: {
  explanationSteps: AnalysisResult['explanationSteps']
}) {
  return (
    <div className="space-y-6">
      <div>
        <div
          className="text-slate-500 text-xs uppercase tracking-widest mb-3"
          style={{
            fontFamily:
              'JetBrains Mono',
          }}
        >
          How Rakshak reached this verdict
        </div>

        {explanationSteps.length > 0 ? (
          <div className="space-y-4">
            {explanationSteps.map(
              (item, index) => (
                <div
                  key={
                    item?.step ??
                    index
                  }
                  className="flex gap-5"
                >
                  <div
                    className="text-cyan-500 text-xs font-600 w-6 pt-0.5 flex-shrink-0"
                    style={{
                      fontFamily:
                        'JetBrains Mono',
                    }}
                  >
                    {item?.step ??
                      String(
                        index + 1,
                      ).padStart(2, '0')}
                  </div>

                  <div>
                    <div
                      className="text-slate-200 text-sm font-500 mb-1"
                      style={{
                        fontFamily:
                          'Inter',
                        fontWeight: 500,
                      }}
                    >
                      {item?.title ??
                        'Analysis step'}
                    </div>

                    <div
                      className="text-slate-500 text-sm leading-relaxed"
                      style={{
                        fontFamily:
                          'Inter',
                      }}
                    >
                      {item?.body ?? ''}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="py-6">
            <p
              className="text-slate-500 text-sm"
              style={{
                fontFamily: 'Inter',
              }}
            >
              No explanation steps were
              returned by the backend.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}