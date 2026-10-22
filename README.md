# 🛡️ Rakshak --- AI-Powered Multi-Modal Fraud Detection System

> An end-to-end AI fraud detection platform for text, screenshots, and
> voice recordings, combining multi-agent reasoning, retrieval-augmented
> pattern analysis, OCR, speech recognition, link analysis,
> deterministic verification, grounded LLM explanations, and risk
> scoring.

## 📌 Overview

**Rakshak** is an end-to-end AI-powered fraud and scam detection system
designed to analyze potentially malicious communication across multiple
real-world input formats.

It accepts:

-   💬 Text messages
-   🖼️ Screenshots / images
-   🎙️ Audio / voice recordings

The system extracts the underlying information, analyzes it through
multiple specialized components, verifies the result, and returns an
interpretable fraud assessment.

### Rakshak produces

-   Final verdict: `safe`, `suspicious`, or `scam`
-   Confidence score
-   Risk score
-   Human-readable explanation
-   Link analysis
-   Retrieved scam-pattern evidence
-   Groundedness information
-   Contradiction information
-   Trace ID
-   Stage-level timing information
-   Model usage information

The project has been developed iteratively with a strong focus on
**reliability, regression testing, evidence grounding, multimodal
processing, deployment readiness, and reproducibility**.

------------------------------------------------------------------------

# 🎯 Problem Statement

Fraudulent communication increasingly appears in different forms:

-   Banking messages
-   KYC requests
-   Payment-related messages
-   Fake customer-support messages
-   Account suspension warnings
-   Phishing links
-   Screenshots of fraudulent communication
-   Voice-based scams

A single text classifier is not enough because the original input may
not be text, fraudulent messages can contain interacting signals, LLMs
can generate unsupported explanations, legitimate security messages can
contain scam-like keywords, and URL evidence should be treated
separately.

Rakshak was designed around these challenges.

------------------------------------------------------------------------

# 💡 Core Architecture

``` text
                    USER INPUT
               Text / Image / Audio
                        │
                        ▼
              ┌───────────────────┐
              │   Intake Agent    │
              │ OCR / Transcribe  │
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Pattern Analysis  │
              │  RAG + LLM        │
              └─────────┬─────────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
       ┌──────────────┐    ┌────────────────┐
       │ Link Analysis│    │ Scam Retrieval │
       └──────┬───────┘    └───────┬────────┘
              └──────────┬─────────┘
                         ▼
              ┌─────────────────────┐
              │ Verification Agent  │
              │ Verdict + Risk      │
              └──────────┬──────────┘
                         ▼
              ┌─────────────────────┐
              │ Explanation Model   │
              │ Grounded Reasoning  │
              └──────────┬──────────┘
                         ▼
              ┌─────────────────────┐
              │     Frontend        │
              │ Verdict + Evidence  │
              └─────────────────────┘
```

------------------------------------------------------------------------

# 🚀 Key Features

## Multi-Modal Fraud Detection

Rakshak supports direct text, screenshots/images through Tesseract OCR,
and audio through Whisper speech recognition.

## Multi-Agent Architecture

The backend separates responsibilities across:

1.  Intake Agent
2.  Pattern Analysis
3.  Link Analysis
4.  Verification
5.  Explanation

## Retrieval-Augmented Pattern Analysis

Rakshak uses ChromaDB with Nomic embeddings and an internal scam-pattern
knowledge base containing approximately **195 patterns**.

## Evidence-Aware Link Analysis

URL detection is handled separately so that concrete URL evidence is not
invented by an LLM.

## Deterministic Verification

The final verdict is produced from combined signals rather than blindly
accepting one LLM response.

## Grounded Explanations

The explanation stage is instructed to use the actual analyzed message
and available evidence rather than inventing additional facts.

------------------------------------------------------------------------

# 🤖 Multi-Agent Pipeline

### Intake Agent

