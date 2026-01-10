from http.client import HTTPException
from fastapi import APIRouter, Depends, status

from app.dependencies import get_game
from app.schemas.schemas import AssignTaskRequest, Player, TaskRequest
from app.services.Game import Game

router = APIRouter()

@router.delete("/{code}/{task}", response_model=list[str])
def remove_task(task: str, game: Game = Depends(get_game)):
    return game.tasks.remove_task(task)

@router.post("/{code}", response_model=list[str])
def add_task(request: TaskRequest, game: Game = Depends(get_game)):
    try:
        return game.tasks.add_task(request.task)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{code}/assign/random", response_model=list[Player])
def assign_task(request: AssignTaskRequest, game: Game = Depends(get_game)):
    return game.assign_task(request.task, request.role)
