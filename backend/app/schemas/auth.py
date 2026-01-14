from pydantic import BaseModel, EmailStr, field_validator

MAX_BCRYPT_LEN = 72

class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str):
        if len(v.encode("utf-8")) > MAX_BCRYPT_LEN:
            raise ValueError("Password must be <= 72 bytes (bcrypt limit).")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str):
        if len(v.encode("utf-8")) > MAX_BCRYPT_LEN:
            raise ValueError("Password must be <= 72 bytes (bcrypt limit).")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
