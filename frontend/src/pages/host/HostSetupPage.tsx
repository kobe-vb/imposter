import { api } from "@/api/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CreateGameResponse, GameSettings, PlayerName } from "@/types/types";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HostSetupPage() {

    const navigate = useNavigate();

    const [players, setPlayers] = useState<PlayerName[]>([]);
    const [newPlayer, setNewPlayer] = useState<PlayerName>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const [settings, setSettings] = useState<GameSettings>({
        imposters: 2,
        taskTemplate: "leden",
        taskTime: 5,
        infoDisplayTime: 5,
        tasksPerRound: 2
    });

    const addPlayer = () => {
        if (!newPlayer.trim()) return;
        if (players.find(p => p === newPlayer)) {
            setError('Speler bestaat al');
            return;
        }
        setPlayers([newPlayer, ...players]);
        setNewPlayer("");
        setError('');
    };

    const removePlayer = (name: String) => {
        setPlayers(players.filter(p => p !== name));
    };


    const createGame = async () => {
        if (players.length < 3) {
            setError("Minimaal 3 spelers nodig");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post<CreateGameResponse>("/game/create", {
                players,
                settings,
            });

            navigate(`/host/${res.code}`);
        } catch {
            setError("Kon game niet aanmaken");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20 mb-4">
                    <CardHeader>
                        <CardTitle className="text-3xl text-white text-center">🎮 Nieuw Spel Aanmaken</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Spelers toevoegen */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Spelers ({players.length})</h3>
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        placeholder="Naam"
                                        value={newPlayer}
                                        onChange={(e) => setNewPlayer(e.target.value as PlayerName)}
                                        onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                                        className="bg-slate-900/50 border-purple-500/30 text-white"
                                    />
                                    <Button onClick={addPlayer} className="bg-green-600 hover:bg-green-700">
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {players.map((player) => (
                                        <div key={player} className="flex items-center justify-between bg-slate-900/50 p-3 rounded">
                                            <span className="text-white font-medium">{player}</span>
                                            <Button
                                                onClick={() => removePlayer(player)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Instellingen */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Instellingen</h3>
                                <div className="space-y-4">

                                    <div>
                                        <label className="text-slate-300 text-sm">Aantal imposters</label>
                                        <Input
                                            type="number"
                                            value={settings.imposters}
                                            onChange={(e) => setSettings({ ...settings, imposters: parseInt(e.target.value) })}
                                            className="bg-slate-900/50 border-purple-500/30 text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-slate-300 text-sm">Task tijd (minuten)</label>
                                        <Input
                                            type="number"
                                            value={settings.taskTime}
                                            onChange={(e) => setSettings({ ...settings, taskTime: parseInt(e.target.value) })}
                                            className="bg-slate-900/50 border-purple-500/30 text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-slate-300 text-sm">number of tasks per round</label>
                                        <Input
                                            type="number"
                                            value={settings.tasksPerRound}
                                            onChange={(e) => setSettings({ ...settings, tasksPerRound: parseInt(e.target.value) })}
                                            className="bg-slate-900/50 border-purple-500/30 text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-slate-300 text-sm">Task Template</label>
                                        <select
                                            value={settings.taskTemplate}
                                            onChange={(e) =>
                                                setSettings({ ...settings, taskTemplate: e.target.value })
                                            }
                                            className="bg-slate-900/50 border-purple-500/30 text-white p-2 rounded"
                                        >
                                            <option value="leden">leden</option>
                                            <option value="leiding">leiding</option>
                                        </select>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {error && (
                            <Alert className="mt-4 bg-red-500/10 border-red-500/50 text-red-200">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={createGame}
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-lg py-6"
                            >
                                {loading ? 'Aanmaken...' : 'Start Spel'}
                            </Button>
                            <Button
                                onClick={() => navigate(`/`)}
                                className="bg-slate-700 hover:bg-slate-600 px-8"
                            >
                                Terug
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
