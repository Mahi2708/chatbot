from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    file_ids: List[str] = []
