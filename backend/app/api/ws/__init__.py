from fastapi import APIRouter
from .monitor import router as monitor_ws

ws_router = APIRouter()

ws_router.include_router(monitor_ws, prefix="/game", tags=["ws"])
