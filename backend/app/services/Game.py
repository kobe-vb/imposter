import datetime
import random
from fastapi import APIRouter

from app.schemas.schemas import GameSettings, Player, PlayerName, RoleInfo
from app.services.tasks import Tasks

router = APIRouter()

class Game:
    def __init__(self, code: str, players: list[PlayerName], settings: GameSettings, roles: list[RoleInfo]):
        self.code = code
        
        self.players_names: list[PlayerName] = players
        self.players: list[Player] = [Player(name=player, alive=True) for player in players]
        self.original_roles: list[RoleInfo] = roles
        self.roles: set[str] = set()

        self.assign_roles(roles)        
       
        self.settings: GameSettings = settings
        self.tasks: Tasks = Tasks(self.players, settings.taskTemplate)
        self.handicap: Tasks = Tasks(self.players, settings.taskTemplate, "handicaps")
        
        self.current_round: int = 0
                
        self.last_active: datetime = datetime.datetime.now()
    
    def reset(self):  
        self.players = [Player(name=player, alive=True) for player in self.players_names]
        self.assign_roles(self.original_roles)
        self.current_round = 0
        
    def assign_roles(self, roles: list[RoleInfo]):
        
        all_indices = list(range(len(self.players)))
        for role in roles:
            for _ in range(role.count):
                if not all_indices:
                    break
                chosen_index = random.choice(all_indices)
                self.players[chosen_index].role = role.name
                self.roles.add(role.name)
                all_indices.remove(chosen_index)
                
        self.players = sorted(
            self.players, 
            key=lambda player: (player.role is None, player.role)
        )  
    
    def get_roles(self) -> list[str]:
        return ["any"] + list(self.roles)
        
    def get_players_names(self) -> list[PlayerName]:
        return self.players_names
    
    def get_player(self, name: str) -> Player:
        return [player for player in self.players if player.name == name][0]
    
    def _set_player_live(self, name: str, alive: bool) -> list[Player]:
        for player in self.players:
            if player.name == name:
                player.alive = alive
                if player.alive:
                    player.task = None
                else:
                    player.task = self.handicap.get_random_task(player)
        return self.players
    
    def kill_player(self, name: str) -> list[Player]:
        return self._set_player_live(name, False)
    
    def revive_player(self, name: str) -> list[Player]:
        return self._set_player_live(name, True)
    
    def set_player_task(self, name: str, task: str) -> list[Player]:
        for player in self.players:
            if player.name == name:
                player.task = self.tasks.formatter.format(task, player)
        return self.players
    
    def set_player_role(self, name: str, role: str) -> list[Player]:
        for player in self.players:
            if player.name == name:
                player.role = role
        return self.players
    
    def commend_player(self, name: str, commend: str) -> list[Player]:
        for player in self.players:
            if player.name == name:
                player.commend = self.tasks.formatter.format(commend, player)
        return self.players
    
    def assign_task(self, task: str, role: str) -> list[Player]:
        
        available_players: list[Player]
        if role == "any":
            available_players = [player for player in self.players if player.task is None]
        else:
            available_players = [player for player in self.players if player.role == role and player.task is None]
        
        if len(available_players) == 0:
            return self.players
        
        random_player: Player = random.choice(available_players)
        random_player.task = self.tasks.formatter.format(task, random_player)
        return self.players
    
    def new_round(self) -> list[Player]:
        self.last_active = datetime.datetime.now() # hold game active
        
        self.current_round += 1

        for player in self.players:
            if player.alive:
                player.task = None

        alive_non_imposters = [
            p for p in self.players 
            if p.alive and p.role != "imposter"
        ]
        
        num_tasks = min(self.settings.tasksPerRound, len(alive_non_imposters))
        chosen_players = random.sample(alive_non_imposters, num_tasks)

        for player in chosen_players:
            player.task = self.tasks.get_random_task(player)

        return self.players    
                
    def is_inactive(self, threshold_minutes: int = 30) -> bool:
        return (datetime.datetime.now() - self.last_active).total_seconds() > threshold_minutes * 60
    