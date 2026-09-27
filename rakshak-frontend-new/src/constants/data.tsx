import {
  IconSparkle,
  IconModel,
  IconTrace,
  IconArch,
} from '../components/icons'

// ============================================================================
// EXAMPLE INPUTS
// ============================================================================

export const EXAMPLE_MESSAGES = [
  'Electricity Bill',
  'Bank Account Blocked',
  'KYC Update',
  'Job Offer Scam',
  'Parcel Delivery',
]

export const EXAMPLE_TEXTS: Record<
  string,
  string
> = {
  'Electricity Bill':
    'Your electricity connection will be disconnected today due to unpaid bill. Pay immediately at http://electricity-bill-pay.xyz to avoid disconnection.',

  'Bank Account Blocked':
    'Your SBI account has been blocked due to suspicious activity. Verify your account immediately at http://sbi-verify-now.com or your account will be permanently suspended within 24 hours.',

  'KYC Update':
    'Dear customer, your KYC is expired. Update immediately at http://kyc-update-paytm.xyz to avoid account suspension. Deadline: today 11:59 PM.',

  'Job Offer Scam':
    'Congratulations! You have been selected for a work-from-home job offering ₹50,000/month. Send ₹500 registration fee to http://jobs-india-now.xyz to confirm your position today.',

  'Parcel Delivery':
    'Your parcel could not be delivered due to an incomplete address. Pay ₹29 customs fee at http://india-post-redeliver.xyz within 24 hrs to reschedule.',
}

// ============================================================================
// LEGACY EXPORT
// ============================================================================
//
// IMPORTANT:
//
// The application should NOT use fake placeholder analysis results anymore.
//
// useAnalysis.ts now returns:
//
//   null
//
// when the backend has not returned a result.
//
// This export is retained temporarily so any old import does not break
// compilation. Nothing in the live analysis flow should use it.
//

export const PLACEHOLDER_RESULT = null

// ============================================================================
// HISTORY
// ============================================================================
//
// The current FastAPI backend does NOT expose:
//
// GET /history
//
// Therefore we must NOT show fabricated history records.
//
// Keep this as an empty array until a real history endpoint is added.
//

export const PLACEHOLDER_HISTORY = []

// ============================================================================
// ARCHITECTURE / PROJECT HIGHLIGHTS
// ============================================================================

export const ARCH_HIGHLIGHTS = [
  {
    icon: (
      <IconSparkle className="w-4 h-4" />
    ),

    title: 'Local LLM via Ollama',

    desc:
      'Llama 3.2 runs locally through Ollama for privacy-preserving analysis.',

    accent: 'cyan',
  },

  {
    icon: (
      <IconModel className="w-4 h-4" />
    ),

    title: 'RAG with ChromaDB',

    desc:
      'Retrieved scam patterns provide evidence for semantic matching and grounded analysis.',

    accent: 'purple',
  },

  {
    icon: (
      <IconTrace className="w-4 h-4" />
    ),

    title: 'Full Trace Logging',

    desc:
      'Analysis requests receive trace IDs that can be inspected through the FastAPI trace endpoint.',

    accent: 'cyan',
  },

  {
    icon: (
      <IconArch className="w-4 h-4" />
    ),

    title: 'Multi-Agent Orchestration',

    desc:
      'Specialized agents analyze input, links, scam patterns, and verification signals before the final verdict.',

    accent: 'purple',
  },
]