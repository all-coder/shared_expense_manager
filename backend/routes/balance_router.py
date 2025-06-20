from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.balance_services import calculate_group_balances, calculate_user_balances,calculate_all_user_totals

router = APIRouter(tags=["Balances"])

@router.get("/users/all/balances")
def get_all_user_balances(db: Session = Depends(get_db)):
    return calculate_all_user_totals(db)

@router.get("/groups/{group_id}/balances")
def get_group_balances(group_id: int, db: Session = Depends(get_db)):
    return calculate_group_balances(db, group_id)

@router.get("/users/{user_id}/balances")
def get_user_balances(user_id: int, db: Session = Depends(get_db)):
    return calculate_user_balances(db, user_id)
