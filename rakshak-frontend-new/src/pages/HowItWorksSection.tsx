import SectionHeader from '../components/ui/SectionHeader'

const STEPS = [
  { num: '01', title: 'Submit a message',          body: 'Paste an SMS, upload a screenshot, or record a voice note. Rakshak accepts all three input types.' },
  { num: '02', title: 'Agents analyze',            body: 'Four specialized agents — Intake, Link, Pattern, and Verification — independently evaluate the input in sequence.' },
  { num: '03', title: 'RAG retrieves similar scams', body: 'The Pattern Agent searches 1,200+ labeled examples in ChromaDB for semantically similar fraud patterns using cosine distance.' },
  { num: '04', title: 'Verdict cross-validated',   body: 'The Verification Agent combines all agent outputs, detects conflicts, and issues a final SCAM or SAFE verdict with a confidence score.' },
  { num: '05', title: 'Full trace logged',          body: 'Every decision is recorded with timestamps and agent metadata. Audit any check using its Trace ID in the Trace Lookup section.' },
]

export default function HowItWorksSection() {
  return (
    <section id="section-howitworks" className="mb-12">
      <SectionHeader label="How It Works" title="From message to verdict in seconds" />
      <div className="space-y-0">
        {STEPS.map((s, i) => (
          <div key={i} className="flex gap-8 items-start">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-600 flex-shrink-0 mt-0.5"
              style={{ fontFamily: 'JetBrains Mono', background: 'rgba(34,211,238,0.07)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.12)' }}>
              {s.num}
            </div>
            <div className="py-5 flex-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="text-slate-200 text-sm font-500 mb-1.5" style={{ fontFamily: 'Inter', fontWeight: 500 }}>{s.title}</div>
              <div className="text-slate-500 text-sm leading-relaxed" style={{ fontFamily: 'Inter' }}>{s.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
