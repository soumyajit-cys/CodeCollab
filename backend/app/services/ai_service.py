import httpx
from app.ai.provider import AIProvider
from app.core.config import settings

class RemoteAIProvider(AIProvider):

    async def complete(self, prompt: str) -> str:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                settings.AI_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.AI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "prompt": prompt,
                    "max_tokens": 800,
                    "temperature": 0.2
                }
            )
            resp.raise_for_status()
            return resp.json()["output"]