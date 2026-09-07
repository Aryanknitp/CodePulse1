from fastapi import FastAPI, Header, HTTPException
from .config import AI_SERVICE_TOKEN, PORT
from .schemas.models import ContextPayload, ChatPayload, AIContextPayload
from .services.llm import generate_insights, chat, weekly_report, generate_daily_practice, generate_recommendations, generate_roadmap

app = FastAPI(title="CodePulse AI Service")

def provider_error(error: Exception) -> HTTPException:
    print(f"Gemini error: {error}")
    return HTTPException(status_code=502, detail="Gemini AI provider request failed")

def auth(authorization: str | None):
    if not AI_SERVICE_TOKEN:
        raise HTTPException(status_code=503, detail="AI service token is not configured")
    if authorization != f"Bearer {AI_SERVICE_TOKEN}":
        raise HTTPException(status_code=401, detail="Unauthorized AI service request")

@app.get("/health")
def health():
    return {"status": "ok", "service": "codeforces-insights-ai"}

@app.get("/ready")
def ready():
    if not AI_SERVICE_TOKEN:
        raise HTTPException(status_code=503, detail="AI service token is not configured")
    return {"status": "ready", "service": "codeforces-insights-ai"}

@app.post("/insights")
async def insights(payload: ContextPayload, authorization: str | None = Header(default=None)):
    auth(authorization)
    try:
        return await generate_insights(payload.context)
    except Exception as error:
        raise provider_error(error) from error

@app.post("/chat")
async def chat_route(payload: ChatPayload, authorization: str | None = Header(default=None)):
    auth(authorization)
    try:
        return {"response": await chat(payload.message, payload.history, payload.context, payload.focus)}
    except Exception as error:
        raise provider_error(error) from error

@app.post("/weekly-report")
async def report(payload: ContextPayload, authorization: str | None = Header(default=None)):
    auth(authorization)
    try:
        return await weekly_report(payload.context)
    except Exception as error:
        raise provider_error(error) from error

@app.post("/daily-practice")
async def daily_practice(payload: AIContextPayload, authorization: str | None = Header(default=None)):
    auth(authorization)
    try:
        return await generate_daily_practice(payload.context, payload.candidates)
    except Exception as error:
        raise provider_error(error) from error

@app.post("/recommendations")
async def recommendations(payload: AIContextPayload, authorization: str | None = Header(default=None)):
    auth(authorization)
    try:
        return await generate_recommendations(payload.context, payload.candidates)
    except Exception as error:
        raise provider_error(error) from error

@app.post("/roadmap")
async def roadmap(payload: AIContextPayload, authorization: str | None = Header(default=None)):
    auth(authorization)
    try:
        return await generate_roadmap(payload.context, payload.days)
    except Exception as error:
        raise provider_error(error) from error

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=PORT)
