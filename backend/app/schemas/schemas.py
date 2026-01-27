from typing import List
from pydantic import BaseModel, Field


class Player(BaseModel):
    name: str
    alive: bool
    role: str | None = None
    task: str | None = None
    commend: str | None = None
    haveVoted: bool = False
    questions: list[str] | None = None

    def set_questions(self, questions: list[str]):
        self.questions = questions
        self.haveVoted = True

type PlayerName = str
    
class GameSettings(BaseModel):
    taskTemplate: str
    taskTime: int
    infoDisplayTime: int
    tasksPerRound: int

class RoleInfo(BaseModel):
    name: str
    count: int
    
class Question(BaseModel):
    key: str
    question: str
    
class CreateGameRequest(BaseModel):
    players: List[PlayerName]
    settings: GameSettings
    roles: List[RoleInfo]
    questions: List[Question]
    
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

class CommendRequest(BaseModel):
    commend: str
    
class VoteRequest(BaseModel):
    questions: List[str]

class ReviveRequest(BaseModel):
    name: PlayerName