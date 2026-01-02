# app/presence/socket.py
from socketio import AsyncNamespace
from app.presence.service import set_online

class PresenceNamespace(AsyncNamespace):
    async def on_connect(self, sid, environ):
        user_id = environ["user"].id
        await set_online(str(user_id))

    async def on_disconnect(self, sid):
        pass




    