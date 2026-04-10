import random

from pathlib import Path
from typing import Optional

from app.schemas.schemas import Player
from app.services.taskFormatter import TaskFormatter
from app.services.taskSyntaxValidator import TaskSyntaxValidator

class Tasks:
    
    ALLOWED_TEMPLATES  = {"leden", "leiding"}
    
    def __init__(self, players: list[Player], template: str, base_path: str = "tasks"):
        
        if template not in self.ALLOWED_TEMPLATES:
            raise ValueError(f"Template '{template}' is niet toegestaan")
        
        self.players: list[Player] = players
        self.base_path: str = base_path
        self.template: str = template
        
        self.formatter: TaskFormatter = TaskFormatter(self.players)
        
        self.tasks: list[str] = []
        self.load_template()
    
    def get_list(self) -> list[str]:
        return self.tasks
    
    def get_path(self) -> Path:
        return Path(self.base_path) / f"{self.template}.txt"
    
    def load_template(self):
        
        path: Path = self.get_path()
        
        if not path.exists():
            raise ValueError(f"Task template '{self.template}' bestaat niet ful path: {path}")
        
        with open(path, "r") as f:
            self.tasks = f.read().splitlines()
            
    def get_random_task(self, player: Player) -> str:
        if len(self.tasks) == 0:
            return "geen opdrachten gevonden"
        
        new_task: Optional[str] = self.formatter.format(random.choice(self.tasks), player)
        for _ in range(10):
            new_task = self.formatter.format(random.choice(self.tasks), player)
            if new_task is not None:
                break
        if new_task is None:
            new_task = "geen opdrachten gevonden"
        return new_task

    def remove_task(self, task: str) -> list[str]:
        self.tasks.remove(task)
        return self.tasks
    
    def add_task(self, task: str) -> list[str]:
        if task in self.tasks:
            raise ValueError(f"Opdracht '{task}' bestaat al")
        
        TaskSyntaxValidator.validate(task)
        
        self.tasks.append(task)
        
        path: Path = self.get_path()
        with path.open("a", encoding="utf-8") as f:
            f.write(f"\n{task}")
        
        return self.tasks
        