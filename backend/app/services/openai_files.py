import os
import httpx
from fastapi import UploadFile

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

async def upload_file_to_openai(file: UploadFile):
    """
    Uploads the file to OpenAI Files API.
    Returns JSON including OpenAI file id.
    """
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set")

    url = "https://api.openai.com/v1/files"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}

    # OpenAI expects multipart form:
    # file=<binary> purpose=<string>
    form_data = {
        "purpose": (None, "assistants"),
    }

    contents = await file.read()

    files = {
        "file": (file.filename, contents, file.content_type or "application/octet-stream")
    }

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, headers=headers, data=form_data, files=files)
        r.raise_for_status()
        return r.json()
