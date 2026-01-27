from fastapi import Depends, status
from fastapi import APIRouter, HTTPException

from app.api.ws.monitor import broadcast_player
from app.dependencies import get_game
from app.schemas.schemas import AssignTaskRequest, CommendRequest, CreateGameRequest, CreateGameResponse, Player, PlayerName, Question, ResponseSuccess, ReviveRequest, RoleRequest, TaskRequest
from app.services.Game import Game
from app.services.Games import games

router = APIRouter()

@router.post("/create", response_model=CreateGameResponse)
def create_game(payload: CreateGameRequest):
    try:
        print(payload)
        code = games.create_game(
            payload.players,
            payload.settings,
            payload.roles,
            payload.questions
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    return CreateGameResponse(code=code)

@router.get("/{code}/valid", response_model=ResponseSuccess)
def get_valid_code(code: str) -> str:
    if not games.is_valid_game_code(code):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game niet gevonden"
        )
    return ResponseSuccess(success=True)


@router.get("/{code}/players", response_model=list[Player])
def get_game_players(game: Game = Depends(get_game)):
    return game.players

@router.get("/{code}/playersNames", response_model=list[PlayerName])
def get_game_players_names(game: Game = Depends(get_game)):
    return game.get_players_names()

@router.get("/{code}/tasks", response_model=list[str])
def get_game_tasks(game: Game = Depends(get_game)):
    return game.tasks.get_list()

@router.get("/{code}/handicaps", response_model=list[str])
def get_game_handicaps(game: Game = Depends(get_game)):
    return game.handicap.get_list()

@router.get("/{code}/roles", response_model=list[str])
def get_roles(game: Game = Depends(get_game)):
    return game.get_roles()

# TODO
@router.get("/{code}/round/new", response_model=list[Player])
def new_round(game: Game = Depends(get_game)):
    return game.new_round()


@router.post("/{code}/reset", response_model=ResponseSuccess)
def reset_game(game: Game = Depends(get_game)):
    game.reset()
    return ResponseSuccess(success=True)

@router.get("/{code}/questions", response_model=list[Question])
def get_questions(game: Game = Depends(get_game)):
    return game.questions
