from sqlalchemy.orm import Session
from models import Group, User, GroupMember, Expense
from fastapi import HTTPException

def create_group(session: Session, name: str, user_ids: list[int]) -> dict:
    group = Group(name=name)
    session.add(group)
    session.flush()

    # Add users to the group
    for uid in user_ids:
        user = session.get(User, uid)
        if not user:
            raise HTTPException(status_code=404, detail=f"User {uid} not found")
        session.add(GroupMember(user_id=uid, group_id=group.id))

    session.commit()
    session.refresh(group)

    users = [
        {"id": gm.user.id, "name": gm.user.name}
        for gm in group.members
    ]

    return {
        "id": group.id,
        "name": group.name,
        "users": users,
        "total_expenses": 0.0 
    }

def get_group_details(session: Session, group_id: int) -> dict:
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    users = [
        {"id": gm.user.id, "name": gm.user.name}
        for gm in group.members
    ]

    total_expense = sum(e.amount for e in group.expenses)

    return {
        "id": group.id,
        "name": group.name,
        "users": users,
        "total_expenses": total_expense
    }

def get_all_groups(session: Session) -> list[dict]:
    groups = session.query(Group).all()
    return [
        {
            "id": group.id,
            "name": group.name,
            "users": [{"id": gm.user.id, "name": gm.user.name} for gm in group.members],
            "total_expenses": sum(e.amount for e in group.expenses)
        }
        for group in groups
    ]