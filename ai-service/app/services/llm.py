import json
import asyncio
from typing import Any, Dict, List
from google import genai
from google.genai import types  #type:ignore # Recommended for safe configuration typing
from ..config import GEMINI_API_KEY, GEMINI_MODEL

SYSTEM = """You are the AI coach for CodePulse.
Use only the supplied user analytics/context. Do not invent ratings, problem names, contests, or activity.
Be practical, concise, and specific. Never claim certainty beyond the data.
You have access to the user's Codeforces data including current rating, max rating, solved problems, topics, and contest history.
Provide personalized, specific advice based on this data."""

DAILY_SYSTEM = SYSTEM + """
For daily practice, select only problems from the supplied candidates. Never create a problem, URL, rating, or tag that is not supplied.
Return JSON with: summary (string), goals (array of strings), and sessions (array of objects with problemId, title, reason, timeMinutes, approach).
"""

RECOMMENDATION_SYSTEM = SYSTEM + """
For recommendations, rank only supplied candidate problems. Never invent a problem or alter its id, title, URL, rating, or tags.
Return JSON with: summary (string), recommendations (array of objects with problemId, reason, priority, skill, estimatedMinutes).
"""

ROADMAP_SYSTEM = SYSTEM + """
Create a rating-based DSA roadmap from the supplied analytics. Do not invent user statistics. Return JSON with: currentRating, targetRating, summary, and phases (array of objects with title, ratingRange, topics, objectives, weeklyHours).
"""

def _fallback_insights(context: Dict[str, Any]) -> Dict[str, Any]:
    topics = context.get("topics") or []
    weak = sorted([t for t in topics if t.get("strengthScore") is not None], key=lambda x: x.get("strengthScore", 101))[:3]
    strong = sorted([t for t in topics if t.get("strengthScore") is not None], key=lambda x: x.get("strengthScore", -1), reverse=True)[:3]
    weak_names = [x["topic"] for x in weak]
    strong_names = [x["topic"] for x in strong]
    return {
        "summary": f"Your current profile shows the clearest improvement opportunity in {', '.join(weak_names) if weak_names else 'the topics with the least recent success'}.",
        "strengths": strong_names,
        "weaknesses": weak_names,
        "recommendations": [
            {"title": f"Focus on {name}", "detail": "Practice mid-to-higher difficulty problems in this topic and review failed transitions or implementation mistakes."}
            for name in weak_names[:3]
        ]
    }

async def _gemini_generate(contents: str, json_mode: bool = False) -> str:
    # Initialize client inside or globally
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    # Configure via types mapping to avoid runtime payload typing bugs
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM,
        temperature=0.7,
        response_mime_type="application/json" if json_mode else "text/plain"
    )
    
    # CORRECT ASYNC CALL PATTERN
    for attempt in range(3):
        try:
            response = await client.aio.models.generate_content(
                model=GEMINI_MODEL,
                contents=contents,
                config=config,
            )
            return response.text or ""
        except Exception:
            if attempt == 2:
                raise
            await asyncio.sleep(2 ** attempt)

async def generate_insights(context: Dict[str, Any]) -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    try:
        result = await _gemini_generate(
            f"Return valid JSON with keys: summary, strengths, weaknesses, recommendations.\nUser analytics:\n{json.dumps(context)}",
            json_mode=True,
        )
        # Helper string strip to avoid wrapper block errors
        clean_result = result.strip().strip("`").replace("json\n", "", 1)
        return json.loads(clean_result)
    except Exception as e:
        raise RuntimeError(f"Gemini insights generation failed: {e}") from e

