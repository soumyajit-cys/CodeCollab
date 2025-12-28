from abc import ABC, abstractmethod

class AIProvider(ABC):

    @abstractmethod
    async def complete(self, prompt: str) -> str:
        raise NotImplementedError