import uuid
from sqlalchemy import String, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Agent(Base):
    __tablename__ = "agents"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String, ForeignKey("projects.id"), index=True)
    name: Mapped[str] = mapped_column(String)
    system_prompt: Mapped[str] = mapped_column(String, default="You are a helpful assistant.")
    model_provider: Mapped[str] = mapped_column(String, default="openai")
    model_name: Mapped[str] = mapped_column(String, default="gpt-4o-mini")
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="agents")
    prompts = relationship("Prompt", back_populates="agent")
