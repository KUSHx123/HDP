from fastapi import FastAPI, Depends, HTTPException, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import uuid
import joblib
import pandas as pd
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt

# Import user routes, authentication, and database utilities
from .routes import user_routes
from .routes.user_routes import router as user_router
from .auth.auth import get_current_user, create_user, authenticate_user, create_access_token
from .utils.database import get_db
from .utils.config import SECRET_KEY, ALGORITHM, DATABASE_URL
from .models.schemas import UserCreate
from .models.user import User

# Initialize FastAPI app
app = FastAPI()

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Allow frontend communication (CORS)
origins = [
    "http://localhost:5173",  # Frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],  # ✅ Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # ✅ Allow all headers
)

# ✅ Load the trained model
model_path = os.path.join(os.path.dirname(__file__), "Heart Disease Prediction Model(LR)_model.pkl")
model = joblib.load(model_path)

# ✅ Define input schema
class PredictionInput(BaseModel):
    age: int
    sex: int
    cp: int
    trestbps: int
    chol: int
    fbs: int
    restecg: int
    thalach: int
    exang: int
    oldpeak: float
    slope: int
    ca: int
    thal: int

# ✅ Prediction Endpoint
@app.post("/predict")
def predict_heart_disease(data: PredictionInput):
    try:
        input_data = pd.DataFrame([[data.age, data.sex, data.cp, data.trestbps, data.chol, 
                                    data.fbs, data.restecg, data.thalach, data.exang, 
                                    data.oldpeak, data.slope, data.ca, data.thal]], 
                                  columns=model.feature_names_in_)

        prediction = model.predict(input_data)
        result = "The person has Heart Disease" if prediction[0] == 1 else "The person does not have Heart Disease"

        return {"prediction": int(prediction[0]), "message": result}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Include user-related routes
app.include_router(user_router, prefix="/user")
app.include_router(user_routes.router)

# ✅ Serve static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# ✅ Handle favicon request
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse(os.path.join(static_dir, "favicon.ico"))

# ✅ Root Endpoint
@app.get("/")
def root():
    return {"message": "API is working!"}

# ✅ API Config Info
@app.get("/config")
def read_root():
    return {
        "secret_key": SECRET_KEY,
        "algorithm": ALGORITHM,
        "database_url": DATABASE_URL
    }

# ✅ Signup Endpoint (Fixed `full_name` issue)
@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    print("Received Signup Data:", user.dict())  # ✅ Debugging Line

    new_user = create_user(db, user.full_name, user.password, user.email)  # ✅ Changed from `username` to `full_name`
    if not new_user:
        raise HTTPException(status_code=400, detail="User already exists")

    token = create_access_token({"sub": new_user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "fullName": new_user.full_name,
            "user_metadata": new_user.user_metadata if hasattr(new_user, 'user_metadata') else {}
        }
    }

# ✅ Login Endpoint (Fixed Token Issue)
class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    token, user = authenticate_user(request.email, request.password, db)  # ✅ Now returns (token, user)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "access_token": token,  
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.username,
            "user_metadata": user.user_metadata if hasattr(user, 'user_metadata') else {}
        }
    }

# ✅ Profile Update Endpoint
@app.put("/profile")
async def update_profile(
    full_name: str = Form(...),
    avatar: UploadFile = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.username = full_name
    
    if avatar:
        unique_filename = f"{uuid.uuid4()}_{avatar.filename}"
        avatar_path = f"static/avatars/{unique_filename}"
        os.makedirs(os.path.dirname(avatar_path), exist_ok=True)
        
        try:
            with open(avatar_path, "wb") as buffer:
                buffer.write(await avatar.read())
            current_user.avatar_url = f"/{avatar_path}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload avatar: {str(e)}")
    
    db.commit()
    db.refresh(current_user)

    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "fullName": current_user.username,
            "avatarUrl": current_user.avatar_url
        }
    }

@app.options("/{full_path:path}")
async def preflight(full_path: str):
    """Handle CORS preflight requests for all routes."""
    response = JSONResponse(content={"message": "Preflight request successful"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    return response