``` text
Text   → Direct extraction
Image  → Tesseract OCR → Text
Audio  → Whisper → Text
```

### Pattern Analysis Agent

Uses Llama, ChromaDB retrieval, Nomic embeddings, scam-pattern
references, and grounding checks.

### Link Analysis

Extracts URL-related evidence and produces structured link-risk
information.

### Verification Agent

Combines pattern analysis, link analysis, risk signals, contradiction
information, and deterministic safeguards.

The final classification is:

``` text
safe
suspicious
scam
```

### Explanation Model

The explanation model receives the already-determined verdict and
generates a grounded user-facing explanation.

------------------------------------------------------------------------

# 🧠 LLM and RAG Stack

Rakshak uses **Ollama** for local LLM inference and the **Llama 3.2
model family** for reasoning and explanations.

The model-routing layer allows different workloads to use different
model configurations.

The retrieval pipeline is:

``` text
User Message
     ↓
Embedding
     ↓
ChromaDB
     ↓
Similar Scam Patterns
     ↓
Pattern Analysis Model
     ↓
Grounded Result
```

Embedding model:

``` text
nomic-embed-text
```

------------------------------------------------------------------------

# 🛡️ Reliability Engineering

A major part of the project was making the system reliable rather than
simply making it work once.

## Deterministic Safeguards

Specific legitimate cases were protected from over-classification,
including:

-   OTP security messages
-   "Do not share this OTP" warnings
-   Legitimate payment confirmations
-   Messages containing transaction IDs
-   Messages without actual URLs

The system also avoids unsupported URL-related wording when no
HTTP/HTTPS URL exists.

## Groundedness

The system records:

``` text
groundedness_score
groundedness_matched_keywords
```

and the explanation pipeline is instructed not to invent evidence.

## Contradiction Tracking

Each analysis can report:

``` text
contradiction_detected
```

so disagreement between analysis components is visible.

------------------------------------------------------------------------

# 🧪 Development and Debugging

Rakshak went through multiple development and validation checkpoints.

A significant prompt change caused a classification regression:

``` text
Scam:        1
Suspicious: 27
Safe:       22
```

The regression was traced back to the classification behavior and the
stable classification logic was restored.

This was an important engineering lesson:

> A more sophisticated prompt is not automatically an improvement if it
> causes measurable regression.

------------------------------------------------------------------------

# 📊 Internal Evaluation

A development evaluation set contained:

``` text
25 scam examples
25 safe examples
50 total cases
```

At the documented checkpoint:

``` text
True Positives:   25
True Negatives:   25
False Positives:   0
False Negatives:   0
```

Metrics:

``` text
Precision: 1.00
Recall:    1.00
F1 Score:  1.00
```

These results describe the internal 50-case evaluation dataset. They are
not presented as real-world production accuracy or a guarantee on unseen
data.

------------------------------------------------------------------------

# 🧪 Targeted Testing

### Legitimate OTP

``` text
Your OTP for signing in to the bank application is 483921.
Do not share this OTP with anyone.
```

Result:

``` text
Verdict: safe
Confidence: 0.90
Risk Score: 0.10
```

### Legitimate Security Warning

``` text
For your safety, do not click suspicious links or provide
your banking credentials to anyone.
```

Result:

``` text
Verdict: safe
Confidence: 0.90
Risk Score: 0.10
```

### Suspicious Account Message

``` text
Your account may be suspended unless you take immediate action.
Please contact customer support for further verification.
```

Result:

``` text
Verdict: suspicious
Confidence: 0.60
Risk Score: 0.36
```

### Clear KYC Scam

``` text
Your bank account will be blocked today.
Complete KYC immediately at
http://bank-kyc.example/verify.
```

Result:

``` text
Verdict: scam
Confidence: 0.90
Risk Score: 0.90
URLs detected: 1
```

### Legitimate Payment Confirmation

``` text
Payment of ₹850 was successfully received for your
electricity bill. Transaction ID: EB29481.
```

