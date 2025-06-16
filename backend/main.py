from fastapi import FastAPI
from database import engine
import models
from routes import user_router, group_router,expense_router,balance_router

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

app.include_router(user_router.router)
app.include_router(group_router.router)
app.include_router(expense_router.router)
app.include_router(balance_router.router)