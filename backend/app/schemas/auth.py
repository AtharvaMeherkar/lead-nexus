from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


