type Props = { label: string; title: string; desc?: string }

export default function SectionHeader({ label, title, desc }: Props) {
  return (
    <div className="mb-10">
      <div className="text-slate-500 text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono' }}>{label}</div>
      <h2 className="font-display font-700 text-2xl text-white mb-3" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{title}</h2>
      {desc && <p className="text-slate-500 text-base leading-relaxed max-w-2xl" style={{ fontFamily: 'Inter' }}>{desc}</p>}
    </div>
  )
}
