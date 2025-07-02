from sqlalchemy.orm import Session
from models import User
from fastapi import HTTPException

def create_user(session: Session, name: str) -> User:
    existing = session.query(User).filter_by(name=name).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(name=name)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def get_user_by_id(session: Session, user_id: int) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_all_users(session: Session):
    return session.query(User).all()


