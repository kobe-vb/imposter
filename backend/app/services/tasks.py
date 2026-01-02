import random

from pathlib import Path

class Tasks:
    
    def __init__(self, template: str):
        self.tasks: list[str] = []
        self.template: str = template
        self.load_template()
    
    def get_list(self) -> list[str]:
        return self.tasks
    
    def get_path(self) -> Path:
        return Path("tasks") / f"{self.template}.txt"
    
    def load_template(self):
        
        path: Path = self.get_path()
        
        if not path.exists():
            raise ValueError(f"Task template '{self.template}' bestaat niet ful path: {path}")
        
        with open(path, "r") as f:
            self.tasks = f.read().splitlines()
    
    def get_random_task(self) -> str:
        return random.choice(self.tasks)

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
        