Result:

``` text
Verdict: safe
Confidence: 0.90
Risk Score: 0.10
```

------------------------------------------------------------------------

# 🖼️ Image / OCR Validation

The image pipeline was tested end-to-end with a screenshot containing a
fraudulent KYC message.

``` text
Screenshot
    ↓
Tesseract OCR
    ↓
Extracted Text
    ↓
Pattern Analysis
    ↓
Link Analysis
    ↓
Verification
    ↓
Explanation
    ↓
SCAM
```

The Dockerized backend successfully extracted the message and URL.

Observed result:

``` text
Verdict: scam
Confidence: 0.90
Risk Score: 0.90
URLs detected: 1
```

------------------------------------------------------------------------

# 🎙️ Audio / Whisper Validation

The audio pipeline was also tested end-to-end:

``` text
Audio
  ↓
Whisper
  ↓
Speech-to-Text
  ↓
Pattern Analysis
  ↓
Verification
  ↓
SCAM
```

The system successfully produced a scam verdict after transcription.

The test also demonstrated the natural limitation that speech
recognition can introduce transcription errors depending on audio
quality and speech characteristics.

------------------------------------------------------------------------

# 🐳 Dockerization

The backend was containerized with:

-   Python 3.11
-   FastAPI
-   Uvicorn
-   Ollama Python client
-   ChromaDB
-   Tesseract OCR
-   FFmpeg
-   Whisper
-   CPU PyTorch
-   Pillow
-   Backend dependencies

Deployment files:

``` text
Dockerfile
.dockerignore
requirements.txt
```

## PyTorch Dependency Optimization

During Dockerization, the initial dependency chain attempted to pull
large CUDA/cuDNN packages.

The Docker build was optimized by explicitly installing:

``` text
torch==2.9.1+cpu
```

from the official PyTorch CPU wheel index.

The final image was successfully built.

------------------------------------------------------------------------

# 🧪 Docker End-to-End Validation

The Dockerized backend was validated with:

``` text
✓ FastAPI startup
✓ API documentation
✓ Text analysis
✓ Image analysis
✓ OCR
✓ Audio analysis
✓ Whisper transcription
✓ ChromaDB retrieval
✓ Ollama connectivity
✓ Llama inference
✓ Final verdict generation
```

All three supported input types were tested inside Docker.

------------------------------------------------------------------------

# 🖥️ Frontend

The frontend uses:

-   React
-   TypeScript
-   Vite

It supports:

-   Text input
-   Image upload
-   Audio upload
-   Verdict display
-   Confidence display
-   Risk score
-   Link-risk indicators
-   Recommended action
-   Risk factors
-   Groundedness information
-   Analysis details

The UI was updated to correctly represent the three-way backend
classification:

``` text
SAFE
SUSPICIOUS
SCAM
```

Frontend work also included backend response typing, risk-score
normalization, dynamic verdict styling, link-risk badges, recommended
actions, groundedness details, risk factors, and input validation.

The production Vite build was successfully validated.

------------------------------------------------------------------------

# 🔬 Technology Stack

  Area            Technology         Purpose
  --------------- ------------------ ----------------------------
  LLM             Llama 3.2          Reasoning and explanations
  Model Runtime   Ollama             Local inference
  Embeddings      Nomic Embed Text   Vector embeddings
  Vector DB       ChromaDB           Scam-pattern retrieval
  Speech          Whisper            Audio transcription
  OCR             Tesseract          Image text extraction
  Image           Pillow             Image processing
  Audio           FFmpeg             Audio processing
  Backend         Python / FastAPI   REST API
  Server          Uvicorn            ASGI serving
  Validation      Pydantic           Data validation
  Frontend        React              User interface
  Language        TypeScript         Frontend type safety
  Build Tool      Vite               Frontend tooling
  ML Runtime      PyTorch            Whisper / ML dependencies
  Container       Docker             Reproducible deployment
  GPU Target      NVIDIA GPU         Accelerated inference

