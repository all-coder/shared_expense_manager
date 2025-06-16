from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum

class SplitTypeEnum(str,enum.Enum):
    equal = "equal"
    percentage = "percentage"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    groups = relationship("GroupMember", back_populates="user")
    paid_expenses = relationship("Expense", back_populates="payer")
    splits = relationship("Split", back_populates="user")

class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    members = relationship("GroupMember", back_populates="group")
    expenses = relationship("Expense", back_populates="group")

class GroupMember(Base):
    __tablename__ = "group_members"

    group_id = Column(Integer, ForeignKey("groups.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)

    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="groups")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"))
    description = Column(String)
    amount = Column(Float)
    paid_by = Column(Integer, ForeignKey("users.id"))
    split_type = Column(Enum(SplitTypeEnum))

    group = relationship("Group", back_populates="expenses")
    payer = relationship("User", back_populates="paid_expenses")
    splits = relationship("Split", back_populates="expense")

class Split(Base):
    __tablename__ = "splits"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    percentage = Column(Float, nullable=True)
    amount_owed = Column(Float, nullable=False)

    expense = relationship("Expense", back_populates="splits")
    user = relationship("User", back_populates="splits")
