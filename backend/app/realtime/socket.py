import socketio
from app.realtime import register_events

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[]
)

def init_socket(app):
    register_events(sio)
    app.mount("/ws", socketio.ASGIApp(sio))