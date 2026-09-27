import type { AnalysisResult } from '../../hooks/useAnalysis'

type Props = {
  result: AnalysisResult
}

function valueOrFallback(value: unknown): string {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return 'Not returned by backend'
  }

  return String(value)
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

function formatCost(
  value: number | undefined | null,
): string {
  if (
    value === undefined ||
    value === null ||
    Number.isNaN(value)
  ) {
    return 'Not returned by backend'
  }

  return `$${value.toFixed(6)}`
}

export default function EngineeringDetails({
  result,
}: Props) {
  const timing = result?.timing ?? {
    patternAgentSeconds: null,
    linkAgentSeconds: null,
    verdictCombinationSeconds: null,
    explanationLlmSeconds: null,
    totalVerificationSeconds: null,
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <span
          className="text-cyan-400"
          style={{ fontFamily: 'JetBrains Mono' }}
        >
          •
        </span>

        <h2
          className="text-sm font-semibold text-slate-200"
          style={{ fontFamily: 'JetBrains Mono' }}
        >
          Engineering Details
        </h2>

        <span className="text-slate-700">·</span>

        <span
          className="text-xs text-slate-500"
          style={{ fontFamily: 'JetBrains Mono' }}
        >
          Backend telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          className="rounded-xl border p-5"
          style={{
            borderColor: 'rgba(255,255,255,0.10)',
            background: '#10172a',
          }}
        >
          <p className="mb-3 text-xs text-slate-500">
            Pattern Agent Model
          </p>

          <p
            className="text-sm font-semibold text-white"
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            {valueOrFallback(result.patternModelUsed)}
          </p>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            borderColor: 'rgba(255,255,255,0.10)',
            background: '#10172a',
          }}
        >
          <p className="mb-3 text-xs text-slate-500">
            Explanation LLM
          </p>

          <p
            className="text-sm font-semibold text-white"
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            {valueOrFallback(result.explanationModelUsed)}
          </p>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            borderColor: 'rgba(255,255,255,0.10)',
            background: '#10172a',
          }}
        >
          <p className="mb-3 text-xs text-slate-500">
            Groundedness
          </p>

          <p
            className="text-sm font-semibold text-white"
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            {result.groundedness !== null &&
            result.groundedness !== undefined
              ? result.groundedness
              : 'Not returned by backend'}
          </p>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            borderColor: 'rgba(255,255,255,0.10)',
            background: '#10172a',
          }}
        >
          <p className="mb-3 text-xs text-slate-500">
            Explanation Tokens
          </p>

          <p
            className="text-sm font-semibold text-white"
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            {result.explanationTokens > 0
              ? result.explanationTokens
              : 'Not returned by backend'}
          </p>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            borderColor: 'rgba(255,255,255,0.10)',
            background: '#10172a',
          }}
        >
          <p className="mb-3 text-xs text-slate-500">
            Estimated Cost
          </p>

          <p
            className="text-sm font-semibold text-white"
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            {result.explanationEstimatedCost > 0
              ? formatCost(result.explanationEstimatedCost)
              : 'Local / not returned'}
          </p>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            borderColor: 'rgba(255,255,255,0.10)',
            background: '#10172a',
          }}
        >
          <p className="mb-3 text-xs text-slate-500">
            Total Verification Time
          </p>

          <p
            className="text-sm font-semibold text-white"
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            {formatSeconds(timing.totalVerificationSeconds)}
          </p>
        </div>
      </div>

      <div
        className="mt-4 rounded-xl border p-5"
        style={{
          borderColor: 'rgba(255,255,255,0.08)',
          background: '#0d1425',
        }}
      >
        <p className="mb-5 text-xs text-slate-500">
          Agent Timing
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div>
            <p className="mb-2 text-xs text-slate-500">
              Pattern
            </p>

            <p
              className="text-sm text-slate-300"
              style={{ fontFamily: 'JetBrains Mono' }}
            >
              {formatSeconds(timing.patternAgentSeconds)}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs text-slate-500">
              Link
            </p>

            <p
              className="text-sm text-slate-300"
              style={{ fontFamily: 'JetBrains Mono' }}
            >
              {formatSeconds(timing.linkAgentSeconds)}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs text-slate-500">
              Verdict
            </p>

            <p
              className="text-sm text-slate-300"
              style={{ fontFamily: 'JetBrains Mono' }}
            >
              {formatSeconds(timing.verdictCombinationSeconds)}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs text-slate-500">
              Explanation LLM
            </p>

            <p
              className="text-sm text-slate-300"
              style={{ fontFamily: 'JetBrains Mono' }}
            >
              {formatSeconds(timing.explanationLlmSeconds)}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
