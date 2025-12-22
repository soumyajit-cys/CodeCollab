from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.file import File

class FileService:

    @staticmethod
    async def list_files(db: AsyncSession, user_id: str):
        result = await db.execute(
            select(File).where(File.owner_id == user_id)
        )
        return result.scalars().all()

    @staticmethod
    async def get_file(db: AsyncSession, user_id: str, file_id: str):
        result = await db.execute(
            select(File).where(File.id == file_id, File.owner_id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update_content(db: AsyncSession, file: File, content: str):
        file.content = content
        await db.commit()
        await db.refresh(file)
        return file
    