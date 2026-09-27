1. Multi-Agent System

Definition: Ek AI system jisme ek bade kaam ko alag-alag specialized agents mein baanta jaata hai, jahan har agent ka apna specific, justified kaam hota hai — koi ek "sabkuch karne wala" LLM nahi.

Kyu zaroori hai: Ek akela LLM sab kuch (meaning check, URL check, contradiction detect) karne ki koshish kare toh wo overloaded, inconsistent, aur galtiyon-prone ho sakta hai. Alag agents = alag responsibility = zyada reliable system.

Important principle: Har agent genuinely alag kaam karta ho, sirf naam ke liye "agent" mat banao — warna yeh sirf decoration hai, real value nahi.

2. Intake Agent

Kaam: Kisi bhi input (text/image/audio) ko dekh ke uska type detect karta hai, aur sahi tool (OCR/Whisper/direct) se plain text nikaal ke deta hai.

Kyu zaroori: User ko manually endpoint choose nahi karna padta — system khud samajh leta hai input kya hai. File extension (.png, .wav etc.) dekh ke decide karta hai.

3. Link Agent

Kaam: Regex se message mein se URLs nikaalta hai, aur unke red flags check karta hai — URL shortener, brand impersonation (fake SBI domain), missing HTTPS, suspicious hyphens/TLDs.

Important design choice: Yeh LLM use nahi karta — pure rule-based Python logic hai. Kyunki yeh checks deterministic hain (fixed rules), LLM use karna slow aur unreliable hota.

4. Tool Calling

Definition: LLM ko ek "tools ka menu" (naam + description + parameters) diya jaata hai, aur LLM khud decide karta hai ki kab kaunsa tool use karna hai — bina humne har case ke liye manually if conditions likhe.

Kaise kaam karta hai:

LLM ko message + available tools milte hain
LLM decide karta hai "mujhe tool chahiye" — tool_calls mein bolta hai
Hamara Python code (LLM nahi) us tool ko actually chalata hai
Tool ka result LLM ko wapas diya jaata hai
LLM final, informed jawab deta hai

Honest limitation observe ki: Chhote local models (llama3.2) conditional instructions ("sirf tabhi tool call karo jab X ho") ko hamesha reliably follow nahi karte — kabhi unnecessary calls kar dete hain ya apne hi decision mein confuse ho jaate hain.

5. Pattern Agent

Kaam: RAG pipeline (Week 2 wala) ko formally ek agent banaya — message ka meaning known scam patterns se compare karta hai (embeddings + ChromaDB + LLM).

Naya insight: retrieve_similar_patterns() hamesha top_k patterns return karta hai, chahe genuinely relevant hon ya nahi (database mein "sabse kam door" hamesha milta hai). Isliye field ka naam retrieved_patterns rakha (na ki matched_patterns) — final decision verdict aur reason mein hai, sirf retrieval mein nahi.

6. Verification Agent (Sabse Important)

Kaam: Pattern Agent aur Link Agent, dono ke results leta hai, unhe combine karta hai, contradictions detect karta hai, aur final verdict deta hai.

Key design decision: Scoring/combining logic pure Python rules se (deterministic, predictable, debuggable) — LLM sirf explanation likhne ke liye use hota hai, jahan uski asli strength hai (natural language), verdict decide karne ke liye nahi.

Contradiction detection ke do cases:

Pattern Agent "safe" bole, par Link Agent "high risk" bole → contradiction
Pattern Agent low-confidence se "scam" bole, par koi link support na kare → contradiction

Fallback mechanism: Agar LLM explanation dene se refuse kare ya bahut chhota/invalid jawab de, system apna khud ka template-based explanation banata hai (graceful degradation) — system kabhi broken output nahi deta.

7. Orchestrator

Kaam: Poore flow ko coordinate karta hai — Intake Agent ko bulata hai, uska text Verification Agent ko deta hai (jo khud Pattern + Link Agent ko andar se call karta hai), aur sab kuch ek clean response mein jodta hai.

Design principle: Orchestrator ko sirf high-level flow pata hona chahiye (kaun kis order mein chalega), agents ke internal details nahi — yeh "separation of concerns" kehlata hai.

8. Graceful Degradation

Concept: System aisa design karna ki agar koi ek component (jaise LLM) fail ho ya unexpected behave kare, poora system crash na ho ya galat info na de — balki ek safe, simple fallback pe chala jaaye.

Hamare project mein use: Verification Agent ka explanation-fallback — agar LLM refuse kare, template-based explanation ban jaata hai.

One-Line Definitions (Quick Reference)
Multi-Agent System: Ek kaam ko alag specialized agents mein baantna, har ek ka apna justified role.
Intake Agent: Input type detect karke plain text nikaalne wala agent.
Link Agent: URLs ke red flags check karne wala rule-based (no-LLM) agent.
Tool Calling: LLM ko khud decide karne dena ki kab external tool use karna hai.
Pattern Agent: RAG-based meaning-matching agent (Week 2 ka formal version).
Verification Agent: Sabko combine karke, contradiction check karke, final verdict dene wala agent.
Orchestrator: Poore multi-agent flow ko coordinate karne wala top-level function.
Contradiction Detection: Do agents ke results aapas mein conflict kar rahe hain ya nahi, yeh check karna.
Graceful Degradation: Component fail hone par bhi system ka safe fallback dena, crash na hona.
retrieved_patterns vs matched_patterns: Naming clarity — retrieval hamesha kuch dega, par "match" hona LLM ka evaluation hai.
VS Code Mein Jo Commands/Files Chalaye (Week 4b)
bash
# Koi naya package install nahi hua is week — sab existing tools (Ollama, ChromaDB, 
# Tesseract, Whisper) reuse hue, sirf naya code likha gaya

# Testing scripts run kiye (order mein)
python test_intake.py
python test_link_agent.py
python test_tool_calling.py
python test_pattern_agent.py
python test_verification_agent.py

# Server restart (naye /analyze-auto, /analyze-auto-text endpoints test karne ke liye)
python -m uvicorn main:app --reload

Files banayi Week 4b mein:

agents/__init__.py (khaali, package banane ke liye)
agents/intake_agent.py
agents/link_agent.py
agents/pattern_agent.py
agents/verification_agent.py
tool_calling_agent.py (root folder, tool-calling concept demo)
orchestrator.py (root folder, sabko jodta hai)
test_intake.py, test_link_agent.py, test_tool_calling.py, test_pattern_agent.py, test_verification_agent.py
main.py (update — /analyze-auto aur /analyze-auto-text endpoints add kiye)