from fastapi import HTTPException
from fastapi import APIRouter, Depends, status

from app.dependencies import get_game
from app.schemas.schemas import TaskRequest
from app.services.Game import Game

router = APIRouter()

@router.delete("/{code}/{handicap}", response_model=list[str])
def remove_handicap(handicap: str, game: Game = Depends(get_game)):
    return game.handicap.remove_task(handicap)

@router.post("/{code}", response_model=list[str])
def add_handicap(request: TaskRequest, game: Game = Depends(get_game)):

    try:
        return game.handicap.add_task(request.task)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
