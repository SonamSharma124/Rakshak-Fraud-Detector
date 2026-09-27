import SectionHeader from '../components/ui/SectionHeader'

const LLM_SPECS  = [['Pattern Agent model', 'llama3.2'], ['Verification model', 'llama3.2:1b'], ['Context window', '128k tokens'], ['Avg tokens/check', '156']]
const RAG_SPECS  = [['Examples indexed', '1,200+'], ['Embedding model', 'nomic-embed-text'], ['Similarity threshold', '0.75'], ['Avg groundedness', '0.86']]

export default function ModelRagSection() {
  return (
    <section id="section-model" className="mb-12">
      <SectionHeader label="Model & RAG" title="Local inference. Open weights."
        desc="Rakshak uses Llama 3.2 via Ollama for zero-cost, privacy-preserving inference, backed by ChromaDB for semantic retrieval." />
      <div className="grid grid-cols-2 gap-6">
        <div className="px-7 py-7 rounded-2xl" style={{ background: 'rgba(15,22,41,0.7)', border: '1px solid rgba(34,211,238,0.1)' }}>
          <div className="text-cyan-500 text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'JetBrains Mono' }}>LLM</div>
          <div className="font-display font-700 text-xl text-white mb-1" style={{ fontFamily: 'Outfit' }}>Llama 3.2</div>
          <div className="text-slate-500 text-sm mb-5" style={{ fontFamily: 'Inter' }}>via Ollama · runs 100% on-device</div>
          <div className="space-y-2.5">
            {LLM_SPECS.map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-500" style={{ fontFamily: 'Inter' }}>{k}</span>
                <span className="text-slate-300" style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-7 py-7 rounded-2xl" style={{ background: 'rgba(15,22,41,0.7)', border: '1px solid rgba(168,139,250,0.1)' }}>
          <div className="text-purple-400 text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'JetBrains Mono' }}>RAG</div>
          <div className="font-display font-700 text-xl text-white mb-1" style={{ fontFamily: 'Outfit' }}>ChromaDB</div>
          <div className="text-slate-500 text-sm mb-5" style={{ fontFamily: 'Inter' }}>Semantic similarity · cosine distance</div>
          <div className="space-y-2.5">
            {RAG_SPECS.map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-500" style={{ fontFamily: 'Inter' }}>{k}</span>
                <span className="text-slate-300" style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
