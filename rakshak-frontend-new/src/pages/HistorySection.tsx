import { useEffect, useMemo, useState } from 'react'
import {
  HISTORY_STORAGE_KEY,
  type HistoryItem,
} from '../hooks/useAnalysis'

function readHistory(): HistoryItem[] {
  try {
    const raw =
      localStorage.getItem(
        HISTORY_STORAGE_KEY,
      )

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      item =>
        item &&
        typeof item === 'object',
    )
  } catch {
    return []
  }
}

function verdictClass(
  verdict: string,
) {
  const value =
    String(verdict)
      .toLowerCase()

  if (value === 'scam') {
    return 'text-red-300'
  }

  if (value === 'safe') {
    return 'text-green-300'
  }

  if (
    value === 'suspicious'
  ) {
    return 'text-yellow-300'
  }

  return 'text-slate-300'
}

export default function HistorySection() {
  const [history, setHistory] =
    useState<HistoryItem[]>([])

  const [open, setOpen] =
    useState(false)

  const refreshHistory =
    () => {
      setHistory(
        readHistory(),
      )
    }

  useEffect(() => {
    refreshHistory()

    const handler = () => {
      refreshHistory()
    }

    window.addEventListener(
      'rakshak-history-updated',
      handler,
    )

    window.addEventListener(
      'storage',
      handler,
    )

    return () => {
      window.removeEventListener(
        'rakshak-history-updated',
        handler,
      )

      window.removeEventListener(
        'storage',
        handler,
      )
    }
  }, [])

  const stats = useMemo(() => {
    const total =
      history.length

    const scams =
      history.filter(
        item =>
          String(
            item.verdict,
          ).toLowerCase() ===
          'scam',
      ).length

    const safe =
      history.filter(
        item =>
          String(
            item.verdict,
          ).toLowerCase() ===
          'safe',
      ).length

    const average =
      total > 0
        ? Math.round(
            history.reduce(
              (sum, item) =>
                sum +
                (Number.isFinite(
                  Number(
                    item.confidence,
                  ),
                )
                  ? Number(
                      item.confidence,
                    )
                  : 0),
              0,
            ) / total,
          )
        : 0

    return {
      total,
      scams,
      safe,
      average,
    }
  }, [history])

  const recent =
    history.slice(0, 5)

  return (
    <section className="mt-10 mb-16">
      <div className="mb-4">
        <div
          className="text-slate-500 text-xs uppercase tracking-widest mb-2"
          style={{
            fontFamily:
              'JetBrains Mono',
          }}
        >
          History
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              className="text-xl text-white font-bold"
              style={{
                fontFamily: 'Outfit',
              }}
            >
              Recent checks
            </h2>

            <p
              className="text-slate-500 text-sm mt-2"
              style={{
                fontFamily: 'Inter',
              }}
            >
              All checks stay on your
              device. Nothing is sent to
              external servers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              refreshHistory()
              setOpen(true)
            }}
            className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
            style={{
              fontFamily: 'Inter',
            }}
          >
            View History →
          </button>
        </div>
      </div>

      {/* RECENT CHECKS */}

      {recent.length > 0 ? (
        <div className="space-y-3">
          {recent.map(
            (item, index) => (
              <div
                key={
                  item.traceId ||
                  index
                }
                className="rounded-xl border p-4"
                style={{
                  background:
                    '#10172a',
                  borderColor:
                    'rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div
                      className={`text-sm font-semibold ${verdictClass(
                        item.verdict,
                      )}`}
                    >
                      {String(
                        item.verdict,
                      ).toUpperCase()}
                    </div>

                    <p
                      className="text-slate-500 text-xs mt-1 truncate"
                      title={
                        item.inputPreview
                      }
                    >
                      {item.inputPreview ||
                        'No input preview'}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className="text-cyan-400 text-xs"
                      style={{
                        fontFamily:
                          'JetBrains Mono',
                      }}
                    >
                      {item.confidence}%
                    </div>

                    <div className="text-slate-600 text-xs mt-1">
                      {item.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      ) : (
        <div
          className="rounded-xl border p-6"
          style={{
            background:
              '#10172a',
            borderColor:
              'rgba(255,255,255,0.08)',
          }}
        >
          <p
            className="text-slate-500 text-sm"
            style={{
              fontFamily: 'Inter',
            }}
          >
            No checks yet. Run your first
            analysis and it will appear here.
          </p>
        </div>
      )}

      {/* HISTORY MODAL */}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background:
              'rgba(2,6,23,0.78)',
            backdropFilter:
              'blur(8px)',
          }}
          onClick={() =>
            setOpen(false)
          }
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border"
            style={{
              background:
                '#0d1425',
              borderColor:
                'rgba(255,255,255,0.08)',
            }}
            onClick={event =>
              event.stopPropagation()
            }
          >
            {/* HEADER */}

            <div
              className="px-7 py-6 border-b"
              style={{
                borderColor:
                  'rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="text-cyan-400 text-xs uppercase tracking-widest mb-2"
                    style={{
                      fontFamily:
                        'JetBrains Mono',
                    }}
                  >
                    History
                  </div>

                  <h2
                    className="text-2xl text-white font-bold"
                    style={{
                      fontFamily:
                        'Outfit',
                    }}
                  >
                    All checks
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="text-slate-500 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* STATS */}

            <div
              className="grid grid-cols-4 gap-6 px-7 py-6 border-b"
              style={{
                borderColor:
                  'rgba(255,255,255,0.07)',
              }}
            >
              <Stat
                label="Total checks"
                value={stats.total}
              />

              <Stat
                label="Scams caught"
                value={stats.scams}
              />

              <Stat
                label="Safe messages"
                value={stats.safe}
              />

              <Stat
                label="Avg confidence"
                value={`${stats.average}%`}
              />
            </div>

            {/* LIST */}

            <div className="p-7 overflow-y-auto max-h-[55vh]">
              {history.length ===
              0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-500">
                    No analysis history
                    yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(
                    (
                      item,
                      index,
                    ) => (
                      <div
                        key={
                          item.traceId ||
                          index
                        }
                        className="rounded-xl border p-5"
                        style={{
                          background:
                            '#10172a',
                          borderColor:
                            'rgba(255,255,255,0.07)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-5">
                          <div className="min-w-0">
                            <div
                              className={`text-sm font-bold ${verdictClass(
                                item.verdict,
                              )}`}
                            >
                              {String(
                                item.verdict,
                              ).toUpperCase()}
                            </div>

                            <p className="text-slate-400 text-sm mt-2 break-words">
                              {item.inputPreview ||
                                'No input preview'}
                            </p>

                            <div
                              className="text-slate-600 text-xs mt-3"
                              style={{
                                fontFamily:
                                  'JetBrains Mono',
                              }}
                            >
                              Trace ID:{' '}
                              {item.traceId ||
                                'N/A'}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div
                              className="text-cyan-400 text-sm font-semibold"
                              style={{
                                fontFamily:
                                  'JetBrains Mono',
                              }}
                            >
                              {item.confidence}%
                            </div>

                            <div className="text-slate-600 text-xs mt-2">
                              {
                                item.timestamp
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div>
      <div className="text-slate-500 text-xs mb-1">
        {label}
      </div>

      <div
        className="text-white text-lg font-semibold"
        style={{
          fontFamily:
            'JetBrains Mono',
        }}
      >
        {value}
      </div>
    </div>
  )
}