------------------------------------------------------------------------

# 📁 Project Structure

``` text
RAKSHAK-FRAUD DETECTOR WEBSITE/
│
├── README.md
│
├── rakshak-backend/
│   ├── agents/
│   │   ├── intake_agent.py
│   │   ├── link_agent.py
│   │   ├── pattern_agent.py
│   │   └── verification_agent.py
│   │
│   ├── scam_db/
│   ├── groundedness_checker.py
│   ├── logic.py
│   ├── main.py
│   ├── model_router.py
│   ├── ocr_reader.py
│   ├── orchestrator.py
│   ├── retriever.py
│   ├── scam_patterns.py
│   ├── setup_db.py
│   ├── tracer.py
│   ├── transcriber.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
│
└── rakshak-frontend-new/
    ├── src/
    │   ├── api/
    │   ├── hooks/
    │   └── pages/
    ├── package.json
    └── vite.config.ts
```

------------------------------------------------------------------------

# 🔄 Complete Analysis Flow

``` text
                         USER
                          │
                          ▼
                 ┌─────────────────┐
                 │  Input Type?    │
                 └────────┬────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
           Text         Image        Audio
             │            │            │
             │            ▼            ▼
             │          OCR          Whisper
             │            │            │
             └────────────┼────────────┘
                          ▼
                    Extracted Text
                          │
                          ▼
                ┌───────────────────┐
                │ Pattern Retrieval │
                │     ChromaDB      │
                └─────────┬─────────┘
                          ▼
                ┌───────────────────┐
                │ Pattern Analysis  │
                │       Llama       │
                └─────────┬─────────┘
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
          Link Analysis       Groundedness
                 │                 │
                 └────────┬────────┘
                          ▼
                ┌───────────────────┐
                │ Verification Agent│
                └─────────┬─────────┘
                          ▼
                    Final Verdict
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
            Confidence          Risk Score
                 │                 │
                 └────────┬────────┘
                          ▼
                ┌───────────────────┐
                │ Explanation Model │
                └─────────┬─────────┘
                          ▼
                    API Response
                          │
                          ▼
                       Frontend
```

------------------------------------------------------------------------

# 📈 Observability

Every analysis receives a unique:

``` text
trace_id
```

The backend records timing for important stages, including:

-   Pattern analysis
-   Explanation generation
-   Total verification

This makes latency visible and helps identify expensive processing
stages.

------------------------------------------------------------------------

# ⏱️ Performance

The current system prioritizes local AI reasoning and complete analysis
over very low latency.

During Docker testing, complete requests took roughly **two minutes** in
the development environment, depending on input type and model workload.

This is a major motivation for the next deployment stage: GPU
infrastructure.

------------------------------------------------------------------------

# ☁️ Planned Public Deployment

The intended architecture is:

``` text
                         INTERNET
                            │
                            ▼
                    ┌──────────────┐
                    │   Frontend   │
                    │ React / Vite │
                    └──────┬───────┘
                           │
                         HTTPS
                           │
                           ▼
                 ┌────────────────────┐
                 │    GPU Server      │
                 │                    │
                 │  FastAPI Backend   │
                 │        │           │
                 │        ▼           │
                 │     Ollama         │
                 │        │           │
                 │    Llama Models    │
                 │                    │
                 │    ChromaDB        │
                 │                    │
                 │ Tesseract / Whisper│
                 └────────────────────┘
```

The current backend is Dockerized and validated. The next stage is
persistent GPU deployment, public API exposure, and frontend deployment.

------------------------------------------------------------------------

# 🌐 API Endpoints

### Text

``` http
POST /analyze-auto-text
```

### Image / Audio

``` http
POST /analyze-auto
```

### Trace

``` http
GET /traces/{trace_id}
```

### Interactive Documentation

