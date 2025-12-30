# app/presence/service.py
import redis.asyncio as redis
from datetime import datetime

redis_client = redis.from_url("redis://redis:6379", decode_responses=True)

PRESENCE_KEY = "presence:user:{}"

async def set_online(user_id: str):
    await redis_client.set(
        PRESENCE_KEY.format(user_id),
        datetime.utcnow().isoformat(),
        ex=60
    )

async def get_last_seen(user_id: str):
    value = await redis_client.get(PRESENCE_KEY.format(user_id))
    return value