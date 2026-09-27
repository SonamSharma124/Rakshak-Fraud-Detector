import React, { useState, useRef } from 'react'
import { IconText, IconImage, IconMic, IconArrowRight } from '../../components/icons'
import { EXAMPLE_MESSAGES, EXAMPLE_TEXTS } from '../../constants/data'
import type { AnalysisInput } from '../../hooks/useAnalysis'

type InputMode = 'text' | 'image' | 'voice'

type Props = {
  onSubmit: (input: AnalysisInput) => void
  analyzing?: boolean
}

export default function InputPanel({ onSubmit, analyzing }: Props) {
  const [mode, setMode]                 = useState<InputMode>('text')
  const [text, setText]                 = useState('')
  const [imageFile, setImageFile]       = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [audioFile, setAudioFile]       = useState<File | null>(null)
  const [isDraggingImage, setIsDragging] = useState(false)
  const imageRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLInputElement>(null)

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleAudioFile = (file: File) => {
    if (!file.type.startsWith('audio/')) return
    setAudioFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageFile(file)
  }

  const handleSubmit = () => {
    if (mode === 'text')  onSubmit({ mode: 'text', text })
    if (mode === 'image' && imageFile) onSubmit({ mode: 'image', file: imageFile })
    if (mode === 'voice' && audioFile) onSubmit({ mode: 'voice', file: audioFile })
    // For image/voice: if no file selected, still trigger with text fallback
    if (mode === 'image' && !imageFile) onSubmit({ mode: 'text', text: '' })
    if (mode === 'voice' && !audioFile) onSubmit({ mode: 'text', text: '' })
  }

  const tabs = [
    { id: 'text'  as InputMode, label: 'Text',  icon: <IconText  className="w-3.5 h-3.5" /> },
    { id: 'image' as InputMode, label: 'Image', icon: <IconImage className="w-3.5 h-3.5" /> },
    { id: 'voice' as InputMode, label: 'Voice', icon: <IconMic   className="w-3.5 h-3.5" /> },
  ]

  return (
    <section className="mb-12">
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(15,22,41,0.8)', border: '1px solid rgba(34,211,238,0.12)' }}>
        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 pt-5 pb-0">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setMode(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm transition-all duration-200"
              style={{
                fontFamily:   'Inter',
                fontWeight:   mode === tab.id ? 500 : 400,
                background:   mode === tab.id ? 'rgba(34,211,238,0.1)' : 'transparent',
                color:        mode === tab.id ? '#22d3ee' : 'rgba(148,163,184,0.7)',
                border:       mode === tab.id ? '1px solid rgba(34,211,238,0.2)' : '1px solid transparent',
                borderBottom: mode === tab.id ? '1px solid rgba(15,22,41,0.8)' : '1px solid transparent',
              }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        <div className="h-px mx-5" style={{ background: 'rgba(34,211,238,0.08)' }} />

        <div className="p-5 pt-5">
          {mode === 'text' && (
            <>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste a suspicious message, e.g. an SMS or an email..."
                rows={5}
                className="w-full bg-transparent resize-none text-sm text-slate-300 placeholder-slate-600 outline-none leading-relaxed"
                style={{ fontFamily: 'Inter' }}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-600 text-xs" style={{ fontFamily: 'Inter' }}>Try an example:</span>
                  {EXAMPLE_MESSAGES.map(ex => (
                    <button key={ex} onClick={() => setText(EXAMPLE_TEXTS[ex] ?? '')}
                      className="px-2.5 py-1 rounded-full text-xs transition-all duration-150 hover:border-cyan-400/40 hover:text-cyan-400"
                      style={{ fontFamily: 'Inter', border: '1px solid rgba(34,211,238,0.15)', color: 'rgba(148,163,184,0.7)', background: 'rgba(34,211,238,0.03)' }}>
                      {ex}
                    </button>
                  ))}
                </div>
                <span className="text-slate-600 text-xs" style={{ fontFamily: 'JetBrains Mono' }}>
                  {text.length.toLocaleString()}/5,000
                </span>
              </div>
            </>
          )}

          {mode === 'image' && (
            <>
              <input ref={imageRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f) }} />
              <div
                onClick={() => !imageFile && imageRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className="rounded-xl text-sm transition-all duration-200"
                style={{
                  border:     `2px dashed ${isDraggingImage ? 'rgba(34,211,238,0.5)' : 'rgba(34,211,238,0.15)'}`,
                  background:  isDraggingImage ? 'rgba(34,211,238,0.04)' : 'transparent',
                  cursor:      imageFile ? 'default' : 'pointer',
                  minHeight:  '8rem',
                }}>
                {imagePreview ? (
                  <div className="relative p-3 flex items-start gap-4">
                    <img src={imagePreview} alt="preview" className="h-28 w-auto rounded-lg object-cover flex-shrink-0"
                      style={{ border: '1px solid rgba(34,211,238,0.2)' }} />
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-slate-300 text-sm truncate mb-1" style={{ fontFamily: 'Inter' }}>{imageFile?.name}</p>
                      <p className="text-slate-600 text-xs" style={{ fontFamily: 'JetBrains Mono' }}>
                        {imageFile ? (imageFile.size / 1024).toFixed(1) + ' KB' : ''}
                      </p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(null); if (imageRef.current) imageRef.current.value = '' }}
                      className="text-slate-600 hover:text-slate-300 transition-colors text-lg leading-none flex-shrink-0 mt-0.5">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center text-slate-500">
                      <IconImage className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <div>Drop a screenshot here or <span className="text-cyan-500">browse</span></div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {mode === 'voice' && (
            <>
              <input ref={audioRef} type="file" accept="audio/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleAudioFile(f) }} />
              <div className="rounded-xl text-sm" style={{ border: '2px dashed rgba(168,139,250,0.2)', minHeight: '8rem' }}>
                {audioFile ? (
                  <div className="flex items-center gap-4 px-5 py-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(168,139,250,0.12)', border: '1px solid rgba(168,139,250,0.2)' }}>
                      <IconMic className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-sm truncate mb-0.5" style={{ fontFamily: 'Inter' }}>{audioFile.name}</p>
                      <p className="text-slate-600 text-xs" style={{ fontFamily: 'JetBrains Mono' }}>
                        {(audioFile.size / 1024).toFixed(1)} KB · {audioFile.type.split('/')[1]?.toUpperCase() ?? 'audio'}
                      </p>
                    </div>
                    <audio controls src={URL.createObjectURL(audioFile)} className="h-8 flex-shrink-0" style={{ maxWidth: '200px' }} />
                    <button onClick={() => { setAudioFile(null); if (audioRef.current) audioRef.current.value = '' }}
                      className="text-slate-600 hover:text-slate-300 transition-colors text-lg leading-none flex-shrink-0">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 cursor-pointer" onClick={() => audioRef.current?.click()}>
                    <div className="text-center text-slate-500">
                      <IconMic className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <div>Click to record or <span className="text-purple-400">upload audio</span></div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Submit */}
        <div className="px-5 pb-5 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={analyzing}
            className="flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-600 transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed"
            style={{
              fontFamily:  'Outfit',
              fontWeight:   600,
              letterSpacing:'0.02em',
              background:   analyzing ? 'linear-gradient(135deg, #0e7490 0%, #0c6280 100%)' : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              color:        '#fff',
              boxShadow:    analyzing ? 'none' : '0 4px 20px rgba(6,182,212,0.3)',
              opacity:      analyzing ? 0.8 : 1,
            }}>
            {analyzing ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
                Analyzing…
              </>
            ) : (
              <>Check Message <IconArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
