from fastapi import APIRouter, Depends, HTTPException
from app.schemas.ai import AIRequest, AIResponse
from app.core import get_current_user
from app.services.ai_service import RemoteAIProvider
from app.ai.prompts import build_prompt
from app.ai.limiter import RateLimiter

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/assist", response_model=AIResponse)
async def assist(
    payload: AIRequest,
    user=Depends(get_current_user),
):
    limiter = RateLimiter(router.redis, limit=20, window=60)
    if not await limiter.allow(user.id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    # File content fetched from Module 2 service
    file = await router.file_service.get_file(payload.file_id, user.id)

    prompt = build_prompt(
        file.language,
        file.content,
        payload.instruction
    )

    provider = RemoteAIProvider()
    output = await provider.complete(prompt)

    return {"result": output}