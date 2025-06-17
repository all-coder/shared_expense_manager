from models import *
from typing import Callable, List,Optional,Any
from sqlalchemy.orm import Session
from database import get_db


def wrapped_get_all_entities(
    db_func: Callable[..., List[Any]], 
    serialize_func: Callable,
    user_id: Optional[int] = None,
    group_id: Optional[int] = None
) -> List[dict]:
    db = next(get_db())
    try:
        if user_id is not None:
            entities = db_func(db, user_id)
        elif group_id is not None:
            entities = db_func(db, group_id)
        else:
            entities = db_func(db)
        return [serialize_func(e) for e in entities]
    finally:
        db.close()



def serialize_user(user: User) -> dict:
    return {"id": user.id, "name": user.name}

# No Need of this, only user had to have been deserialized
def serialize_group(group: Group) -> dict:
    return {"id": group.id, "name": group.name}


def serialize_group_member(member: GroupMember) -> dict:
    return {"group_id": member.group_id, "user_id": member.user_id}


def serialize_expense(expense: Expense) -> dict:
    return {
        "id": expense.id,
        "group_id": expense.group_id,
        "description": expense.description,
        "amount": expense.amount,
        "paid_by": expense.paid_by,
        "split_type": expense.split_type,
    }


def serialize_split(split: Split) -> dict:
    return {
        "id": split.id,
        "expense_id": split.expense_id,
        "user_id": split.user_id,
        "percentage": split.percentage,
        "amount_owed": split.amount_owed,
    }
