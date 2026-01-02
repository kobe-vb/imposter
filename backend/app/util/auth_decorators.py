from functools import wraps
from fastapi import HTTPException, status, Request, Response
from fastapi.responses import JSONResponse
from typing import Callable, Optional
from app.services.Games import games
from app.services.Game import Game


class GameAuthError(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_403_FORBIDDEN):
        super().__init__(status_code=status_code, detail=detail)


def _get_game_from_kwargs(kwargs: dict) -> Game:
    code = kwargs.get('code')
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Game code ontbreekt"
        )

    game = games.get_game(code)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game niet gevonden"
        )

    return game


async def _get_player_id(request: Request) -> str:
    """
    Haal player ID op uit HTTPOnly cookie of fallback naar header.
    Cookie heeft voorrang voor veiligheid.
    """
    # Probeer eerst cookie (veiliger)
    player_id = request.cookies.get("player_id")
    
    # Fallback naar header (voor backwards compatibility tijdens migratie)
    if not player_id:
        player_id = request.headers.get("Player-ID")
    
    if not player_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Niet geauthenticeerd - login opnieuw"
        )
    
    return player_id


def set_player_cookie(response: Response, player_id: str, max_age: int = 86400 * 7):
    """
    Helper functie om veilige HTTPOnly cookie te zetten.
    max_age: 7 dagen standaard (in seconden)
    """
    response.set_cookie(
        key="player_id",
        value=player_id,
        httponly=True,  # JavaScript kan niet bij
        secure=True,     # Alleen via HTTPS (zet op False voor localhost testing)
        samesite="lax",  # CSRF bescherming
        max_age=max_age,
        path="/"
    )


def clear_player_cookie(response: Response):
    """Helper om cookie te verwijderen bij logout"""
    response.delete_cookie(
        key="player_id",
        httponly=True,
        secure=True,
        samesite="lax",
        path="/"
    )


def get_id() -> Callable:
    """Decorator die player_id toevoegt aan kwargs"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs.get("request")
            if not request:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Request object ontbreekt in endpoint"
                )

            player_id = await _get_player_id(request)
            kwargs["id"] = player_id
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_phase(phase_name: str) -> Callable:
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            game = _get_game_from_kwargs(kwargs)

            if phase_name != "any":
                if game.phase is None or game.phase.name != phase_name:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Game is niet in de {phase_name}-fase (huidige fase: {game.phase.name if game.phase else 'geen'})"
                    )

            kwargs["phase"] = game.phase
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_player(func: Callable) -> Callable:
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request: Request = kwargs.get("request")
        if not request:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Request object ontbreekt in endpoint"
            )

        player_id = await _get_player_id(request)
        game = _get_game_from_kwargs(kwargs)

        if player_id not in game.players:
            raise GameAuthError(
                detail="Alleen spelers kunnen deze actie uitvoeren"
            )

        return await func(*args, **kwargs)
    return wrapper


def require_host(func: Callable) -> Callable:
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request: Request = kwargs.get("request")
        if not request:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Request object ontbreekt in endpoint"
            )

        player_id = await _get_player_id(request)
        game = _get_game_from_kwargs(kwargs)

        if game.host != player_id:
            raise GameAuthError(
                detail="Alleen de host kan deze actie uitvoeren"
            )

        return await func(*args, **kwargs)
    return wrapper


def require_host_and_phase(phase_name: str) -> Callable:
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        @require_host
        @require_phase(phase_name)
        async def wrapper(*args, **kwargs):
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_player_and_phase(phase_name: str) -> Callable:
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        @require_player
        @require_phase(phase_name)
        async def wrapper(*args, **kwargs):
            return await func(*args, **kwargs)
        return wrapper
    return decorator



# async def join_game(code: str, name: str, request: Request, response: Response):
#     """
#     Voorbeeld van hoe je de cookie zou zetten bij join
#     """
#     game = games.get_game(code)
#     if not game:
#         raise HTTPException(status_code=404, detail="Game niet gevonden")
    
#     # Genereer player ID en voeg toe aan game
#     player_id = game.add_player(name)
    
#     # Zet de veilige cookie
#     set_player_cookie(response, player_id)
    
#     return {
#         "success": True,
#         "player_id": player_id,  # Kan nog steeds in response voor debugging
#         "name": name
#     }


# # Voorbeeld: Logout endpoint
# async def logout(request: Request, response: Response):
#     """Verwijder de cookie"""
#     clear_player_cookie(response)
#     return {"success": True}
