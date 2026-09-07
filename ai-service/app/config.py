import os
from dotenv import load_dotenv
load_dotenv()

PORT = int(os.getenv("PORT", "8000"))
AI_SERVICE_TOKEN = os.getenv("AI_SERVICE_TOKEN", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
