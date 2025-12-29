from pydantic import BaseModel, Field

class AIRequest(BaseModel):
    file_id: str
    instruction: str = Field(min_length=5, max_length=500)

class AIResponse(BaseModel):
    result: str