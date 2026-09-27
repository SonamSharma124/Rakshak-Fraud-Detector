export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-12 py-4"
      style={{ background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="text-slate-600 text-xs" style={{ fontFamily: 'JetBrains Mono' }}>
        / check
      </div>
      <StatusBar />
    </header>
  )
}

function StatusBar() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', fontFamily: 'JetBrains Mono' }}>
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-green-400 font-500">System Online</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
        style={{ background: 'rgba(168,139,250,0.08)', border: '1px solid rgba(168,139,250,0.15)', fontFamily: 'JetBrains Mono' }}>
        <div className="w-3.5 h-3.5 rounded" style={{ background: 'rgba(168,139,250,0.3)' }}>
          <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
            <rect x="1" y="4" width="12" height="6" rx="1" fill="rgba(168,139,250,0.6)" />
            <circle cx="7" cy="2.5" r="1" fill="rgba(168,139,250,0.6)" />
          </svg>
        </div>
        <span className="text-purple-300 font-500">Llama 3.2 · Ollama</span>
      </div>
    </div>
  )
}