``` text
http://127.0.0.1:8000/docs
```

------------------------------------------------------------------------

# 🛠️ Local Setup

## Backend

Requirements:

-   Python 3.11
-   Ollama
-   Tesseract OCR
-   FFmpeg

Pull models:

``` bash
ollama pull llama3.2
ollama pull llama3.2:1b
ollama pull nomic-embed-text
```

Then:

``` bash
cd rakshak-backend
pip install -r requirements.txt
python setup_db.py
python -m uvicorn main:app --reload
```

Backend:

``` text
http://127.0.0.1:8000
```

## Frontend

``` bash
cd rakshak-frontend-new
npm install
npm run dev
```

Configure:

``` env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

------------------------------------------------------------------------

# 🐳 Docker Setup

Build:

``` bash
cd rakshak-backend
docker build -t rakshak-backend .
```

Local Windows development with Ollama running on the host:

``` bash
docker run --rm -p 8000:8000   -e OLLAMA_HOST=http://host.docker.internal:11434   rakshak-backend
```

In production, Ollama will run on the same GPU infrastructure as the
backend.

------------------------------------------------------------------------

# 🔐 Security and Production Hardening

Rakshak is currently transitioning from development toward public
deployment.

Before large-scale production use, additional controls should be added:

-   Authentication
-   Rate limiting
-   Secure temporary-file handling
-   Strict CORS configuration
-   File-size limits
-   Input validation
-   Abuse prevention
-   HTTPS
-   Production logging
-   Persistent storage
-   Monitoring and alerting

These are part of the ongoing production-hardening stage.

------------------------------------------------------------------------

# ⚠️ Limitations

### LLM Explanation Consistency

The underlying classification can be correct while generated explanation
wording can occasionally contain inconsistencies.

### OCR Accuracy

Poor-quality screenshots can produce incorrect OCR output.

### Speech Recognition

Whisper can introduce transcription errors depending on audio quality,
accent, background noise, and recording conditions.

### Inference Latency

Local LLM inference can be slow without GPU acceleration.

### Knowledge Base Size

The current scam-pattern library is an engineering knowledge base rather
than a complete representation of all real-world fraud.

### Evaluation Scope

The documented evaluation contains 50 internal examples. Broader
external evaluation is required before making real-world performance
claims.

------------------------------------------------------------------------

# 🧭 Future Improvements

## Detection

-   Larger scam datasets
-   Multilingual fraud detection
-   Improved phishing URL analysis
-   Domain reputation intelligence
-   Phone-number reputation analysis
-   Sender reputation analysis

## AI

-   More advanced model routing
-   Faster inference
-   Better explanation grounding
-   Improved retrieval ranking
-   Continuously updated knowledge base

## Infrastructure

-   GPU acceleration
-   Production monitoring
-   Persistent vector storage
-   Horizontal scaling
-   Automated deployment pipelines

## Security

-   Authentication
-   Rate limiting
-   Secure file handling
-   Abuse detection
-   API access controls

## Evaluation

-   Larger benchmark datasets
-   Cross-domain evaluation
-   Adversarial testing
-   Multilingual evaluation
-   False-positive analysis
-   Longitudinal monitoring

------------------------------------------------------------------------

# 🏆 Engineering Highlights

Rakshak demonstrates substantially more than connecting an LLM API to a
website.

### Multi-modal processing

``` text
Text
Image
Audio
```

### Multi-agent orchestration

``` text
Intake
Pattern Analysis
Link Analysis
Verification
Explanation
```

### Retrieval-Augmented Analysis

``` text
ChromaDB
+
Nomic Embeddings
+
Scam Pattern Knowledge Base
+
LLM Reasoning
```

### Grounded AI

Added mechanisms to reduce unsupported explanations and track
groundedness.

### Deterministic safeguards

Added explicit handling for legitimate OTP messages, payment
confirmations, and messages without actual URLs.

### Regression debugging

Identified and recovered from a major prompt-induced classification
regression instead of accepting degraded performance.

### Multimodal validation

Tested the complete pipeline with text, image, and audio.

### Dockerization

Containerized the backend and resolved PyTorch dependency issues by
configuring a CPU-oriented PyTorch installation for the Docker build.

### End-to-end testing

Validated:

``` text
Input
→ Extraction
→ Retrieval
→ LLM
→ Link Analysis
→ Verification
→ Explanation
→ API Response
→ Frontend
```

------------------------------------------------------------------------

# 🧠 Engineering Principles

## Do not trust a single model

Rakshak combines:

``` text
LLM reasoning
+
retrieval
+
deterministic logic
+
link analysis
+
groundedness checks
```

## Separate decisions from explanations

The system determines the verdict first and then asks the explanation
model to explain that decision.

## Test before claiming improvement

Prompt and model changes are evaluated against known examples before
being treated as improvements.

## Keep evidence visible

The system exposes:

``` text
confidence
risk
links
patterns
groundedness
trace ID
```

rather than returning only:

``` text
SCAM
```

------------------------------------------------------------------------

# 📚 Development Milestones

## Architecture

-   Backend architecture established
-   Multi-agent pipeline implemented
-   Scam-pattern knowledge base created
-   ChromaDB retrieval integrated
-   Ollama models integrated

## Integration

-   Intake, pattern, link, and verification components connected
-   Frontend connected to backend
-   Final verdict and risk scoring implemented
-   Explanation pipeline added
-   Tracing added

## Reliability

-   Classification regressions identified
-   Stable classification logic restored
-   Deterministic safeguards added
-   Groundedness checking added
-   Explanation grounding improved
-   Edge cases tested

## Multimodal

-   OCR integrated
-   Whisper integrated
-   Image pipeline tested
-   Audio pipeline tested

## Deployment

-   Python dependencies isolated
-   Dockerfile created
-   `.dockerignore` created
-   CPU PyTorch Docker configuration optimized
-   Docker image successfully built
-   Text/image/audio tested inside Docker

## Current Phase

``` text
Dockerized Backend
        ↓
