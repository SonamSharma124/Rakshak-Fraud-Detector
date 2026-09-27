import { IconSearch, IconHistory, IconTrace, IconBook, IconArch, IconModel, IconEval, IconInfo } from '../components/icons'

export type NavItem = { id: string; label: string; icon: React.ReactNode }

export const NAV_ITEMS: NavItem[] = [
  { id: 'check',        label: 'Check',       icon: <IconSearch   className="w-4 h-4" /> },
  { id: 'history',      label: 'History',     icon: <IconHistory  className="w-4 h-4" /> },
  { id: 'trace',        label: 'Trace Lookup',icon: <IconTrace    className="w-4 h-4" /> },
  { id: 'howitworks',   label: 'How It Works',icon: <IconBook     className="w-4 h-4" /> },
  { id: 'architecture', label: 'Architecture',icon: <IconArch     className="w-4 h-4" /> },
  { id: 'model',        label: 'Model & RAG', icon: <IconModel    className="w-4 h-4" /> },
  { id: 'evaluation',   label: 'Evaluation',  icon: <IconEval     className="w-4 h-4" /> },
  { id: 'about',        label: 'About',       icon: <IconInfo     className="w-4 h-4" /> },
]

export const NAV_SECTION_IDS: Record<string, string> = {
  check:        'section-check',
  history:      'section-history',
  trace:        'section-trace',
  howitworks:   'section-howitworks',
  architecture: 'section-architecture',
  model:        'section-model',
  evaluation:   'section-evaluation',
  about:        'section-about',
}
