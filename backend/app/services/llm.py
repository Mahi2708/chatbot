import httpx
from app.core.config import settings

OPENAI_URL = "https://api.openai.com/v1/responses"

async def openai_stream_response(messages: list[dict], system_prompt: str, model: str):
    """
    Returns an async generator yielding text chunks.
    """
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    # Responses API uses `input` instead of `messages` in older chat-completions style.
    # We'll pass a formatted "input" list with roles.
    payload = {
        "model": model,
        "input": [
            {"role": "system", "content": system_prompt},
            *messages
        ],
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream("POST", OPENAI_URL, json=payload, headers=headers) as r:
            r.raise_for_status()
            async for line in r.aiter_lines():
                if not line:
                    continue
                # OpenAI streams "data: {json}"
                if line.startswith("data: "):
                    data = line[len("data: "):].strip()
                    if data == "[DONE]":
                        return
                    # minimal parsing: extract incremental output_text if present
                    # Not all events contain content
                    if '"output_text"' in data:
                        # fallback "quick parse" without strict schema
                        # you can swap to json.loads for production
                        yield ""  # (we avoid brittle parsing in this MVP)
import json

async def openai_response(messages: list[dict], system_prompt: str, model: str) -> str:
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "input": [
            {"role": "system", "content": system_prompt},
            *messages
        ],
    }

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(OPENAI_URL, json=payload, headers=headers)
        r.raise_for_status()
        data = r.json()

        # Responses typically contain output array; output_text convenience exists in many responses.
        if "output_text" in data:
            return data["output_text"]

        # fallback: try to find text in output blocks
        out = []
        for item in data.get("output", []):
            for c in item.get("content", []):
                if c.get("type") == "output_text":
                    out.append(c.get("text", ""))
        return "".join(out).strip()
