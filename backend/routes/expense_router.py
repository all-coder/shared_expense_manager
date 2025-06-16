from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.expense_services import add_expense,get_expenses_for_group
from pydantic import BaseModel, Field
from typing import List, Optional
from models import SplitTypeEnum

router = APIRouter(prefix="/groups", tags=["Expenses"])


class SplitInput(BaseModel):
    user_id: int
    percentage: Optional[float] = None


class ExpenseCreateRequest(BaseModel):
    description: str
    amount: float
    paid_by: int
    split_type: SplitTypeEnum
    splits: Optional[List[SplitInput]] = None


@router.post("/{group_id}/expenses")
def add_new_expense(
    group_id: int, payload: ExpenseCreateRequest, db: Session = Depends(get_db)
):
    return add_expense(
        session=db,
        group_id=group_id,
        description=payload.description,
        amount=payload.amount,
        paid_by=payload.paid_by,
        split_type=payload.split_type,
        splits=[s.dict() for s in payload.splits] if payload.splits else [],
    )

@router.get("/{group_id}/expenses")
def read_group_expenses(group_id: int, db: Session = Depends(get_db)):
    return get_expenses_for_group(db, group_id)