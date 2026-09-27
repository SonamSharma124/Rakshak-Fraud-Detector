export default function HeroSection() {
  return (
    <section id="section-check" className="mb-10 grid-bg rounded-2xl -mx-2 px-8 pt-8 pb-7 relative overflow-hidden"
      style={{ border: '1px solid rgba(34,211,238,0.06)' }}>
      <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,139,250,0.04) 0%, transparent 70%)', transform: 'translate(-20%, 30%)' }} />
      <div className="relative">
        <div className="text-cyan-600 text-xs uppercase tracking-widest mb-2" style={{ fontFamily: 'JetBrains Mono' }}>
          AI-Powered Fraud Detection
        </div>
        <h1 className="font-display font-800 leading-tight text-white mb-3" style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2.6rem' }}>
          Detect <span style={{ color: '#22d3ee' }}>Scams</span> Before They Harm You
        </h1>
        <p className="text-slate-400 leading-relaxed max-w-2xl" style={{ fontFamily: 'Inter', fontSize: '0.9375rem' }}>
          Analyze text messages, screenshots, and voice notes using local LLMs, RAG retrieval, and a multi-agent verification pipeline — all running on your device.
        </p>
      </div>
    </section>
  )
}
