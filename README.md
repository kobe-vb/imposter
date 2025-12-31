# 🎭 De Blinde Impostor

**Beschrijving**  
De Blinde Impostor is een multiplayer party game web-app. Een centrale host (computer) beheert alle spelers, rollen en opdrachten, terwijl spelers via hun telefoons verbinding maken voor snelle en interactieve gameplay. Het spel ondersteunt 20+ spelers en verdeelt de interactie over meerdere telefoons om het spel sneller en overzichtelijker te maken.

## Features
- Rollen en opdrachten worden door de host toegewezen
- Spelers verbinden via een QR-code of gamecode
- Telefoons tonen enkel de relevante informatie voor elke speler
- Handicaps en opdrachten worden realtime gesynchroniseerd
- Host bepaalt ronde-flow en wincondities

## Technische stack
- Frontend: React.js (Host en Speler UI)
- Backend: Node.js + Express
- Realtime communicatie: Socket.IO
- Optioneel: Database (MongoDB/Firebase) voor persistente game-state

## Installatie
1. Clone de repository:
   ```bash
   git clone https://github.com/username/blinde-impostor.git
   cd blinde-impostor
