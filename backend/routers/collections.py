from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Collection
from schemas import CollectionCreate, CollectionUpdate, CollectionResponse

router = APIRouter(prefix="/api/collections", tags=["Collections"])

@router.get("", response_model=List[CollectionResponse])
async def get_collections(db: AsyncSession = Depends(get_db)) -> List[CollectionResponse]:
    """
    Fetches all collections, including their nested requests preloaded.
    """
    result = await db.execute(
        select(Collection).options(selectinload(Collection.requests))
    )
    collections = result.scalars().all()
    return list(collections)


@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    collection_in: CollectionCreate, db: AsyncSession = Depends(get_db)
) -> CollectionResponse:
    """
    Creates a new collection with the given name and description.
    """
    db_collection = Collection(
        name=collection_in.name,
        description=collection_in.description,
    )
    db.add(db_collection)
    await db.commit()
    await db.refresh(db_collection)
    
    # Load requests (should be empty list initially)
    result = await db.execute(
        select(Collection)
        .where(Collection.id == db_collection.id)
        .options(selectinload(Collection.requests))
    )
    return result.scalar_one()


@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: str,
    collection_in: CollectionUpdate,
    db: AsyncSession = Depends(get_db),
) -> CollectionResponse:
    """
    Updates the name and/or description of an existing collection.
    """
    result = await db.execute(
        select(Collection)
        .where(Collection.id == collection_id)
        .options(selectinload(Collection.requests))
    )
    db_collection = result.scalar_one_or_none()
    if not db_collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found",
        )

    if collection_in.name is not None:
        db_collection.name = collection_in.name
    if collection_in.description is not None:
        db_collection.description = collection_in.description

    await db.commit()
    await db.refresh(db_collection)
    return db_collection


@router.delete("/{collection_id}", status_code=status.HTTP_200_OK)
async def delete_collection(
    collection_id: str, db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Deletes a collection by ID. The requests in this collection are cascade deleted.
    """
    result = await db.execute(
        select(Collection).where(Collection.id == collection_id)
    )
    db_collection = result.scalar_one_or_none()
    if not db_collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found",
        )

    await db.delete(db_collection)
    await db.commit()
    return {"success": True, "message": "Collection deleted successfully"}
