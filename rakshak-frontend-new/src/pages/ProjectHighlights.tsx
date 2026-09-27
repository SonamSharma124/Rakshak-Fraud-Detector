const STATS = [
  { label: 'Scam examples in RAG', value: '1,200+',  sub: 'ChromaDB · cosine similarity' },
  { label: 'Agent pipeline',       value: '4 agents', sub: 'Intake → Link → Pattern → Verify' },
  { label: 'Avg. detection time',  value: '8.2s',     sub: 'End-to-end on M1 Pro' },
  { label: 'Languages supported',  value: 'EN + HI',  sub: 'Hindi + English SMS detection' },
]

const MILESTONES = [
  { week: 'Week 1–2', milestone: 'Local LLM via Ollama',      desc: 'Llama 3.2 integration, prompt engineering, first SCAM/SAFE verdict' },
  { week: 'Week 3',   milestone: 'RAG with ChromaDB',         desc: '1,200+ examples indexed, semantic retrieval with cosine similarity' },
  { week: 'Week 4',   milestone: 'Multimodal input',          desc: 'Screenshot OCR and voice-to-text transcription pipelines' },
  { week: 'Week 5',   milestone: 'Multi-agent orchestration', desc: '4 specialized agents, conflict detection, cross-validation' },
  { week: 'Week 6',   milestone: 'Distributed tracing',       desc: 'OpenTelemetry spans, full pipeline observability, Trace Lookup' },
  { week: 'Week 7',   milestone: 'API routing + dashboard',   desc: 'FastAPI backend, React frontend, this UI shipped' },
]

export default function ProjectHighlights() {
  return (
    <section className="mb-12">
      <div className="mb-10">
        <div className="text-slate-500 text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono' }}>Project Highlights</div>
        <h2 className="font-display font-700 text-2xl text-white" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>7 weeks of focused engineering</h2>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {STATS.map((s, i) => (
          <div key={i} className="px-5 py-6 rounded-2xl" style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="font-display font-700 text-2xl text-cyan-400 mb-1" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{s.value}</div>
            <div className="text-slate-200 text-sm font-500 mb-1" style={{ fontFamily: 'Inter', fontWeight: 500 }}>{s.label}</div>
            <div className="text-slate-600 text-xs" style={{ fontFamily: 'JetBrains Mono' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="px-8 py-8 rounded-2xl" style={{ background: 'rgba(15,22,41,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="text-slate-600 text-xs uppercase tracking-widest mb-6" style={{ fontFamily: 'JetBrains Mono' }}>Engineering Milestones</div>
        <div className="space-y-4">
          {MILESTONES.map((m, i) => (
            <div key={i} className="flex items-start gap-6">
              <div className="text-slate-600 text-xs w-20 flex-shrink-0 pt-0.5" style={{ fontFamily: 'JetBrains Mono' }}>{m.week}</div>
              <div className="flex-1 flex items-start gap-4 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                <div>
                  <div className="text-slate-200 text-sm font-500 mb-0.5" style={{ fontFamily: 'Inter', fontWeight: 500 }}>{m.milestone}</div>
                  <div className="text-slate-500 text-xs" style={{ fontFamily: 'Inter' }}>{m.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
