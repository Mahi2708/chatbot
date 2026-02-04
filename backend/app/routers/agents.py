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
@router.put("/projects/{project_id}/agents/{agent_id}", response_model=AgentOut)
def update_agent(
    project_id: str,
    agent_id: str,
    payload: AgentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    agent = (
        db.query(Agent)
        .join(Project)
        .filter(
            Agent.id == agent_id,
            Agent.project_id == project_id,
            Project.user_id == user.id,
        )
        .first()
    )

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent.name = payload.name
    agent.system_prompt = payload.system_prompt
    agent.model_provider = payload.model_provider
    agent.model_name = payload.model_name

    db.commit()
    db.refresh(agent)
    return agent


@router.delete("/projects/{project_id}/agents/{agent_id}")
def delete_agent(
    project_id: str,
    agent_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    agent = (
        db.query(Agent)
        .join(Project)
        .filter(
            Agent.id == agent_id,
            Agent.project_id == project_id,
            Project.user_id == user.id,
        )
        .first()
    )

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    db.delete(agent)
    db.commit()
    return {"ok": True}

