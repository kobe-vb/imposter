import stat
from fastapi import APIRouter, HTTPException

from app.schemas.schemas import CreateGameRequest, CreateGameResponse, GetGameCodeResponse, Player, PlayerName, ReviveRequest, TaskRequest
from app.services.Games import games

router = APIRouter()

@router.post("/create", response_model=CreateGameResponse)
def create_game(payload: CreateGameRequest):
    code = games.create_game(
        payload.players,
        payload.settings
    )
    return CreateGameResponse(code=code)

@router.get("/{code}", response_model=GetGameCodeResponse)
def get_valid_code(code: str) -> str:
    if not games.is_valid_game_code(code):
        raise HTTPException(
            status_code=stat.HTTP_404_NOT_FOUND,
            detail="Game niet gevonden"
        )
    return GetGameCodeResponse(success=True)

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
    return games.get_game(code).tasks.add_task(request.task)

@router.get("/{code}/handicaps", response_model=list[str])
def get_game_handicaps(code: str):
    return games.get_game(code).handicap.get_list()

@router.delete("/{code}/handicap/{handicap}", response_model=list[str])
def remove_handicap(code: str, handicap: str):
    return games.get_game(code).handicap.remove_task(handicap)

@router.post("/{code}/handicap", response_model=list[str])
def add_handicap(code: str, request: TaskRequest):
    return games.get_game(code).handicap.add_task(request.task)

@router.post("/{code}/player/{player}/task", response_model=list[Player])
def set_player_task(code: str, player: PlayerName, request: TaskRequest):
    return games.get_game(code).set_player_task(player, request.task)

@router.get("/{code}/player/{player}/info", response_model=Player)
def get_player(code: str, player: str):
    return games.get_game(code).get_player(player)

@router.delete("/{code}/player/{player}/kill", response_model=list[Player])
def kill_player(code: str, player: PlayerName):
    return games.get_game(code).kill_player(player)

@router.post("/{code}/player/revive", response_model=list[Player])
def revive_player(code: str, request: ReviveRequest):
    return games.get_game(code).revive_player(request.name)

@router.get("/{code}/round/new", response_model=list[Player])
def new_round(code: str):
    return games.get_game(code).new_round()