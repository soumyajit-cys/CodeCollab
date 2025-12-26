from app.services.chat_service import ChatService

def register_chat_events(sio):

    @sio.event
    async def send_message(sid, data):
        session = await sio.get_session(sid)
        sender_id = session["user_id"]

        msg = await ChatService.save_message(
            sio.app.state.db,
            sender_id,
            data["receiver_id"],
            data["content"]
        )

        await sio.emit(
            "message_received",
            {
                "id": msg.id,
                "sender_id": sender_id,
                "receiver_id": msg.receiver_id,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
            },
            to=data["receiver_id"]
        )