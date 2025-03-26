from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.app.utils.database import get_db
from backend.app.models.user import User
from backend.app.utils.config import SECRET_KEY, ALGORITHM

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# For token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# ✅ Ensure SECRET_KEY and ALGORITHM are loaded correctly
SECRET_KEY = str(SECRET_KEY) or "default-secret-key"
ALGORITHM = ALGORITHM or "HS256"

# ✅ Hash a password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# ✅ Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ✅ Create new user
def create_user(db: Session, full_name: str, password: str, email: str):
    hashed_password = hash_password(password)  # Assuming a password hashing function exists
    new_user = User(full_name=full_name, email=email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ✅ Generate JWT token (Moved out of `authenticate_user`)
def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ✅ Authenticate user and generate token
def authenticate_user(email: str, password: str, db: Session) -> tuple[str | None, User | None]:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None, None

    token_data = {"sub": user.email}
    token = create_access_token(token_data)
    return token, user

# ✅ Get current user from token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user
