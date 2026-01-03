import random

from pathlib import Path

from app.schemas.schemas import Player

class Tasks:
    
    def __init__(self, players: list[Player], template: str, base_path: str = "tasks"):
        self.players: list[Player] = players
        self.base_path: str = base_path
        self.template: str = template
        
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
    
    def personalize_tasks(self, task: str) -> str:
        # ?
        return task
    
    def get_random_task(self) -> str:
        if len(self.tasks) == 0:
            return "geen opdrachten gevonden"
        return self.personalize_tasks(random.choice(self.tasks))

    def remove_task(self, task: str) -> list[str]:
        self.tasks.remove(task)
        return self.tasks
    
    def add_task(self, task: str) -> list[str]:
        if task in self.tasks:
            return
        self.tasks.append(task)
        
        path: Path = self.get_path()
        with path.open("a", encoding="utf-8") as f:
            f.write(f"\n{task}")
        
        return self.tasks
        