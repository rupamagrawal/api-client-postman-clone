import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./apiclient.db")

# Create the async engine
engine = create_async_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)

# Async session maker
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for SQLAlchemy models
class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency injection to get the async database session."""
    async with async_session() as session:
        yield session

async def init_db() -> None:
    """Initializes the database and creates tables if they don't exist."""
    # Import models here to register them with metadata
    from models import Collection, Request, Environment, EnvironmentVariable, History
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
