from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

class GameError(Exception):
    """Base exception voor game-gerelateerde errors"""
    def __init__(self, message: str, error_code: str, status_code: int = 400):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        super().__init__(self.message)

class GameNotFoundError(GameError):
    def __init__(self):
        super().__init__(
            message="Game niet gevonden",
            error_code="GAME_NOT_FOUND",
            status_code=404
        )

class InvalidPhaseError(GameError):
    def __init__(self, current_phase: str, expected_phase: str):
        super().__init__(
            message=f"Ongeldige fase. Huidige fase: {current_phase}, verwachte fase: {expected_phase}",
            error_code="INVALID_PHASE",
            status_code=400
        )
        self.current_phase = current_phase
        self.expected_phase = expected_phase

class UnauthorizedError(GameError):
    def __init__(self, message: str = "Niet geautoriseerd voor deze actie"):
        super().__init__(
            message=message,
            error_code="UNAUTHORIZED",
            status_code=403
        )

class PlayerNotFoundError(GameError):
    def __init__(self):
        super().__init__(
            message="Speler niet gevonden",
            error_code="PLAYER_NOT_FOUND",
            status_code=404
        )

# Exception handlers voor in je main.py
async def game_error_handler(request: Request, exc: GameError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "status": exc.status_code
            }
        }
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": "HTTP_ERROR",
                "message": exc.detail,
                "status": exc.status_code
            }
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Validatiefout in de request",
                "status": 422,
                "details": errors
            }
        }
    )
