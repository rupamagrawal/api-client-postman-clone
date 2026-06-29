from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import History
from schemas import HistoryResponse

router = APIRouter(prefix="/api/history", tags=["Request History"])

@router.get("", response_model=List[HistoryResponse])
async def get_history(db: AsyncSession = Depends(get_db)) -> List[HistoryResponse]:
    """
    Fetches the last 100 history items, sorted with the newest entries first.
    """
    result = await db.execute(
        select(History)
        .order_by(History.executed_at.desc())
        .limit(100)
    )
    history_entries = result.scalars().all()
    return list(history_entries)


@router.delete("/{history_id}", status_code=status.HTTP_200_OK)
async def delete_history_item(
    history_id: str, db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Deletes a single history record by ID.
    """
    result = await db.execute(
        select(History).where(History.id == history_id)
    )
    db_history = result.scalar_one_or_none()
    if not db_history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History item not found",
        )

    await db.delete(db_history)
    await db.commit()
    return {"success": True, "message": "History item deleted successfully"}


@router.delete("", status_code=status.HTTP_200_OK)
async def clear_all_history(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Deletes all history records from the database.
    """
    await db.execute(delete(History))
    await db.commit()
    return {"success": True, "message": "All request history cleared successfully"}
