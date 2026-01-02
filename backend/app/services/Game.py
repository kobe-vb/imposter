import datetime
import random
from fastapi import APIRouter

from app.schemas.schemas import GameSettings, Player, PlayerName
from app.services.tasks import Tasks

router = APIRouter()

class Game:
    def __init__(self, code: str, players: list[PlayerName], settings: GameSettings):
        self.code = code
        
        self.players: list[Player] = [Player(name=player, alive=True, role=None, task=None) for player in players]
        for _ in range(settings.imposters):
            i: int = random.randint(0, len(self.players) - 1)
            while self.players[i].role == "imposter":
                i = random.randint(0, len(self.players) - 1)
            self.players[i].role = "imposter"
        
        # sort players so that players with roles are first
        self.players = sorted(self.players, key=lambda player: player.role is not None, reverse=True)    
        
        self.settings: GameSettings = settings
        self.tasks: Tasks = Tasks(settings.taskTemplate)
        
        self.current_round: int = 0
                
        self.last_active: datetime = datetime.datetime.now()  
    
    def get_players_names(self) -> list[PlayerName]:
        names = [player.name for player in self.players]
        random.shuffle(names)
        return names
    
    def get_player(self, name: str) -> Player:
        return [player for player in self.players if player.name == name][0]
    
    def _set_player_live(self, name: str, alive: bool) -> list[Player]:
        for player in self.players:
            if player.name == name:
                player.alive = alive
        return self.players
    
    def kill_player(self, name: str) -> list[Player]:
        return self._set_player_live(name, False)
    
    def revive_player(self, name: str) -> list[Player]:
        return self._set_player_live(name, True)
    
    def set_player_task(self, name: str, task: str) -> list[Player]:
        for player in self.players:
            if player.name == name:
                player.task = task
        return self.players
    
    def new_round(self) -> list[Player]:
        self.current_round += 1

        alive_players = [p for p in self.players if p.alive]

        for player in alive_players:
            player.task = None

        num_tasks = min(self.settings.tasksPerRound, len(alive_players))
        chosen_players = random.sample(alive_players, num_tasks)

        for player in chosen_players:
            player.task = self.tasks.get_random_task()

        return self.players    
                
    def is_inactive(self, threshold_minutes: int = 30) -> bool:
        return (datetime.datetime.now() - self.last_active).total_seconds() > threshold_minutes * 60
    