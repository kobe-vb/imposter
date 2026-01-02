import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePlayerContext } from "../../context/PlayerContext";
import type { PlayerName } from "@/types/types";
import { api } from "@/api/api";

export default function PlayerPage() {
    const { gameCode } = useParams<{ gameCode: string }>();

    if (!gameCode) {
        return <div>Ongeldige game code</div>;
    }

    const navigate = useNavigate();
    const { players, setPlayers } = usePlayerContext();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (players.length > 0) return;
        setLoading(true);

        const fetchPlayers = async () => {
            try {
                const players: PlayerName[] = await api.get<PlayerName[]>(`/game/${gameCode}/playersNames`);
                setPlayers(players);
            } catch {
                setError("Kon spelers niet laden");
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, [players, setPlayers]);

    const selectPlayer = (playerName: PlayerName) => {
        navigate(`/players/${gameCode}/info/${playerName}`);
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-white mb-1">Selecteer je naam</h2>
                    <p className="text-slate-300">Game: {gameCode}</p>
                </div>

                {error && (
                    <Alert className="mb-4 bg-red-500/10 border-red-500/50 text-red-200">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {players.map(player => (
                        <Button
                            key={player}
                            onClick={() => selectPlayer(player)}
                            disabled={loading}
                            className={`h-24 text-xl font-semibold transition-all bg-gradient-to-br from-purple-600 to-blue-600 text-white`}
                        >
                            {player}
                        </Button>
                    ))}
                </div>

                <Button
                    onClick={() => navigate("/")}
                    className="mt-6 w-full bg-slate-700 hover:bg-slate-600"
                >
                    <Home className="mr-2 h-5 w-5" />
                    Terug naar start
                </Button>
            </div>
        </div>
    );
}
