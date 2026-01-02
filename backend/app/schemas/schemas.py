from typing import List
from pydantic import BaseModel, Field


class Player(BaseModel):
    name: str
    alive: bool
    role: str | None
    task: str | None

type PlayerName = str
    
class GameSettings(BaseModel):
    imposters: int
    taskTemplate: str
    taskTime: int
    infoDisplayTime: int
    tasksPerRound: int
    
class CreateGameRequest(BaseModel):
    players: List[PlayerName]
    settings: GameSettings

class CreateGameResponse(BaseModel):
    code: str

class GetGameCodeResponse(BaseModel):
    success: bool

class TaskRequest(BaseModel):
    task: str

class ReviveRequest(BaseModel):
    name: PlayerName