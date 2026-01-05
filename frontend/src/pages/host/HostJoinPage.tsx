import { api } from "@/api/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Home } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HostJoinPage() {

    const [gameCode, setGameCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const joinGame = async () => {
        if (!gameCode.trim()) {
            setError('Voer een game code in');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await api.get<{ success: boolean }>(`/game/${gameCode}`);

            if (data.success) {
                navigate(`/host/${gameCode}/monitor`);
            }
            else {
                setError('Game niet gevonden');
            }
        } catch (err) {
            setError('Game niet gevonden');
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur border-purple-500/20">
                <CardContent className="pt-6">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Monitor Game</h2>
                        <p className="text-slate-300">Voer de game code in</p>
                    </div>

                    <div className="space-y-4">
                        <Input
                            type="text"
                            placeholder="GAME123"
                            value={gameCode}
                            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                            className="text-center text-2xl font-mono bg-slate-900/50 border-purple-500/30 text-white"
                            onKeyDown={(e) => e.key === 'Enter' && joinGame()}
                        />

                        {error && (
                            <Alert className="bg-red-500/10 border-red-500/50 text-red-200">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            onClick={joinGame}
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6"
                        >
                            {loading ? 'Laden...' : 'monitor game'}
                        </Button>

                        <Button
                            onClick={() => navigate("/")}
                            className="w-full bg-slate-700 hover:bg-slate-600"
                        >
                            <Home className="mr-2 h-5 w-5" />
                            Terug
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}