import aioredis
import json

class PresenceService:
    def __init__(self, redis: aioredis.Redis):
        self.redis = redis

    async def join(self, room_id: str, user_id: str):
        await self.redis.hset(f"presence:{room_id}", user_id, "online")

    async def leave(self, room_id: str, user_id: str):
        await self.redis.hdel(f"presence:{room_id}", user_id)

    async def list(self, room_id: str):
        return await self.redis.hkeys(f"presence:{room_id}")