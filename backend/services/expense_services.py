from sqlalchemy.orm import Session
from models import Expense, Group, User, GroupMember, Split, SplitTypeEnum
from fastapi import HTTPException

def add_expense(
    session: Session,
    group_id: int,
    description: str,
    amount: float,
    paid_by: int,
    split_type: str,
    splits: list[dict]
) -> dict:
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    payer = session.get(User, paid_by)
    if not payer:
        raise HTTPException(status_code=404, detail="Payer not found")

    if split_type == "equal":
        members = [gm.user for gm in group.members]
        if not members:
            raise HTTPException(status_code=400, detail="No group members found")

        share = round(amount / len(members), 2)
        split_records = [
            Split(
                user_id=member.id,
                amount_owed=0.0 if member.id == paid_by else share,
                percentage=None
            ) for member in members
        ]

    elif split_type == "percentage":
        total_percentage = sum(s["percentage"] for s in splits)
        if total_percentage != 100:
            raise HTTPException(status_code=400, detail="Total percentage must be 100")

        split_records = []
        for s in splits:
            uid = s["user_id"]
            perc = s["percentage"]
            amt = 0.0 if uid == paid_by else round(amount * perc / 100, 2)
            split_records.append(
                Split(user_id=uid, percentage=perc, amount_owed=amt)
            )

    else:
        raise HTTPException(status_code=400, detail="Invalid split type")

    expense = Expense(
        group_id=group_id,
        description=description,
        amount=amount,
        paid_by=paid_by,
        split_type=SplitTypeEnum(split_type),
        splits=split_records
    )

    session.add(expense)
    session.commit()
    session.refresh(expense)

    return {
        "id": expense.id,
        "group_id": expense.group_id,
        "description": expense.description,
        "amount": expense.amount,
        "paid_by": expense.paid_by,
        "split_type": expense.split_type.value,
        "splits": [
            {
                "user_id": s.user_id,
                "amount_owed": s.amount_owed,
                "percentage": s.percentage
            } for s in expense.splits
        ]
    }

def get_expenses_for_group(session: Session, group_id: int) -> list[dict]:
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    return [
        {
            "id": e.id,
            "description": e.description,
            "amount": e.amount,
            "paid_by": e.paid_by,
            "split_type": e.split_type.value,
            "splits": [
                {
                    "user_id": s.user_id,
                    "amount_owed": s.amount_owed,
                    "percentage": s.percentage
                } for s in e.splits
            ]
        }
        for e in group.expenses
    ]