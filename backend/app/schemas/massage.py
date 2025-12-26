from pydantic import BaseModel, Field

class MessageCreate(BaseModel):
    receiver_id: str
    content: str = Field(min_length=1, max_length=5000)

class MessageResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    content: str
    delivered: bool
    read: bool
    created_at: str