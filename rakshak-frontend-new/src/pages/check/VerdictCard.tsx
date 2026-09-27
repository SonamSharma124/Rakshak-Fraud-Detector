import { useState } from 'react'
import { IconWarning, IconShield, IconCopy } from '../../components/icons'
import type { AnalysisResult } from '../../hooks/useAnalysis'

type Props = { result: AnalysisResult }

export default function VerdictCard({ result }: Props) {
  const [copied, setCopied] = useState(false)

  const isScam = result.verdict === 'SCAM'
  const color  = isScam ? '#ef4444' : '#4ade80'

  const copy = () => {
    navigator.clipboard.writeText(result.traceId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section id="section-verdict" className="mb-16 animate-fade-in-up">
      {/* Input preview */}
      <div className="mb-4 px-5 py-3.5 rounded-xl text-sm text-slate-400 leading-relaxed"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'Inter' }}>
        <span className="text-slate-600 text-xs uppercase tracking-widest mr-3" style={{ fontFamily: 'JetBrains Mono' }}>Input</span>
        {result.inputPreview}
      </div>

      {/* Verdict card */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: isScam ? 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(15,22,41,0.95) 50%)' : 'linear-gradient(135deg, rgba(74,222,128,0.08) 0%, rgba(15,22,41,0.95) 50%)',
          border:     `1px solid ${isScam ? 'rgba(239,68,68,0.25)' : 'rgba(74,222,128,0.25)'}`,
          boxShadow:  isScam ? '0 0 40px rgba(239,68,68,0.15), 0 0 80px rgba(239,68,68,0.05)' : '0 0 40px rgba(34,197,94,0.15), 0 0 80px rgba(34,197,94,0.05)',
        }}>
        <div className="p-8">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <IconWarning className="w-7 h-7" style={{ color }} />
                  <span className="font-display font-800 text-4xl tracking-tight" style={{ fontFamily: 'Outfit', fontWeight: 800, color }}>
                    {result.verdict}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: isScam ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.1)', border: `1px solid ${isScam ? 'rgba(239,68,68,0.25)' : 'rgba(74,222,128,0.25)'}` }}>
                    <IconShield className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-sm font-600" style={{ fontFamily: 'Outfit', fontWeight: 600, color: isScam ? '#fca5a5' : '#86efac' }}>
                      {result.confidence}% Confidence
                    </span>
                  </div>
                  <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${result.confidence}%`, background: isScam ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #4ade80, #86efac)' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <div className="text-right">
                <div className="text-slate-500 text-xs mb-1" style={{ fontFamily: 'Inter' }}>Checked on</div>
                <div className="text-slate-300" style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{result.checkedAt}</div>
              </div>
              <div className="text-right">
                <div className="text-slate-500 text-xs mb-1" style={{ fontFamily: 'Inter' }}>Trace ID</div>
                <button onClick={copy} className="flex items-center gap-1.5 text-cyan-500 hover:text-cyan-400 transition-colors"
                  style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                  {result.traceId}
                  <IconCopy className="w-3 h-3" />
                  {copied && <span className="text-green-400 text-xs">Copied</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
