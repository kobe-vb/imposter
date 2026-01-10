from fastapi import APIRouter, Depends

from app.api.ws.monitor import broadcast_player
from app.dependencies import get_game
from app.schemas.schemas import CommendRequest, Player, PlayerName, ReviveRequest, RoleRequest, TaskRequest
from app.services.Game import Game

router = APIRouter()

@router.get("/{code}/{player}/info", response_model=Player)
async def get_player(player: str, game: Game = Depends(get_game)):
    player_obj: Player = game.get_player(player)

    await broadcast_player(game.code, player)
    return player_obj

@router.post("/{code}/{player}/task", response_model=list[Player])
def set_player_task(player: PlayerName, request: TaskRequest, game: Game = Depends(get_game)):
    return game.set_player_task(player, request.task)

@router.post("/{code}/{player}/role", response_model=list[Player])
def set_player_role(player: PlayerName, request: RoleRequest, game: Game = Depends(get_game)):
    return game.set_player_role(player, request.role)

@router.post("/{code}/{player}/commend", response_model=list[Player])
def commend_player(player: PlayerName, request: CommendRequest, game: Game = Depends(get_game)):
    return game.commend_player(player, request.commend)


@router.delete("/{code}/{player}/kill", response_model=list[Player])
def kill_player(player: PlayerName, game: Game = Depends(get_game)):
    return game.kill_player(player)

@router.post("/{code}/revive", response_model=list[Player])
def revive_player(request: ReviveRequest, game: Game = Depends(get_game)):
    return game.revive_player(request.name)
