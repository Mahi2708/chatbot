from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.project import Project
from app.models.agent import Agent
from app.schemas.agent import AgentCreate, AgentOut

router = APIRouter(tags=["agents"])

@router.post("/projects/{project_id}/agents", response_model=AgentOut)
def create_agent(project_id: str, payload: AgentCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    a = Agent(
        project_id=project_id,
        name=payload.name,
        system_prompt=payload.system_prompt,
        model_provider=payload.model_provider,
        model_name=payload.model_name,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return a

@router.get("/projects/{project_id}/agents", response_model=list[AgentOut])
def list_agents(project_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return db.query(Agent).filter(Agent.project_id == project_id).all()
