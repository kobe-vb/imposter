# Multiplayer Game (React + FastAPI)

## Beschrijving
Multiplayer spel waarbij een host een spel start en spelers via hun gsm op hun naam tikken om info te krijgen. Alles gebeurt via REST API, pull-based, zonder WebSockets. Host bepaalt alle fases: rollen, opdrachten, dood, enz.

## Technische stack
- **Frontend:** React (Host UI + Mobile UI)
- **Backend:** FastAPI (REST API)
- **Database / Storage:** In-memory of DB voor spelstatus
- **QR-code:** Voor spelers om game te joinen via `game_id`

## Flow
1. Host maakt spel aan met spelerslijst en instellingen → server genereert `game_id`.
2. Host toont QR-code.
3. GSM scant QR → krijgt spelerslijst.
4. Host start fase (`role`, `task`, `dead`, …).
5. Speler tikt op eigen naam → REST GET naar server → krijgt persoonlijke info.
6. Host kan spelers doden of fase veranderen via REST POST.

## REST Endpoints (kort)
- `POST /game` → maak spel aan
- `GET /game/{game_id}` → spelerslijst + fase
- `POST /game/{game_id}/phase` → start/zet fase
- `GET /game/{game_id}/player/{player_name}` → info voor speler
- `POST /game/{game_id}/kill` → speler dood
