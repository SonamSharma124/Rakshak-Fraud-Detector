1. Observability

Definition: System ke internal behavior ko bahar se dekh/samajh paana — kya ho raha hai, kab ho raha hai, kitna time/resource lag raha hai — bina system ko rok ke ya manually debug kiye.

Kyu zaroori hai: Bina observability ke, system "black box" hota hai — kaam karta hai par kyu/kaise pata nahi chalta. Production AI systems mein yeh critical hai, kyunki LLM behavior unpredictable ho sakta hai.

2. Trace

Definition: Ek poori request ka safar — user ke input se leke final output tak, jo bhi steps hue, sabka combined record.

Hamare project mein use: Har /analyze-auto-text ya /analyze-auto request apna khud ka trace banata hai.

3. Span

Definition: Trace ke andar ek chhota, individual step/kaam — jaise ek agent ka execution.

Hamare project mein use: Intake Agent ka run ek span hai, Verification Agent ka run doosra span — dono milke ek trace banate hain.

4. Trace ID

Definition: Har request ko milne wala ek unique identifier code, jo us request ke saare spans ko aapas mein jodता hai.

Hamare project mein use: generate_trace_id() se banaya (UUID ka pehla 8 characters), har response mein return hota hai, taaki baad mein us particular request ka poora data query kiya ja sake.

5. SQLite

Definition: Ek halka, file-based database — poora database ek single file mein store hota hai, bina alag server setup kiye. Python mein built-in support hai.

Kyu chuna (trade-off): Learning/chhote projects ke liye perfect (simple, zero-setup). Bade production systems mein (jaha multiple users ek saath access karein) PostgreSQL behtar hota — yeh ek conscious trade-off decision tha.

Hamare project mein use: traces.db file mein saare spans store hote hain.

6. traced_call() Wrapper Pattern

Concept: Ek generic function jo kisi bhi doosre function ko "wrap" kar sake — uska time measure kare, aur result ko bina disturb kiye wapas de de.

Kaise kaam karta hai: Function ko bina call kiye, sirf reference ke roop mein pass kiya jaata hai (intake, bina brackets ke). traced_call ke andar jaake, func(*args, **kwargs) line pe asal mein wo function chalta hai — is beech ka time measure hota hai.

Hamare project mein use: Orchestrator mein intake aur verify ko traced_call se wrap kiya, bina unki apni files (agents) ko badle.

7. Function Passing (Function As A Value)

Concept: Python mein functions ko variables ki tarah treat kiya ja sakta hai — bina call kiye, kisi aur function ko diya ja sakta hai, aur wahan jaake baad mein call kiya ja sakta hai.

Kyu zaroori: Isi wajah se traced_call kisi bhi agent ke saath kaam kar sakta hai (Intake ho ya Verification), bina har agent ke liye alag tracing-code likhe.

8. GET vs POST (HTTP Methods)

Definition: POST = kuch data bhejke naya kaam/processing karwana. GET = sirf existing data ko dekhna/retrieve karna, kuch bhejna nahi.

Hamare project mein use: /analyze-auto-text = POST (message bhejke process karwana). /traces/{trace_id} = GET (sirf existing trace data dekhna).

9. Bottleneck Identification (Real Insight)

Concept: Tracing data se pata chalta hai system ka kaunsa hissa sabse zyada time le raha hai — yeh optimization ke liye pehla zaroori kadam hai.

Hamare project mein mila insight: Verification Agent ne 40+ seconds liye (multiple sequential LLM calls ki wajah se), jabki Intake Agent instant tha. Yeh future optimization ka clear target batata hai.

One-Line Definitions (Quick Reference)
Observability: System ke andar kya ho raha hai, yeh bahar se dekh/samajh paana.
Trace: Ek poori request ka end-to-end record.
Span: Trace ke andar ek individual step (jaise ek agent ka run).
Trace ID: Ek request ke saare spans ko jodne wala unique code.
SQLite: Halka, file-based, built-in Python database.
traced_call(): Generic wrapper jo kisi bhi function ka time measure karke database mein log karta hai.
Function passing: Function ko bina call kiye, reference ke roop mein doosre function ko dena.
GET: Existing data retrieve karne ke liye HTTP method.
POST: Naya data bhejke processing karwane ke liye HTTP method.
Bottleneck: System ka wo hissa jo sabse zyada time/resource le raha ho.
VS Code Mein Jo Commands/Files Chalaye (Week 5)
bash
# Koi naya external package install nahi hua — sqlite3, time, uuid 
# sab Python ki built-in libraries hain

# Database initialize aur test kiya
python tracer.py

# Testing scripts run kiye
python test_tracer.py
python view_traces.py            # (baar baar use kiya database check karne ke liye)

# Server restart (naye /traces/{trace_id} endpoint ke liye)
python -m uvicorn main:app --reload

Files banayi/update ki Week 5 mein:

tracer.py (naya — init_db(), generate_trace_id(), log_span(), traced_call(), get_trace())
test_tracer.py (tracer standalone testing)
view_traces.py (database ke andar ka data manually check karne ke liye)
orchestrator.py (update — traced_call() se intake aur verify ko wrap kiya, trace_id response mein add kiya)
main.py (update — /traces/{trace_id} GET endpoint add kiya)
traces.db (naya — SQLite database file, automatically banti hai)