import os
from dotenv import load_dotenv
from pathlib import Path

# Load the .env file from backend directory
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
DATABASE_URL = "sqlite:///./backend/app.db"

# Debugging - Print values to confirm they are loaded correctly
print(f"SECRET_KEY: {SECRET_KEY}")
print(f"ALGORITHM: {ALGORITHM}")
