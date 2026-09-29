from agents.intake_agent import intake
from agents.verification_agent import verify
from tracer import generate_trace_id, traced_call


def process(input_data, is_file_path=False):
    trace_id = generate_trace_id()

    # ============================================================
    # 1. INTAKE AGENT
    # ============================================================

    intake_result = traced_call(
        trace_id,
        "intake_agent",
        intake,
        input_data,
        is_file_path=is_file_path
    )

    extracted_text = intake_result["extracted_text"]

    # ============================================================
    # 2. VERIFICATION AGENT
    # ============================================================

    verification_result = traced_call(
        trace_id,
        "verification_agent",
        verify,
        extracted_text
    )

    # ============================================================
    # 3. RETURN COMPLETE RESULT TO FRONTEND
    # ============================================================

    return {
        "trace_id": trace_id,

        "input_type": intake_result["input_type"],
        "extracted_text": extracted_text,

        "final_verdict": verification_result["final_verdict"],
        "confidence": verification_result["confidence"],
        "risk_score": verification_result["risk_score"],
        "contradiction_detected": verification_result[
            "contradiction_detected"
        ],
        "explanation": verification_result["explanation"],

        # ========================================================
        # ANALYSIS DETAILS
        # ========================================================

        "details": {
            "pattern_analysis": verification_result[
                "pattern_analysis"
            ],
            "link_analysis": verification_result[
                "link_analysis"
            ]
        },

        # ========================================================
        # SYSTEM / ENGINEERING INFORMATION
        # ========================================================

        "system_info": {
            "pattern_model_used": verification_result[
                "pattern_analysis"
            ].get("pattern_model_used"),

            "explanation_model_used": verification_result.get(
                "explanation_model_used"
            ),

            "explanation_tokens": verification_result.get(
                "explanation_tokens"
            ),

            "explanation_estimated_cost": verification_result.get(
                "explanation_estimated_cost"
            ),

            "groundedness_score": verification_result[
                "pattern_analysis"
            ].get("groundedness_score")
        },

        # ========================================================
        # TIMING INFORMATION
        # ========================================================

        "timing": verification_result.get(
            "timing",
            {}
        )
    }