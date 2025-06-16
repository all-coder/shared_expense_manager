from sqlalchemy.orm import Session
from models import Group, User, Expense, Split
from fastapi import HTTPException
from collections import defaultdict


def calculate_group_balances(session: Session, group_id: int) -> list[dict]:
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    balances = defaultdict(lambda: defaultdict(float))

    for expense in group.expenses:
        payer_id = expense.paid_by
        for split in expense.splits:
            if split.user_id != payer_id:
                balances[split.user_id][payer_id] += split.amount_owed

    results = []
    for debtor, creditors in balances.items():
        for creditor, amount in creditors.items():
            if amount > 0:
                results.append(
                    {
                        "from_user": debtor,
                        "to_user": creditor,
                        "amount": round(amount, 2),
                    }
                )
    return results


def calculate_all_user_totals(session: Session) -> list[dict]:
    expenses = session.query(Expense).all()
    balances = defaultdict(lambda: defaultdict(float))

    for expense in expenses:
        payer_id = expense.paid_by
        for split in expense.splits:
            if split.user_id != payer_id:
                balances[split.user_id][payer_id] += split.amount_owed

    totals = defaultdict(lambda: {"total_owed": 0.0, "total_due": 0.0})

    for debtor, creditors in balances.items():
        for creditor, amount in creditors.items():
            if amount > 0:
                totals[debtor]["total_owed"] += amount
                totals[creditor]["total_due"] += amount

    results = []
    for user_id, total in totals.items():
        results.append(
            {
                "user_id": user_id,
                "total_owed": round(total["total_owed"], 2),
                "total_due": round(total["total_due"], 2),
            }
        )

    return results


def calculate_user_balances(session: Session, user_id: int) -> dict:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    expenses = session.query(Expense).all()
    balances = defaultdict(lambda: defaultdict(float))

    for expense in expenses:
        payer_id = expense.paid_by
        for split in expense.splits:
            if split.user_id != payer_id:
                balances[split.user_id][payer_id] += split.amount_owed

    owed = []
    due = []

    for debtor, creditors in balances.items():
        for creditor, amount in creditors.items():
            if debtor == user_id and amount > 0:
                owed.append({"to_user": creditor, "amount": round(amount, 2)})
            elif creditor == user_id and amount > 0:
                due.append({"from_user": debtor, "amount": round(amount, 2)})

    return {"user_id": user_id, "owed": owed, "due": due}
