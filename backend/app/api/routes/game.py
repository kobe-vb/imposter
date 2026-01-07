from fastapi import status
from fastapi import APIRouter, HTTPException

from app.api.ws.monitor import broadcast_player
from app.schemas.schemas import AssignTaskRequest, CommendRequest, CreateGameRequest, CreateGameResponse, Player, PlayerName, ResponseSuccess, ReviveRequest, RoleRequest, TaskRequest
from app.services.Games import games

router = APIRouter()

@router.post("/create", response_model=CreateGameResponse)
def create_game(payload: CreateGameRequest):
    try:
        code = games.create_game(
            payload.players,
            payload.settings,
            payload.roles
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    return CreateGameResponse(code=code)

@router.get("/{code}", response_model=ResponseSuccess)
def get_valid_code(code: str) -> str:
    if not games.is_valid_game_code(code):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game niet gevonden"
        )
    return ResponseSuccess(success=True)

@router.get("/{code}/players", response_model=list[Player])
def get_game_players(code: str):
    return games.get_game(code).players

@router.get("/{code}/playersNames", response_model=list[PlayerName])
def get_game_players(code: str):
    return games.get_game(code).get_players_names()

@router.get("/{code}/tasks", response_model=list[str])
def get_game_tasks(code: str):
    return games.get_game(code).tasks.get_list()

@router.delete("/{code}/task/{task}", response_model=list[str])
def remove_task(code: str, task: str):
    return games.get_game(code).tasks.remove_task(task)

@router.post("/{code}/task", response_model=list[str])
def add_task(code: str, request: TaskRequest):
    try:
        return games.get_game(code).tasks.add_task(request.task)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{code}/handicaps", response_model=list[str])
def get_game_handicaps(code: str):
    return games.get_game(code).handicap.get_list()

@router.delete("/{code}/handicap/{handicap}", response_model=list[str])
def remove_handicap(code: str, handicap: str):
    return games.get_game(code).handicap.remove_task(handicap)

@router.post("/{code}/handicap", response_model=list[str])
def add_handicap(code: str, request: TaskRequest):

    try:
        return games.get_game(code).handicap.add_task(request.task)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{code}/player/{player}/task", response_model=list[Player])
def set_player_task(code: str, player: PlayerName, request: TaskRequest):
    return games.get_game(code).set_player_task(player, request.task)

@router.post("/{code}/player/{player}/role", response_model=list[Player])
def set_player_role(code: str, player: PlayerName, request: RoleRequest):
    return games.get_game(code).set_player_role(player, request.role)

@router.post("/{code}/player/{player}/commend", response_model=list[Player])
def commend_player(code: str, player: PlayerName, request: CommendRequest):
    return games.get_game(code).commend_player(player, request.commend)

@router.get("/{code}/player/{player}/info", response_model=Player)
async def get_player(code: str, player: str):
    game = games.get_game(code)
    player_obj = game.get_player(player)

    await broadcast_player(code, player)
    return player_obj

@router.delete("/{code}/player/{player}/kill", response_model=list[Player])
def kill_player(code: str, player: PlayerName):
    return games.get_game(code).kill_player(player)

@router.post("/{code}/player/revive", response_model=list[Player])
def revive_player(code: str, request: ReviveRequest):
    return games.get_game(code).revive_player(request.name)

@router.get("/{code}/round/new", response_model=list[Player])
def new_round(code: str):
    return games.get_game(code).new_round()

@router.get("/{code}/roles", response_model=list[str])
def get_roles(code: str):
    return games.get_game(code).get_roles()

@router.post("/{code}/task/assign", response_model=list[Player])
def assign_task(code: str, request: AssignTaskRequest):
    return games.get_game(code).assign_task(request.task, request.role)

@router.post("/{code}/reset", response_model=ResponseSuccess)
def reset_game(code: str):
    games.get_game(code).reset()
    return ResponseSuccess(success=True)