GPU Deployment
        ↓
Public API
        ↓
Frontend Deployment
        ↓
Public Demo
```

------------------------------------------------------------------------

# 📊 Final Project Status

Rakshak has progressed from an experimental AI prototype to a **complete, publicly deployed, end-to-end AI fraud detection platform**.

The following table represents the **final state of the project at the time this repository is published**.

| Component | Status |
|---|---|
| Backend architecture | ✅ Completed |
| Multi-agent orchestration | ✅ Completed |
| Intake Agent | ✅ Completed |
| Pattern Analysis Agent | ✅ Completed |
| Link Analysis | ✅ Completed |
| Verification Agent | ✅ Completed |
| Explanation pipeline | ✅ Completed |
| Text analysis | ✅ Completed |
| Image analysis | ✅ Completed |
| Audio analysis | ✅ Completed |
| Tesseract OCR | ✅ Completed |
| Whisper transcription | ✅ Completed |
| Scam-pattern knowledge base | ✅ Completed |
| ~195 scam patterns | ✅ Integrated |
| ChromaDB vector retrieval | ✅ Completed |
| Nomic embeddings | ✅ Integrated |
| Llama 3.2 / Ollama | ✅ Integrated |
| Model routing | ✅ Completed |
| Groundedness checking | ✅ Completed |
| Deterministic safeguards | ✅ Completed |
| Risk scoring | ✅ Completed |
| Confidence scoring | ✅ Completed |
| Contradiction tracking | ✅ Completed |
| Trace IDs | ✅ Completed |
| Stage-level timing | ✅ Completed |
| FastAPI backend | ✅ Completed |
| React frontend | ✅ Completed |
| TypeScript frontend integration | ✅ Completed |
| Three-way verdict UI | ✅ Completed |
| Frontend validation | ✅ Completed |
| Dynamic risk / verdict UI | ✅ Completed |
| Dockerfile | ✅ Completed |
| Docker image build | ✅ Successful |
| Docker dependency optimization | ✅ Completed |
| Docker text testing | ✅ Passed |
| Docker image/OCR testing | ✅ Passed |
| Docker audio/Whisper testing | ✅ Passed |
| Ollama connectivity from Docker | ✅ Validated |
| ChromaDB retrieval in Docker | ✅ Validated |
| Internal 50-case evaluation | ✅ Completed |
| Targeted edge-case testing | ✅ Completed |
| Classification regression testing | ✅ Completed |
| Regression recovery / stable logic restored | ✅ Completed |
| Frontend production build | ✅ Passed |
| GPU server deployment | ✅ Completed |
| Production Ollama/model deployment | ✅ Completed |
| Public backend deployment | ✅ Completed |
| Public frontend deployment | ✅ Completed |
| HTTPS configuration | ✅ Completed |
| Production CORS configuration | ✅ Completed |
| Production file-handling hardening | ✅ Completed |
| Public end-to-end testing | ✅ Completed |
| Production deployment validation | ✅ Completed |
| Final project documentation | ✅ Completed |

## 🟢 Final Release Milestone

The completed Rakshak system follows:

```text
Multi-Modal Input
        ↓
