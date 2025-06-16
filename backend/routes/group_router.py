from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from services.group_services import create_group, get_group_details,get_all_groups

router = APIRouter(prefix="/groups", tags=["Groups"])

class GroupCreateRequest(BaseModel):
    name: str
    user_ids: list[int]

class GroupUser(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class GroupResponse(BaseModel):
    id: int
    name: str
    users: list[GroupUser]
    total_expenses: float

    class Config:
        orm_mode = True

@router.post("/", response_model=GroupResponse)
def create_new_group(payload: GroupCreateRequest, db: Session = Depends(get_db)):
    return create_group(db, payload.name, payload.user_ids)

@router.get("/{group_id}", response_model=GroupResponse)
def read_group(group_id: int, db: Session = Depends(get_db)):
    return get_group_details(db, group_id)

@router.get("/", response_model=list[GroupResponse])
def read_all_groups(db: Session = Depends(get_db)):
    return get_all_groups(db)