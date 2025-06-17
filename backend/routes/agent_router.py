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
    description="Fetches all users from the database",
)

get_groups_tool = FunctionTool.from_defaults(
    fn=lambda: get_all_groups(next(get_db())),
    name="get_all_groups",
    description="Fetches all the groups from the database",
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
    description="Fetches all expenses for a group using its ID (integer).",
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
    description="Calculates how much each user in a group owes or is owed, given the group ID.",
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
    description="Returns each user's total owed and due amount across all groups.",
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
    description="Given a user ID, shows who they owe and who owes them.",
)

llm = Gemini(model="models/gemini-1.5-flash", api_key=os.getenv("GOOGLE_API_KEY"))

agent_worker = FunctionCallingAgentWorker.from_tools(
    tools=[
        get_users_tool,
        get_groups_tool,
        get_expenses_group_tool,
        group_balances_tool,
        all_user_totals_tool,
        user_balances_tool,
    ],
    llm=llm,
    system_prompt=(
        "You are a helpful agent that answers queries about users, groups, expenses, and balances using the provided tools.\n\n"
        "Follow these general principles:\n"
        "1. Understand the user’s intent clearly.\n"
        "2. Break the query down into steps if needed.\n"
        "3. Choose the correct tools and invoke them in the right order.\n"
        "4. Match user-friendly names (like group or user names) to their internal IDs using fuzzy, case-insensitive matching.\n"
        "5. If names don’t match, suggest alternatives from the available data.\n"
        "6. If a follow-up query is made, recall relevant context and re-invoke tools if needed.\n"
        "7. Always explain your reasoning briefly before giving the answer.\n\n"
        "Use the following tools depending on the query type:\n\n"
        "- Get all users: Use `get_all_users` when you need to resolve user names to IDs or list users.\n"
        "- Get all groups: Use `get_all_groups` to find group names, resolve group IDs, or check group memberships.\n"
        "- Group expenses: Use `get_all_groups` to find the group ID, then `get_expenses_per_group` with the ID.\n"
        "- Group balances: Use `get_all_groups` to get the ID, then call `calculate_group_balances`.\n"
        "- Total balances for all users: Use `calculate_all_user_totals`.\n"
        "- Individual user balance: Use `get_all_users` to find the ID, then use `calculate_user_balances`.\n"
        "- Find which group a user belongs to: Use `get_all_groups` and check inside each group’s data for a match with the user (using `get_all_users` if needed).\n\n"
        "Examples:\n"
        "- 'Show me expenses for the group called Alpha' → Call `get_all_groups`, find 'Alpha', then call `get_expenses_per_group(group_id)`.\n"
        "- 'How much does Alice owe?' → Call `get_all_users`, find 'Alice', then call `calculate_user_balances(user_id)`.\n"
        "- 'List everyone’s totals' → Use `calculate_all_user_totals` directly.\n"
        "- 'What groups is Creme in?' → Use `get_all_groups`, check membership lists for a match with user name 'Creme' (resolve via `get_all_users` if needed).\n\n"
        "When in doubt, fetch supporting data (users or groups) and try to match based on content. If something is unclear or missing, either clarify with the user or provide best-effort results."
    ),
    verbose=True,
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
