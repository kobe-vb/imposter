import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HostJoinPage() {

    const navigate = useNavigate();

    const [gameCode, setGameCode] = useState('');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur border-purple-500/20">
                <CardContent className="pt-6">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Join Game</h2>
                        <p className="text-slate-300">Voer de game code in</p>
                    </div>

                    <div className="space-y-4">
                        <Input
                            type="text"
                            placeholder="GAME123"
                            value={gameCode}
                            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                            className="text-center text-2xl font-mono bg-slate-900/50 border-purple-500/30 text-white"
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/host/${gameCode}`)}
                        />

                        <Button
                            onClick={async () => { navigate(`/host/${gameCode}`) }}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6"
                        >
                            {'Join Game'}
                        </Button>

                        <Button
                            onClick={() => navigate(`/`)}
                            className="w-full bg-slate-700 hover:bg-slate-600"
                        >
                            Terug
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

