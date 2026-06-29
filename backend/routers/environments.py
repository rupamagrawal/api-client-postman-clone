from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Environment, EnvironmentVariable
from schemas import (
    EnvironmentCreate,
    EnvironmentUpdate,
    EnvironmentResponse,
    EnvironmentVariableCreate,
    EnvironmentVariableUpdate,
    EnvironmentVariableResponse,
)

router = APIRouter(prefix="/api", tags=["Environments"])

# ==========================================
# Environment CRUD
# ==========================================

@router.get("/environments", response_model=List[EnvironmentResponse])
async def get_environments(db: AsyncSession = Depends(get_db)) -> List[EnvironmentResponse]:
    """
    Fetches all environments, including their nested environment variables.
    """
    result = await db.execute(
        select(Environment).options(selectinload(Environment.variables))
    )
    environments = result.scalars().all()
    return list(environments)


@router.post("/environments", response_model=EnvironmentResponse, status_code=status.HTTP_201_CREATED)
async def create_environment(
    env_in: EnvironmentCreate, db: AsyncSession = Depends(get_db)
) -> EnvironmentResponse:
    """
    Creates a new environment.
    """
    db_env = Environment(name=env_in.name)
    db.add(db_env)
    await db.commit()
    await db.refresh(db_env)
    
    # Reload with variables (should be empty initially)
    result = await db.execute(
        select(Environment)
        .where(Environment.id == db_env.id)
        .options(selectinload(Environment.variables))
    )
    return result.scalar_one()


@router.put("/environments/{environment_id}", response_model=EnvironmentResponse)
async def update_environment(
    environment_id: str,
    env_in: EnvironmentUpdate,
    db: AsyncSession = Depends(get_db),
) -> EnvironmentResponse:
    """
    Renames an existing environment.
    """
    result = await db.execute(
        select(Environment)
        .where(Environment.id == environment_id)
        .options(selectinload(Environment.variables))
    )
    db_env = result.scalar_one_or_none()
    if not db_env:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Environment not found",
        )

    if env_in.name is not None:
        db_env.name = env_in.name

    await db.commit()
    await db.refresh(db_env)
    return db_env


@router.delete("/environments/{environment_id}", status_code=status.HTTP_200_OK)
async def delete_environment(
    environment_id: str, db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Deletes an environment. Its variables are cascade deleted.
    """
    result = await db.execute(
        select(Environment).where(Environment.id == environment_id)
    )
    db_env = result.scalar_one_or_none()
    if not db_env:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Environment not found",
        )

    await db.delete(db_env)
    await db.commit()
    return {"success": True, "message": "Environment deleted successfully"}


# ==========================================
# Environment Variable CRUD
# ==========================================

@router.post("/environments/{environment_id}/variables", response_model=EnvironmentVariableResponse, status_code=status.HTTP_201_CREATED)
async def create_environment_variable(
    environment_id: str,
    var_in: EnvironmentVariableCreate,
    db: AsyncSession = Depends(get_db),
) -> EnvironmentVariableResponse:
    """
    Adds a new environment variable to a specific environment.
    """
    # Verify environment exists
    result = await db.execute(
        select(Environment).where(Environment.id == environment_id)
    )
    env = result.scalar_one_or_none()
    if not env:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Environment not found",
        )

    db_var = EnvironmentVariable(
        environment_id=environment_id,
        key=var_in.key,
        value=var_in.value,
        enabled=var_in.enabled,
    )
    db.add(db_var)
    await db.commit()
    await db.refresh(db_var)
    return db_var


@router.put("/environments/{environment_id}/variables/{variable_id}", response_model=EnvironmentVariableResponse)
async def update_environment_variable(
    environment_id: str,
    variable_id: str,
    var_in: EnvironmentVariableUpdate,
    db: AsyncSession = Depends(get_db),
) -> EnvironmentVariableResponse:
    """
    Updates the key, value, and/or enabled state of an environment variable.
    """
    result = await db.execute(
        select(EnvironmentVariable).where(
            EnvironmentVariable.id == variable_id,
            EnvironmentVariable.environment_id == environment_id,
        )
    )
    db_var = result.scalar_one_or_none()
    if not db_var:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Environment variable not found inside the specified environment",
        )

    update_data = var_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_var, field, value)

    await db.commit()
    await db.refresh(db_var)
    return db_var


@router.delete("/environments/{environment_id}/variables/{variable_id}", status_code=status.HTTP_200_OK)
async def delete_environment_variable(
    environment_id: str,
    variable_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Deletes an environment variable from a specific environment.
    """
    result = await db.execute(
        select(EnvironmentVariable).where(
            EnvironmentVariable.id == variable_id,
            EnvironmentVariable.environment_id == environment_id,
        )
    )
    db_var = result.scalar_one_or_none()
    if not db_var:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Environment variable not found inside the specified environment",
        )

    await db.delete(db_var)
    await db.commit()
    return {"success": True, "message": "Environment variable deleted successfully"}
