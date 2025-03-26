from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..auth.auth import authenticate_user, create_user, get_current_user
from backend.app.utils.database import get_db
from backend.app.models.user import User

router = APIRouter()

# Request models
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

# ✅ User Registration Route
@router.post("/register")
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = create_user(db, user.username, user.email, user.password)  # ✅ Fix order
    if not new_user:
        raise HTTPException(status_code=400, detail="Failed to create user")

    return {"msg": "User created successfully"}


# ✅ User Login Route (JSON Request)
@router.post("/login")
def login_for_access_token(user: UserLogin, db: Session = Depends(get_db)):
    token = authenticate_user(user.email, user.password, db)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"access_token": token, "token_type": "bearer"}

# ✅ Secure Route Example
@router.get("/users/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/login")
async def login():
    return {"message": "Login endpoint working"}

@router.get("/register")
async def register():
    return {"message": "Register endpoint working"}