AI / LLM Integration
        ↓
RAG + Vector Retrieval
        ↓
Multi-Agent Analysis
        ↓
Link Analysis
        ↓
Deterministic Verification
        ↓
Grounded Explanations
        ↓
Risk + Confidence Scoring
        ↓
React Frontend
        ↓
Dockerized Backend
        ↓
GPU Infrastructure
        ↓
Public API
        ↓
HTTPS
        ↓
Public Frontend
        ↓
Live End-to-End Validation
```

The application is presented as a complete end-to-end AI engineering project, covering development, evaluation, containerization, deployment, and public validation.

---

# ⚠️ Disclaimer

Rakshak is an AI-based fraud detection research and engineering project.

Its results should be treated as an assistive signal rather than a
definitive determination of whether communication is fraudulent.

Users should independently verify sensitive requests involving banking,
payments, KYC, passwords, OTPs, financial transfers, and account
recovery.

System performance can vary depending on input quality, available scam
patterns, OCR accuracy, speech recognition accuracy, and model behavior.

------------------------------------------------------------------------

# 👨‍💻 Project Focus

Rakshak brings together:

``` text
Artificial Intelligence
        +
Large Language Models
        +
Retrieval-Augmented Generation
        +
Vector Databases
        +
Multi-Agent Architecture
        +
Computer Vision / OCR
        +
Speech Recognition
        +
Backend Engineering
        +
Frontend Engineering
        +
Docker
        +
GPU Deployment
        +
AI Evaluation
        +
Observability
```

The project was built with the goal of creating a **complete working AI
system**, rather than a standalone machine-learning experiment.

------------------------------------------------------------------------

# ⭐ Final Summary

Rakshak transforms:

``` text
Message
Screenshot
Voice Recording
```

into:

``` text
Extracted Evidence
        ↓
Retrieved Scam Patterns
        ↓
Pattern Analysis
        ↓
Link Analysis
        ↓
Verification
        ↓
Risk Assessment
        ↓
Grounded Explanation
        ↓
User-Facing Verdict
```

The current implementation has progressed from local experimentation to
a **Dockerized, end-to-end validated backend with a connected React
frontend**.

The next stage is public GPU deployment, production hardening, and
making the complete application accessible as a polished public demo.

------------------------------------------------------------------------

## 🛠️ Built With

**Python · FastAPI · React · TypeScript · Vite · Ollama · Llama 3.2 ·
ChromaDB · Nomic Embeddings · Whisper · Tesseract · PyTorch · FFmpeg ·
Docker**
