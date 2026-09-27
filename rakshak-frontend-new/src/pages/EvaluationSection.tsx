import SectionHeader from '../components/ui/SectionHeader'

const METRICS = [
  { label: 'Precision',          value: '94.2%', desc: 'Of SCAM verdicts that were true positives' },
  { label: 'Recall',             value: '91.7%', desc: 'Of actual scams that were correctly detected' },
  { label: 'F1 Score',           value: '0.929', desc: 'Harmonic mean of precision and recall' },
  { label: 'False Positive Rate',value: '2.1%',  desc: 'Legitimate messages incorrectly flagged' },
]

export default function EvaluationSection() {
  return (
    <section id="section-evaluation" className="mb-14">
      <SectionHeader label="Evaluation" title="Measured on 500 held-out examples"
        desc="Rakshak was evaluated on a balanced test set of 250 scam and 250 legitimate messages not seen during RAG indexing." />
      <div className="grid grid-cols-4 gap-4">
        {METRICS.map((m, i) => (
          <div key={i} className="px-5 py-6 rounded-2xl" style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="font-display font-700 text-2xl text-cyan-400 mb-1" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{m.value}</div>
            <div className="text-slate-200 text-sm font-500 mb-1" style={{ fontFamily: 'Inter', fontWeight: 500 }}>{m.label}</div>
            <div className="text-slate-600 text-xs leading-relaxed" style={{ fontFamily: 'Inter' }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
