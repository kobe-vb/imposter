import datetime
import random
from fastapi import APIRouter

from app.schemas.schemas import GameSettings, Player, PlayerName

router = APIRouter()

class Game:
    def __init__(self, code: str, players: list[PlayerName], settings: GameSettings):
        self.code = code
        
        self.players: list[Player] = [Player(name=player.name, alive=True, role=None, task=None) for player in players]
        for _ in range(settings.imposters):
            i: int = random.randint(0, len(self.players) - 1)
            while self.players[i].role == "imposter":
                i = random.randint(0, len(self.players) - 1)
            self.players[i].role = "imposter"
        
        # sort players so that players with roles are first
        self.players = sorted(self.players, key=lambda player: player.role is not None, reverse=True)    
        
        self.settings: GameSettings = settings
        self.tasks: list[str] = []
        
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
                
    def is_inactive(self, threshold_minutes: int = 30) -> bool:
        return (datetime.datetime.now() - self.last_active).total_seconds() > threshold_minutes * 60
    