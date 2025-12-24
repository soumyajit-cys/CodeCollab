from app.realtime.auth import authenticate_socket
from app.realtime.presence import PresenceService
from app.services import CollaborationService

def register_events(sio):

    @sio.event
    async def connect(sid, environ, auth):
        token = auth.get("token")
        user_id = authenticate_socket(token)
        sio.save_session(sid, {"user_id": user_id})

    @sio.event
    async def join_room(sid, data):
        session = await sio.get_session(sid)
        user_id = session["user_id"]
        room_id = data["room_id"]

        await sio.enter_room(sid, room_id)
        await sio.emit("user_joined", user_id, room=room_id)

    @sio.event
    async def leave_room(sid, data):
        session = await sio.get_session(sid)
        await sio.leave_room(sid, data["room_id"])

    @sio.event
    async def crdt_update(sid, data):
        room_id = data["room_id"]
        delta = data["delta"]

        await sio.emit(
            "crdt_update",
            delta,
            room=room_id,
            skip_sid=sid
        )