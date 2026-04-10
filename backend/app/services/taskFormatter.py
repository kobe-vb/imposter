import random
import re
from typing import Optional
from app.schemas.schemas import Player


class TaskFormatter:
    
    PLAYER_REGEX = re.compile(r"\{player:([^}]+)\}|\{player\}|\{self\}")
    RANDOM_TEXT_REGEX = re.compile(r"\{\?\s*(?:\"[^\"]+\"(?:\s*,\s*|\s+))*\"[^\"]+\"\s*\}")

    def __init__(self, players: list[Player]):
        self.players = players
        
        self.failed: bool = False

    def format(self, task: str, player: Player) -> Optional[str]:

        self.failed = False
        used_players: set[str] = set()
        used_players.add(player.name)

        task = self.PLAYER_REGEX.sub(
            lambda m: self._replace_player(m, used_players, player.name),
            task
        )
        if self.failed:
            return None

        task = self.RANDOM_TEXT_REGEX.sub(
            self._replace_random_text,
            task
        )
        
        return task

    def _replace_player(
        self,
        match: re.Match,
        used_players: set[str],
        player_name: str
    ) -> str:
        
        token = match.group(0).strip("{}")

        if token == "self":
            return player_name

        elif token == "player":
            pool = self.players
        elif token == "player:alive":
            pool = [p for p in self.players if p.alive]
        elif token == "player:dead":
            pool = [p for p in self.players if not p.alive]
        else:
            key = token.split(":")[1]
            if '!' in key:
                pool = [p for p in self.players if key not in p.questions]
            else:
                pool = [p for p in self.players if key in p.questions]
            
        available = [p for p in pool if p.name not in used_players]
        if not available:
            self.failed = True
            return "niemand"

        chosen = random.choice(available).name
        used_players.add(chosen)
        return chosen

    def _replace_random_text(self, match: re.Match) -> str:
        options = re.findall(r'"([^"]+)"', match.group(0))
        return random.choice(options) if options else ""


if __name__ == "__main__":
            
    def test(task: str):
        print(task, "=>", formatter.format(task, Player(name="kobe", alive=True)))
    
    def test_multy():

        test("jow doe dit met {player}")
        test("jow doe dit met {player:alive}")
        test("jow doe dit met {player:dead}")
        test("ga op een rij staan in volgorde van {? \"leeftijd\", \"groote\", \"tak\" }")
        test("ga op een rij staan in volgorde van {? \"leeftijd\" \"groote\" \"tak\" }")
        print("---" * 10)
        print()

    formatter: TaskFormatter = TaskFormatter([])
    test_multy()
    
    formatter: TaskFormatter = TaskFormatter([Player(name="kobe", alive=True)])
    test_multy()
    
    formatter: TaskFormatter = TaskFormatter([Player(name="kobe", alive=True), Player(name="joe", alive=False), Player(name="bob", alive=True), Player(name="marie", alive=True) ])
    test_multy()