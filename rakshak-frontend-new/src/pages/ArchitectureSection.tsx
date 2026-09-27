import { ARCH_HIGHLIGHTS } from '../constants/data'

const DATA_FLOW = ['Input', 'Intake Agent', 'Link Agent', 'Pattern Agent', 'RAG (ChromaDB)', 'Verification Agent', 'Verdict']

export default function ArchitectureSection() {
  return (
    <section className="mb-12" id="section-architecture">
      <div className="mb-10">
        <div className="text-slate-500 text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono' }}>System Architecture</div>
        <h2 className="font-display font-700 text-2xl text-white mb-3" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Built for privacy. Runs entirely local.</h2>
        <p className="text-slate-500 text-base leading-relaxed max-w-2xl" style={{ fontFamily: 'Inter' }}>
          Rakshak processes every message on-device using open-source models. No API calls, no data transmission, no external dependencies at inference time.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {ARCH_HIGHLIGHTS.map((h, i) => (
          <div key={i} className="px-6 py-6 rounded-2xl"
            style={{ background: 'rgba(15,22,41,0.7)', border: `1px solid ${h.accent === 'cyan' ? 'rgba(34,211,238,0.1)' : 'rgba(168,139,250,0.1)'}` }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 rounded-lg"
                style={{ background: h.accent === 'cyan' ? 'rgba(34,211,238,0.1)' : 'rgba(168,139,250,0.1)', color: h.accent === 'cyan' ? '#22d3ee' : '#a78bfa' }}>
                {h.icon}
              </div>
              <span className="font-600 text-sm text-slate-200" style={{ fontFamily: 'Outfit', fontWeight: 600 }}>{h.title}</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed" style={{ fontFamily: 'Inter' }}>{h.desc}</p>
          </div>
        ))}
      </div>

      <div className="px-8 py-6 rounded-2xl" style={{ background: 'rgba(15,22,41,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="text-slate-600 text-xs uppercase tracking-widest mb-5" style={{ fontFamily: 'JetBrains Mono' }}>Data Flow</div>
        <div className="flex items-center gap-3 flex-wrap">
          {DATA_FLOW.map((node, i, arr) => (
            <div key={i} className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg text-xs"
                style={{
                  fontFamily: 'JetBrains Mono',
                  background: i === 0 || i === arr.length - 1 ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.04)',
                  border:     i === 0 || i === arr.length - 1 ? '1px solid rgba(34,211,238,0.25)' : '1px solid rgba(255,255,255,0.07)',
                  color:      i === 0 || i === arr.length - 1 ? '#22d3ee' : 'rgba(148,163,184,0.7)',
                }}>
                {node}
              </div>
              {i < arr.length - 1 && <div className="text-slate-700 text-xs">→</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
