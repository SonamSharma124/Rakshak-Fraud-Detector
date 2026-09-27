import SectionHeader from '../components/ui/SectionHeader'

const STACK_ITEMS = [
  ['Stack',    'Python · FastAPI · Ollama · ChromaDB'],
  ['Frontend', 'React · Vite · Tailwind CSS v4'],
  ['Models',   'Llama 3.2 · nomic-embed-text'],
  ['Tracing',  'OpenTelemetry · custom spans'],
  ['License',  'MIT — open source'],
]

export default function AboutSection() {
  return (
    <section id="section-about" className="mb-20">
      <SectionHeader label="About" title="Why Rakshak exists" />
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-5 text-slate-400 text-base leading-relaxed" style={{ fontFamily: 'Inter' }}>
          <p>India loses billions annually to SMS and voice scams targeting ordinary people — electricity disconnection threats, fake KYC deadlines, lottery fraud. Most victims don't have a tool that works offline, in Hindi, and doesn't require sharing their messages with a third-party server.</p>
          <p>Rakshak was built in 7 weeks as a demonstration that local AI can be practical: Llama 3.2 via Ollama, semantic retrieval via ChromaDB, and a multi-agent pipeline that cross-validates before issuing a verdict. Zero cloud calls at inference time.</p>
          <p className="text-slate-500 text-sm">Built by a solo engineer as a portfolio project exploring applied AI for social good.</p>
        </div>
        <div className="space-y-3">
          {STACK_ITEMS.map(([k, v]) => (
            <div key={k} className="pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="text-slate-600 text-xs mb-0.5" style={{ fontFamily: 'JetBrains Mono' }}>{k}</div>
              <div className="text-slate-300 text-sm" style={{ fontFamily: 'Inter' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
