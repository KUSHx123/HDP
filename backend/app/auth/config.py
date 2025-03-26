from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Secret key for encoding/decoding JWT tokens
SECRET_KEY = os.getenv("SECRET_KEY", "your-default-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))