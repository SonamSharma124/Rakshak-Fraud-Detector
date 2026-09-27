import { IconShield } from '../icons'
import { NAV_ITEMS, NAV_SECTION_IDS } from '../../constants/navItems'

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 72
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

type Props = { active: string; onNav: (id: string) => void }

export default function Sidebar({ active, onNav }: Props) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col z-40"
      style={{ background: 'linear-gradient(180deg, #080d1a 0%, #0a0f1e 100%)', borderRight: '1px solid rgba(34,211,238,0.08)' }}>
      {/* Logo */}
      <div className="px-5 py-7 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 cyan-glow"
          style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
          <IconShield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-display font-700 text-sm tracking-widest text-white" style={{ fontFamily: 'Outfit', letterSpacing: '0.12em' }}>
            RAKSHAK
          </div>
          <div className="text-xs text-slate-500" style={{ fontFamily: 'Inter', fontSize: '10px' }}>
            AI Against Scams
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => { onNav(item.id); scrollToSection(NAV_SECTION_IDS[item.id]) }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group text-left"
            style={{
              background:   active === item.id ? 'rgba(34,211,238,0.1)' : 'transparent',
              color:        active === item.id ? '#22d3ee' : 'rgba(148,163,184,0.8)',
              borderLeft:   active === item.id ? '2px solid #22d3ee' : '2px solid transparent',
              fontFamily:   'Inter',
              fontWeight:   active === item.id ? 500 : 400,
            }}
          >
            <span className="flex-shrink-0" style={{ opacity: active === item.id ? 1 : 0.5 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer callout */}
      <div className="px-4 py-5 mx-3 mb-5 rounded-xl" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.1)' }}>
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 font-display font-600 text-xs" style={{ fontFamily: 'Outfit', letterSpacing: '0.04em' }}>7 Weeks of Engineering</span>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed" style={{ fontFamily: 'Inter', fontSize: '10px' }}>
          Local LLM → RAG → Multimodal → Tracing → Routing
        </p>
      </div>
    </aside>
  )
}
