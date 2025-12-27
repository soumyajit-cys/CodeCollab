def register_webrtc_events(sio):

    @sio.event
    async def call_offer(sid, data):
        session = await sio.get_session(sid)
        sender_id = session["user_id"]

        await sio.emit(
            "call_offer",
            {
                "from": sender_id,
                "offer": data["offer"]
            },
            to=data["callee_id"]
        )

    @sio.event
    async def call_answer(sid, data):
        session = await sio.get_session(sid)

        await sio.emit(
            "call_answer",
            {
                "answer": data["answer"]
            },
            to=data["caller_id"]
        )

    @sio.event
    async def ice_candidate(sid, data):
        await sio.emit(
            "ice_candidate",
            data,
            to=data["peer_id"]
        )

    @sio.event
    async def end_call(sid, data):
        await sio.emit(
            "call_ended",
            {},
            to=data["peer_id"]
        )