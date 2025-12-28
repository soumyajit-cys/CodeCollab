import time

class RateLimiter:
    def __init__(self, redis, limit: int, window: int):
        self.redis = redis
        self.limit = limit
        self.window = window

    async def allow(self, user_id: str) -> bool:
        key = f"ai:rate:{user_id}"
        current = await self.redis.incr(key)
        if current == 1:
            await self.redis.expire(key, self.window)
        return current <= self.limit