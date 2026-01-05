from typing import List
from pydantic import BaseModel, Field


class Player(BaseModel):
    name: str
    alive: bool
    role: str | None = None
    task: str | None = None

type PlayerName = str
    
class GameSettings(BaseModel):
    taskTemplate: str
    taskTime: int
    infoDisplayTime: int
    tasksPerRound: int

class RoleInfo(BaseModel):
    name: str
    count: int
    
class CreateGameRequest(BaseModel):
    players: List[PlayerName]
    settings: GameSettings
    roles: List[RoleInfo]
    
class AssignTaskRequest(BaseModel):
    task: str
    role: str
 
class CreateGameResponse(BaseModel):
    code: str

class ResponseSuccess(BaseModel):
    success: bool

class TaskRequest(BaseModel):
    task: str

class RoleRequest(BaseModel):
    role: str

class ReviveRequest(BaseModel):
    name: PlayerName