from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.agent import Agent
from app.models.project import Project
from app.models.prompt import Prompt
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.chat import ChatRequest
from app.services.llm import openai_response
import json

router = APIRouter(prefix="/chat", tags=["chat"])

def ensure_agent_access(db: Session, agent_id: str, user_id: str) -> Agent:
    agent = db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    project = db.get(Project, agent.project_id)
    if not project or project.user_id != user_id:
        raise HTTPException(status_code=403, detail="No access")
    return agent

@router.post("/agents/{agent_id}")
async def chat(agent_id: str, payload: ChatRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    agent = ensure_agent_access(db, agent_id, user.id)

    # conversation
    if payload.conversation_id:
        conv = db.get(Conversation, payload.conversation_id)
        if not conv or conv.user_id != user.id or conv.agent_id != agent.id:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = Conversation(agent_id=agent.id, user_id=user.id, title="New Chat")
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # store user message
    db.add(Message(conversation_id=conv.id, role="user", content=payload.message))
    db.commit()

    # load history (last 20)
    history = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id)
        .order_by(Message.created_at.asc())
        .limit(20)
        .all()
    )

    prompt_blocks = db.query(Prompt).filter(Prompt.agent_id == agent.id).all()

    # build system prompt
    system_prompt = agent.system_prompt + "\n\n"
    for p in prompt_blocks:
        system_prompt += f"[{p.type.upper()}] {p.title}\n{p.content}\n\n"

    # format messages
    msgs = [{"role": m.role, "content": m.content} for m in history]

    # minimal streaming via SSE style generator
    async def event_stream():
        # call LLM (non-stream for stability)
        answer = await openai_response(msgs, system_prompt, agent.model_name)

        # store assistant message
        db.add(Message(conversation_id=conv.id, role="assistant", content=answer))
        db.commit()

        # send to UI
        yield f"data: {json.dumps({'conversation_id': conv.id, 'text': answer})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
