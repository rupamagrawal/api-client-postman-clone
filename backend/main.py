import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure the backend directory is in the sys.path so imports work correctly when running uvicorn
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import init_db, async_session
from seed import seed_db

from routers.collections import router as collections_router
from routers.requests import router as requests_router
from routers.environments import router as environments_router
from routers.history import router as history_router
from routers.runner import router as runner_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown lifecycle events.
    Creates all database tables and seeds the database if it is empty.
    """
    # Initialize DB tables
    await init_db()
    
    # Seed DB with initial data
    async with async_session() as session:
        await seed_db(session)
        
    yield
    # Shutdown logic (none needed currently)

app = FastAPI(
    title="Postman Clone Backend",
    description="FastAPI Backend Proxy and DB Store for Postman Clone",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(collections_router)
app.include_router(requests_router)
app.include_router(environments_router)
app.include_router(history_router)
app.include_router(runner_router)


@app.get("/api/health", tags=["Health"])
async def health_check() -> dict:
    """
    Simple health check endpoint returning status.
    """
    return {"status": "ok"}