def _fallback_chat(message: str, context: Dict[str, Any], focus: str) -> str:
    topics = [topic for topic in context.get("topics") or [] if topic.get("topic")]
    weakest = min(topics, key=lambda topic: topic.get("strengthScore", 101), default=None)
    strongest = max(topics, key=lambda topic: topic.get("strengthScore", -1), default=None)
    overview = context.get("overview") or {}
    rating = overview.get("currentRating") or overview.get("rating")
    question = message.lower()

    if any(word in question for word in ("contest", "competition", "latest")):
        contests = context.get("recentContests") or []
        if contests:
            latest = contests[0]
            return (f"Your latest contest was {latest.get('name', 'the most recent contest')}. "
                    f"Redo the problems you could not finish, then focus on "
                    f"{weakest.get('topic') if weakest else 'your lowest-scoring topic'}.")
        return "I do not have a recent contest in your synchronized data yet. Enter a contest and sync again so I can analyze it."

    if any(word in question for word in ("plan", "week", "schedule", "roadmap")):
        focus_topic = weakest.get("topic") if weakest else "your weakest topic"
        return (f"For a 7-day plan, use {focus_topic} as the anchor: review fundamentals on days 1-2, "
                f"solve three problems near your rating on days 3-5, and re-solve failed attempts on days 6-7. "
                f"Keep the plan aligned with your {focus} coaching focus.")

    if any(word in question for word in ("today", "practice", "solve", "problem")):
        focus_topic = weakest.get("topic") if weakest else "your lowest-scoring topic"
        rating_text = f" around rating {rating}" if rating else " at your current difficulty"
        return (f"Today, solve 2-3 {focus_topic} problems{rating_text}. Spend 25-35 minutes on each, "
                "record the failed idea before reading an editorial, and re-solve the hardest miss tomorrow.")

    if any(word in question for word in ("weak", "improve", "next", "struggle")) and weakest:
        return (f"Your clearest improvement area is {weakest.get('topic')} with a strength score of "
                f"{weakest.get('strengthScore')}/100. Compare accepted and failed attempts there, "
                "then practice problems one level above the easiest ones you can already solve.")

    if strongest:
        return (f"Your strongest tracked area is {strongest.get('topic')} ({strongest.get('strengthScore')}/100). "
                f"Use it as a warm-up, then spend most of your next session on "
                f"{weakest.get('topic') if weakest else 'a less familiar topic'}.")
    return "I need synchronized Codeforces data before I can give personalized coaching."

async def chat(message: str, history: List[Dict[str, str]], context: Dict[str, Any], focus: str) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    try:
        history_text = "\n".join(
            f"{entry.get('role', 'user')}: {entry.get('content', '')}"
            for entry in history[-10:]
        )
        return await _gemini_generate(
            f"Coaching focus: {focus}\nConversation history:\n{history_text}\n\n"
            f"Analytics:\n{json.dumps(context)}\n\nQuestion: {message}"
        )
    except Exception as e:
        raise RuntimeError(f"Gemini chat generation failed: {e}") from e

async def weekly_report(context: Dict[str, Any]) -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    try:
        result = await _gemini_generate(
            f"Return JSON with keys: summary, highlights, focus, nextWeekPlan.\n"
            f"Generate a weekly coaching report based on this Codeforces analytics data:\n{json.dumps(context)}",
            json_mode=True,
        )
        clean_result = result.strip().strip("`").replace("json\n", "", 1)
        return json.loads(clean_result)
    except Exception as e:
        raise RuntimeError(f"Gemini weekly report generation failed: {e}") from e

async def _gemini_json(system: str, prompt: str) -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    config = types.GenerateContentConfig(
        system_instruction=system,
        temperature=0.5,
        response_mime_type="application/json"
    )
    
    for attempt in range(3):
        try:
            response = await client.aio.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=config,
            )
            clean_text = (response.text or "{}").strip().strip("`").replace("json\n", "", 1)
            return json.loads(clean_text)
        except Exception:
            if attempt == 2:
                raise
            await asyncio.sleep(2 ** attempt)

# Completed implementation of your truncated method
async def generate_daily_practice(context: Dict[str, Any], candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
    prompt = f"User Analytics:\n{json.dumps(context)}\n\nCandidate Problems:\n{json.dumps(candidates)}"
    try:
        return await _gemini_json(system=DAILY_SYSTEM, prompt=prompt)
    except Exception as e:
        raise RuntimeError(f"Daily practice generation failed: {e}") from e

async def generate_recommendations(context: Dict[str, Any], candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
    prompt = f"User Analytics:\n{json.dumps(context)}\n\nCandidate Problems:\n{json.dumps(candidates)}"
    try:
        return await _gemini_json(system=RECOMMENDATION_SYSTEM, prompt=prompt)
    except Exception as e:
        raise RuntimeError(f"Recommendation generation failed: {e}") from e

async def generate_roadmap(context: Dict[str, Any], days: int = 30) -> Dict[str, Any]:
    prompt = f"Roadmap duration: {days} days\n\nComplete User Analytics:\n{json.dumps(context)}"
    try:
        return await _gemini_json(system=ROADMAP_SYSTEM, prompt=prompt)
    except Exception as e:
        raise RuntimeError(f"Roadmap generation failed: {e}") from e
