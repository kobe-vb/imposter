from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

router = APIRouter()

active_connections: Dict[str, List[WebSocket]] = {}

async def broadcast_player(code: str, player_name: str) -> None:
    if code not in active_connections:
        return

    for ws in active_connections[code]:
        await ws.send_json({
            "player": player_name,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

@router.websocket("/{code}/monitor")
async def monitor_players(websocket: WebSocket, code: str):
    await websocket.accept()

    if code not in active_connections:
        active_connections[code] = []

    active_connections[code].append(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections[code].remove(websocket)
