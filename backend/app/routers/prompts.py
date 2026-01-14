from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.agent import Agent
from app.models.project import Project
from app.models.prompt import Prompt
from app.schemas.prompt import PromptCreate, PromptOut

router = APIRouter(tags=["prompts"])

def ensure_agent_access(db: Session, agent_id: str, user_id: str) -> Agent:
    agent = db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    project = db.get(Project, agent.project_id)
    if not project or project.user_id != user_id:
        raise HTTPException(status_code=403, detail="No access")
    return agent

@router.post("/agents/{agent_id}/prompts", response_model=PromptOut)
def create_prompt(agent_id: str, payload: PromptCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ensure_agent_access(db, agent_id, user.id)
    pr = Prompt(agent_id=agent_id, title=payload.title, content=payload.content, type=payload.type)
    db.add(pr)
    db.commit()
    db.refresh(pr)
    return pr

@router.get("/agents/{agent_id}/prompts", response_model=list[PromptOut])
def list_prompts(agent_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ensure_agent_access(db, agent_id, user.id)
    return db.query(Prompt).filter(Prompt.agent_id == agent_id).all()
