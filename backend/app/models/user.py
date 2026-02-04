import uuid
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from sqlalchemy import Column, String, DateTime
from datetime import datetime

reset_token = Column(String, nullable=True)
reset_token_expires = Column(DateTime, nullable=True)


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    password_hash: Mapped[str] = mapped_column(String)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    projects = relationship("Project", back_populates="user")
