import { useState } from 'react'

import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'

import HeroSection from './pages/check/HeroSection'
import InputPanel from './pages/check/InputPanel'
import VerdictCard from './pages/check/VerdictCard'
import AnalysisPanel from './pages/check/AnalysisPanel'
import PipelineSection from './pages/check/PipelineSection'

import HistorySection from './pages/HistorySection'
import HowItWorksSection from './pages/HowItWorksSection'
import TraceLookupSection from './pages/TraceLookupSection'
import ArchitectureSection from './pages/ArchitectureSection'
import ProjectHighlights from './pages/ProjectHighlights'
import ModelRagSection from './pages/ModelRagSection'
import EvaluationSection from './pages/EvaluationSection'
import AboutSection from './pages/AboutSection'
import EngineeringDetails from './pages/check/EngineeringDetails'

import {
  useAnalysis,
  type AnalysisInput,
} from './hooks/useAnalysis'

export default function App() {
  const [activeNav, setActiveNav] = useState('check')

  /*
   * IMPORTANT:
   * useAnalysis() exposes:
   *   result
   *   loading
   *   runTextAnalysis
   *   runImageAnalysis
   *
   * Do NOT use the old:
   *   analyzing
   *   analyze
   */
  const {
    result,
    loading,
    runTextAnalysis,
    runImageAnalysis,
    runVoiceAnalysis,
  } = useAnalysis()

    const handleSubmit = async (input: AnalysisInput) => {
    try {
      if (input.mode === 'text') {
        await runTextAnalysis(input.text)
      }

      if (input.mode === 'image') {
        await runImageAnalysis(input.file)
      }

      if (input.mode === 'voice') {
        await runVoiceAnalysis(input.file)
      }

      /*
       * Scroll to the result after the backend returns.
       */
      setTimeout(() => {
        const el = document.getElementById(
          'section-verdict',
        )

        if (el) {
          window.scrollTo({
            top:
              el.getBoundingClientRect().top +
              window.scrollY -
              72,
            behavior: 'smooth',
          })
        }
      }, 100)
    } catch (error) {
      console.error(
        '[Rakshak] Analysis failed:',
        error,
      )
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0a0f1e' }}
    >
      <Sidebar
        active={activeNav}
        onNav={setActiveNav}
      />

      <div className="ml-56">
        <Header />

        <main className="px-12 pt-6 pb-14 max-w-5xl">
          <HeroSection />

          <InputPanel
            onSubmit={handleSubmit}
            analyzing={loading}
          />

          {result && (
  <>
    <VerdictCard result={result} />

    <AnalysisPanel
      result={result}
    />

    <PipelineSection
      result={result}
    />

    <EngineeringDetails
      result={result}
    />
  </>
)}

          <HistorySection />

          <HowItWorksSection />

          <TraceLookupSection />

          <ArchitectureSection />

          <ProjectHighlights />

          <ModelRagSection />

          <EvaluationSection />

          <AboutSection />

          <footer
            className="pb-16 pt-4 border-t"
            style={{
              borderColor:
                'rgba(255,255,255,0.05)',
            }}
          >
            <div
              className="flex items-center justify-between text-slate-700 text-xs"
              style={{
                fontFamily: 'JetBrains Mono',
              }}
            >
              <span>
                Rakshak · AI Against Scams · 2026
              </span>

              <span>
                Local inference · No data leaves your device
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}