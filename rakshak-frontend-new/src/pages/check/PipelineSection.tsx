import type { AnalysisResult } from '../../hooks/useAnalysis'

type Props = {
  result: AnalysisResult
}

function safeSeconds(
  value: number | undefined | null
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

function safeProgress(
  value: number | undefined | null
): number {
  if (
    value === undefined ||
    value === null ||
    Number.isNaN(value)
  ) {
    return 100
  }

  return Math.max(0, Math.min(100, value))
}

export default function PipelineSection({
  result,
}: Props) {
  /*
   * IMPORTANT:
   * Some backend responses do not contain timing information.
   * Therefore we must never directly access:
   *
   * result.timing.linkAgentSeconds
   *
   * without checking that timing exists.
   */

  const timing = result?.timing ?? {
    patternAgentSeconds: null,
    linkAgentSeconds: null,
    verdictCombinationSeconds: null,
    explanationLlmSeconds: null,
    totalVerificationSeconds: null,
  }

  const pipeline =
    Array.isArray(result?.pipeline) &&
    result.pipeline.length > 0
      ? result.pipeline
      : [
          {
            num: 1,
            name: 'Intake Agent',
            desc: 'Detect input type & extract text',
            time: '0.000s',
            color: '#22d3ee',
            progress: 100,
          },
          {
            num: 2,
            name: 'Link Agent',
            desc: 'Analyze URLs via rule-based engine',
            time: 'Completed',
            color: '#4ade80',
            progress: 100,
          },
          {
            num: 3,
            name: 'Pattern Agent',
            desc: 'RAG-based semantic matching',
            time: 'Completed',
            color: '#a78bfa',
            progress: 100,
          },
          {
            num: 4,
            name: 'Verification Agent',
            desc: 'Combine results & generate explanation',
            time: safeSeconds(
              timing.totalVerificationSeconds
            ),
            color: '#fb923c',
            progress: 100,
          },
        ]

  return (
    <section className="mb-10">
      {/* Section heading */}
      <div className="mb-8">
        <div
          className="text-slate-500 text-xs uppercase tracking-widest mb-2"
          style={{
            fontFamily: 'JetBrains Mono',
          }}
        >
          Multi-Agent Pipeline
        </div>

        <h2
          className="font-display font-700 text-xl text-white"
          style={{
            fontFamily: 'Outfit',
            fontWeight: 700,
          }}
        >
          How agents collaborated on this check
        </h2>
      </div>

      {/* Pipeline cards */}
      <div
        className="grid grid-cols-4 gap-px overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        {pipeline.map((step, i) => (
          <div
            key={`${step.name}-${i}`}
            className="relative px-6 py-7"
            style={{
              background: '#0f1629',
            }}
          >
            {/* Divider */}
            {i < pipeline.length - 1 && (
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 hidden lg:block"
                style={{
                  background:
                    'rgba(255,255,255,0.08)',
                }}
              />
            )}

            {/* Number + time */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-700"
                style={{
                  background: `${step.color}18`,
                  color: step.color,
                  fontFamily: 'JetBrains Mono',
                  border: `1px solid ${step.color}30`,
                }}
              >
                {step.num}
              </div>

              <span
                className="text-xs text-slate-500"
                style={{
                  fontFamily: 'JetBrains Mono',
                }}
              >
                {step.time}
              </span>
            </div>

            {/* Agent name */}
            <div
              className="font-600 text-sm text-slate-200 mb-1"
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
              }}
            >
              {step.name}
            </div>

            {/* Description */}
            <div
              className="text-xs text-slate-500 mb-4 leading-relaxed"
              style={{
                fontFamily: 'Inter',
              }}
            >
              {step.desc}
            </div>

            {/* Progress */}
            <div
              className="h-0.5 rounded-full overflow-hidden"
              style={{
                background:
                  'rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${safeProgress(
                    step.progress
                  )}%`,
                  background: step.color,
                  opacity: 0.7,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}