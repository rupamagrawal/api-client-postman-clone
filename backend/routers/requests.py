from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Collection, Request
from schemas import RequestCreate, RequestUpdate, RequestResponse

router = APIRouter(prefix="/api", tags=["Requests"])

@router.post("/collections/{collection_id}/requests", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request_in_collection(
    collection_id: str,
    request_in: RequestCreate,
    db: AsyncSession = Depends(get_db),
) -> RequestResponse:
    """
    Creates and saves a new request inside a specific collection.
    """
    # Verify collection exists
    result = await db.execute(
        select(Collection).where(Collection.id == collection_id)
    )
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found",
        )

    db_request = Request(
        collection_id=collection_id,
        name=request_in.name,
        method=request_in.method,
        url=request_in.url,
        headers=request_in.headers,
        params=request_in.params,
        body_type=request_in.body_type,
        body_content=request_in.body_content,
        auth_type=request_in.auth_type,
        auth_config=request_in.auth_config,
    )
    db.add(db_request)
    await db.commit()
    await db.refresh(db_request)
    return db_request


@router.put("/requests/{request_id}", response_model=RequestResponse)
async def update_request(
    request_id: str,
    request_in: RequestUpdate,
    db: AsyncSession = Depends(get_db),
) -> RequestResponse:
    """
    Updates any field of an existing request by ID.
    """
    result = await db.execute(
        select(Request).where(Request.id == request_id)
    )
    db_request = result.scalar_one_or_none()
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    # Update only provided fields
    update_data = request_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_request, field, value)

    await db.commit()
    await db.refresh(db_request)
    return db_request


@router.delete("/requests/{request_id}", status_code=status.HTTP_200_OK)
async def delete_request(
    request_id: str, db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Deletes an existing request by ID.
    """
    result = await db.execute(
        select(Request).where(Request.id == request_id)
    )
    db_request = result.scalar_one_or_none()
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    await db.delete(db_request)
    await db.commit()
    return {"success": True, "message": "Request deleted successfully"}
