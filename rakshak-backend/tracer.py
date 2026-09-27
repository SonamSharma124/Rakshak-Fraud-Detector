import sqlite3
import time
import uuid


DB_PATH = "traces.db"


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

def init_db():
    conn = sqlite3.connect(DB_PATH)

    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS spans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trace_id TEXT NOT NULL,
            agent_name TEXT NOT NULL,
            input_summary TEXT,
            output_summary TEXT,
            duration_seconds REAL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


init_db()


# ============================================================
# TRACE ID
# ============================================================

def generate_trace_id():
    return str(uuid.uuid4())[:8]


# ============================================================
# LOG A SPAN
# ============================================================

def log_span(
    trace_id,
    agent_name,
    input_summary,
    output_summary,
    duration_seconds,
):
    conn = sqlite3.connect(DB_PATH)

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO spans (
            trace_id,
            agent_name,
            input_summary,
            output_summary,
            duration_seconds
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        trace_id,
        agent_name,
        str(input_summary)[:2000],
        str(output_summary)[:2000],
        round(duration_seconds, 4),
    ))

    conn.commit()
    conn.close()


# ============================================================
# TRACE A FUNCTION CALL
# ============================================================

def traced_call(
    trace_id,
    agent_name,
    func,
    *args,
    **kwargs,
):
    start_time = time.perf_counter()

    try:
        result = func(*args, **kwargs)

    except Exception as exc:
        duration = time.perf_counter() - start_time

        log_span(
            trace_id=trace_id,
            agent_name=agent_name,
            input_summary=args,
            output_summary={
                "error": str(exc),
            },
            duration_seconds=duration,
        )

        raise

    duration = time.perf_counter() - start_time

    log_span(
        trace_id=trace_id,
        agent_name=agent_name,
        input_summary=args,
        output_summary=result,
        duration_seconds=duration,
    )

    return result


# ============================================================
# GET TRACE
# ============================================================

def get_trace(trace_id):
    conn = sqlite3.connect(DB_PATH)

    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            agent_name,
            input_summary,
            output_summary,
            duration_seconds,
            timestamp
        FROM spans
        WHERE trace_id = ?
        ORDER BY id ASC
    """, (trace_id,))

    rows = cursor.fetchall()

    conn.close()

    spans = []

    for row in rows:
        spans.append({
            "agent_name": row[0],
            "input_summary": row[1],
            "output_summary": row[2],
            "duration_seconds": row[3],
            "timestamp": row[4],
        })

    # ========================================================
    # TOTAL DURATION
    # ========================================================
    #
    # IMPORTANT:
    #
    # verification_agent contains:
    #
    #     pattern_agent
    #     link_agent
    #     verdict combination
    #     explanation LLM
    #
    # Therefore we MUST NOT do:
    #
    # pattern + link + verification
    #
    # because that double-counts the time.
    #
    # The verification_agent span already represents the
    # complete verification operation.
    # ========================================================

    verification_span = next(
        (
            span
            for span in spans
            if span["agent_name"] == "verification_agent"
        ),
        None,
    )

    if verification_span is not None:
        total_duration = verification_span["duration_seconds"]

    else:
        total_duration = sum(
            span["duration_seconds"]
            for span in spans
        )

    # ========================================================
    # RETURN TRACE
    # ========================================================

    return {
        "trace_id": trace_id,
        "total_spans": len(spans),
        "total_duration_seconds": round(
            total_duration,
            3,
        ),
        "spans": spans,
    }