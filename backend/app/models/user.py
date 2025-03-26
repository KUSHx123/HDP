from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)  # Changed from username to full_name
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
