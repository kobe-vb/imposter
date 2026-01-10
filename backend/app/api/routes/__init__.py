from fastapi import APIRouter
from .game import router as game_router
from .player import router as player_router
from .tasks import router as tasks_router
from .handicaps import router as handicaps_router

api_router = APIRouter()

api_router.include_router(game_router, prefix="/game", tags=["game"])
api_router.include_router(player_router, prefix="/player", tags=["player"])
api_router.include_router(tasks_router, prefix="/tasks", tags=["tasks"])
api_router.include_router(handicaps_router, prefix="/handicaps", tags=["handicaps"])
