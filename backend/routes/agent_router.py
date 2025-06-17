import os
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from llama_index.llms.gemini import Gemini
from llama_index.core.agent import AgentRunner
from llama_index.core.agent import FunctionCallingAgentWorker
from llama_index.core.tools import FunctionTool

from services.user_services import get_all_users
from services.group_services import get_all_groups
from services.expense_services import get_expenses_for_group
from services.balance_services import (
    calculate_group_balances,
    calculate_all_user_totals,
    calculate_user_balances,
)
from database import get_db
from utils import serialize_user
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class AgentQuery(BaseModel):
    query: str

def get_all_users_tool_func() -> list[dict]:
    db = next(get_db())
    try:
        users = get_all_users(db)
        return [serialize_user(u) for u in users]
    finally:
        db.close()

get_users_tool = FunctionTool.from_defaults(
    fn=get_all_users_tool_func,
    name="get_all_users",
    description="Fetches all users from the database"
)

get_groups_tool = FunctionTool.from_defaults(
    fn=lambda: get_all_groups(next(get_db())),
    name="get_all_groups",
    description="Fetches all the groups from the database"
)

def get_expenses_group_tool_func(group_id: int) -> list[dict]:
    db = next(get_db())
    try:
        return get_expenses_for_group(db, group_id)
    finally:
        db.close()

get_expenses_group_tool = FunctionTool.from_defaults(
    fn=get_expenses_group_tool_func,
    name="get_expenses_per_group",
    description="Fetches all expenses for a group using its ID (integer)."
)

def group_balances_tool_func(group_id: int) -> list[dict]:
    db = next(get_db())
    try:
        return calculate_group_balances(db, group_id)
    finally:
        db.close()

group_balances_tool = FunctionTool.from_defaults(
    fn=group_balances_tool_func,
    name="calculate_group_balances",
    description="Calculates how much each user in a group owes or is owed, given the group ID."
)

def all_user_totals_tool_func() -> list[dict]:
    db = next(get_db())
    try:
        return calculate_all_user_totals(db)
    finally:
        db.close()

all_user_totals_tool = FunctionTool.from_defaults(
    fn=all_user_totals_tool_func,
    name="calculate_all_user_totals",
    description="Returns each user's total owed and due amount across all groups."
)

def user_balances_tool_func(user_id: int) -> dict:
    db = next(get_db())
    try:
        return calculate_user_balances(db, user_id)
    finally:
        db.close()

user_balances_tool = FunctionTool.from_defaults(
    fn=user_balances_tool_func,
    name="calculate_user_balances",
    description="Given a user ID, shows who they owe and who owes them."
)

llm = Gemini(
    model="models/gemini-1.5-flash",
    api_key=os.getenv("GOOGLE_API_KEY")
)

agent_worker = FunctionCallingAgentWorker.from_tools(
    tools=[
        get_users_tool,
        get_groups_tool,
        get_expenses_group_tool,
        group_balances_tool,
        all_user_totals_tool,
        user_balances_tool
    ],
    llm=llm,
    system_prompt=(
        "You are a helpful agent that answers queries about users, groups, expenses, and balances using the provided tools.\n\n"
        "Think step-by-step before answering any question. First understand the query, then decide which tools are needed, and invoke them in the correct order.\n"
        "Use the following approach:\n"
        "1. Understand what the user is asking.\n"
        "2. If needed, fetch related information (e.g., get all users or groups).\n"
        "3. Match names to IDs if only names are given.\n"
        "4. Call the relevant tool with the correct parameters.\n"
        "5. Aggregate the results if needed and answer clearly.\n\n"
        "Examples:\n"
        "- If someone asks for a group's expenses using a group name, first call `get_all_groups`, find the group ID by matching the name (case-insensitive), then call `get_expenses_per_group` with that ID.\n"
        "- If someone asks how much each person owes or is owed within a group, use `calculate_group_balances` with the group ID (get it using `get_all_groups` if needed).\n"
        "- If the user asks for a summary of what each person owes/should receive across the system, use `calculate_all_user_totals`.\n"
        "- If a user wants their personal balance (who they owe or who owes them), use `calculate_user_balances` with their user ID (find it using `get_all_users`).\n\n"
        "Always explain your reasoning briefly before giving the answer."
    ),
    verbose=True
)

agent = AgentRunner(agent_worker)

@router.post("/agent/query")
async def run_agent_endpoint(query: AgentQuery):
    try:
        response = await agent.achat(query.query)
        return {"response": str(response)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

@router.get("/agent/test-group")
def test_groups(db: Session = Depends(get_db)):
    return get_all_groups(db)
