from pydantic import BaseModel

class PromptCreate(BaseModel):
    title: str
    content: str
    type: str = "instruction"

class PromptOut(BaseModel):
    id: str
    title: str
    content: str
    type: str
