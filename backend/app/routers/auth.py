from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets

from app.core.deps import get_db, get_current_user
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.core.email import send_email


from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserUpdateSchema,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# =========================
# AUTH BASICS
# =========================

@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        name=payload.name,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"id": user.id, "email": user.email, "name": user.name}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


# =========================
# CURRENT USER
# =========================

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
    }


@router.put("/me")
def update_me(
    payload: UserUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.name = payload.name
    current_user.email = payload.email
    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
    }


# =========================
# FORGOT / RESET PASSWORD
# =========================

@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        return {"ok": True}

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=30)
    db.commit()

    reset_link = f"http://localhost:3000/reset-password?token={token}"

    await send_email(
        subject="Reset your password",
        recipients=[user.email],
        body=f"""
Hello {user.name},

You requested a password reset.

Click below to reset your password:
{reset_link}

This link expires in 30 minutes.
""",
    )

    return {"ok": True}



@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.reset_token == payload.token)
        .first()
    )

    if (
        not user
        or not user.reset_token_expires
        or user.reset_token_expires < datetime.utcnow()
    ):
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user.password_hash = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return {"ok": True}
