from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from logic import check_scam, check_scam_from_image, check_scam_from_audio
from orchestrator import process
from tracer import get_trace
import shutil
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageRequest(BaseModel):
    message: str


# ===== PURANE ENDPOINTS (Week 1-4a) =====
@app.post("/analyze")
def analyze_message(request: MessageRequest):
    return check_scam(request.message)


@app.post("/analyze-screenshot")
def analyze_screenshot(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    result = check_scam_from_image(temp_path)
    return result

@app.post("/analyze-voice")
def analyze_voice(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    result = check_scam_from_audio(temp_path)
    return result


# ===== NAYE ENDPOINTS (Week 4b - Multi-Agent) =====
class TextRequest(BaseModel):
    message: str

@app.post("/analyze-auto-text")
def analyze_auto_text(request: TextRequest):
    return process(request.message, is_file_path=False)

@app.post("/analyze-auto")
def analyze_auto(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return process(temp_path, is_file_path=True)


@app.get("/traces/{trace_id}")
def view_trace(trace_id: str):
    return get_trace(trace_id)