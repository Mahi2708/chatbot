from pydantic import BaseModel

class AgentCreate(BaseModel):
    name: str
    system_prompt: str = "You are a helpful assistant."
    model_provider: str = "openai"
    model_name: str = "gpt-4o-mini"

class AgentOut(BaseModel):
    id: str
    name: str
    system_prompt: str
    model_provider: str
    model_name: str
