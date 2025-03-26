from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    full_name: str  # ✅ Changed from 'username' to 'full_name'
    email: EmailStr
    password: str
