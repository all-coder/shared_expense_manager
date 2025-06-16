from fastapi import FastAPI
from database import engine
import models
from routes import user_router, group_router,expense_router,balance_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

app.include_router(user_router.router)
app.include_router(group_router.router)
app.include_router(expense_router.router)
app.include_router(balance_router.router)