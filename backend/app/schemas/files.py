from pydantic import BaseModel, Field

class FileCreate(BaseModel):
    path: str = Field(min_length=1, max_length=512)
    language: str = Field(min_length=1, max_length=50)

class FileUpdate(BaseModel):
    content: str

class FileResponse(BaseModel):
    id: str
    path: str
    language: str
    content: str