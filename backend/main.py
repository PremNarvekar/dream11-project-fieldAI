import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import TacticalAdviceRequest, TacticalAdviceResponse
from gemini_service import generate_tactical_advice

load_dotenv()

app = FastAPI(
    title="FieldVision AI - Tactical Engine API",
    description="High-precision cricket spatial analytics and Gemini-powered tactical advisory service.",
    version="2.0.0",
)

# Configure CORS for frontend access (supporting dynamic origins or wildcard fallback)
allowed_origins_raw = os.environ.get("ALLOWED_ORIGINS", "*")
if allowed_origins_raw.strip() == "*":
    origins = ["*"]
else:
    origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "service": "FieldVision AI Tactical Backend",
        "status": "online",
        "geminiConfigured": bool(os.environ.get("GEMINI_API_KEY")),
        "version": "2.0.0",
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "geminiConfigured": bool(os.environ.get("GEMINI_API_KEY")),
    }

@app.post("/api/tactical-advice", response_model=TacticalAdviceResponse)
def get_tactical_advice(payload: TacticalAdviceRequest):
    try:
        advice = generate_tactical_advice(
            question=payload.question,
            telemetry=payload.telemetry,
        )
        return advice
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate tactical advice: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=False)
