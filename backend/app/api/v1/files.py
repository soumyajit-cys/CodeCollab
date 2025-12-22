from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas import FileResponse, FileUpdate
from app.services.file_service import FileService
from app.core import get_current_user

router = APIRouter(prefix="/files", tags=["files"])

@router.get("/", response_model=list[FileResponse])
async def list_files(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await FileService.list_files(db, user.id)

@router.get("/{file_id}", response_model=FileResponse)
async def open_file(
    file_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    file = await FileService.get_file(db, user.id, file_id)
    if not file:
        raise HTTPException(status_code=404)
    return file

@router.put("/{file_id}", response_model=FileResponse)
async def save_file(
    file_id: str,
    payload: FileUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    file = await FileService.get_file(db, user.id, file_id)
    if not file:
        raise HTTPException(status_code=404)

    return await FileService.update_content(db, file, payload.content)