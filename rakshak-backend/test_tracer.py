import time
from tracer import generate_trace_id, traced_call

def dummy_slow_function(x):
    time.sleep(1)
    return x * 2

trace_id = generate_trace_id()
print("Trace ID:", trace_id)

result = traced_call(trace_id, "dummy_agent", dummy_slow_function, 5)
print("Result:", result)