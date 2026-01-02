import stat
from fastapi import APIRouter, HTTPException

from app.schemas.schemas import CreateGameRequest, CreateGameResponse, GetGameCodeResponse, Player, PlayerNames 
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

@router.get("/{code}/playersNames", response_model=list[PlayerNames])
def get_game_players(code: str):
    return games.get_game(code).get_players_names()

@router.get("/{code}/tasks", response_model=list[str])
def get_game_tasks(code: str):
    return games.get_game(code).tasks

@router.get("/{code}/player/{player}/info", response_model=Player)
def get_player(code: str, player: str):
    return games.get_game(code).get_player(player)