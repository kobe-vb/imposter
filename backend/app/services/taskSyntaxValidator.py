import re


class TaskSyntaxError(ValueError):
    pass


class TaskSyntaxValidator:
    VALID_PLAYER_TOKENS = {
        "player",
        "player:alive",
        "player:dead",
        "self",
    }

    PLACEHOLDER_REGEX = re.compile(r"\{([^}?][^}]*)\}")
    RANDOM_BLOCK_REGEX = re.compile(r"\{\?.*?\}")

    @classmethod
    def validate(cls, task: str) -> None:
        cls._validate_braces(task)
        cls._validate_random_blocks(task)
        cls._validate_placeholders(task)

    @staticmethod
    def _validate_braces(task: str) -> None:
        if task.count("{") != task.count("}"):
            raise TaskSyntaxError(
                "Ongelijk aantal '{' en '}' in task"
            )

    @classmethod
    def _validate_random_blocks(cls, task: str) -> None:
        blocks = cls.RANDOM_BLOCK_REGEX.findall(task)

        for block in blocks:
            options = re.findall(r'"([^"]+)"', block)
            if len(options) < 1:
                raise TaskSyntaxError(
                    f"Ongeldig random blok: {block}"
                )

    @classmethod
    def _validate_placeholders(cls, task: str) -> None:
        # negeer random blocks
        placeholders = cls.PLACEHOLDER_REGEX.findall(task)
        for ph in placeholders:
            if ph not in cls.VALID_PLAYER_TOKENS:
                raise TaskSyntaxError(
                    f"Ongeldige placeholder: {ph} try: {cls.VALID_PLAYER_TOKENS}"
                )

if __name__ == "__main__":
    
    def test(task: str):
        try:
            TaskSyntaxValidator.validate(task)
        except TaskSyntaxError as e:
            print("✗ \"", task, "\"", e)
        else:
            print("✓", task)
    
    test("test")
    test("test {player}")
    test("test {player:alive}")
    test("test {player:dead}")
    test("test {player:alive} {player:dead}")
    test("test {player:alive}{player:dead} {player}")
    test("test {player:alive} {player:dead} {player:alive}")
    test("beu {")
    test("beu }")
    test("beu {player:alive")
    test("woow {cool}")
    test('{? "hello", "world" }')
    test('{? "hello" }')
    test('ga op een rij staan in volgorde van {? "leeftijd", "groote", "tak" }')
    test('ga op een rij staan in volgorde van {? "leeftijd" "groote" "tak" }')