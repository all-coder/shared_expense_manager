from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from services.user_services import create_user, get_all_users,get_user_by_id

router = APIRouter(prefix="/users", tags=["Users"])

# Request schema
class UserCreateRequest(BaseModel):
    name: str

# Response schema
class UserResponse(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

@router.post("/", response_model=UserResponse)
def create_new_user(payload: UserCreateRequest, db: Session = Depends(get_db)):
    return create_user(db, payload.name)

@router.get("/", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return get_all_users(db)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return get_user_by_id(db, user_id)
