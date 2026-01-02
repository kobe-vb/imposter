from typing import List
from pydantic import BaseModel, Field

class PlayerName(BaseModel):
    name: str

class Player(BaseModel):
    name: str
    alive: bool
    role: str | None
    task: str | None

type PlayerNames = str
    
class GameSettings(BaseModel):
    imposters: int
    
    
    
class CreateGameRequest(BaseModel):
    players: List[PlayerName]
    settings: GameSettings

class CreateGameResponse(BaseModel):
    code: str

class GetGameCodeResponse(BaseModel):
    success: bool
