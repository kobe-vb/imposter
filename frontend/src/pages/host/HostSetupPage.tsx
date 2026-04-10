import { api } from "@/api/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CreateGameResponse, GameSettings, PlayerName, Role, Question } from "@/types/types";
import { Plus, Trash2, Move } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Slider } from "@/components/ui/slider";
import { useEffect } from "react";

export default function HostSetupPage() {
    const navigate = useNavigate();

    const [players, setPlayers] = useState<PlayerName[]>([
        "kobe", "mark", "jan", "mama", "papa", "tiboon", "lorenn"
    ]);
    // const [players, setPlayers] = useState<PlayerName[]>([]);
    const [newPlayer, setNewPlayer] = useState<PlayerName>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const [settings, setSettings] = useState<GameSettings>({
        taskTemplate: "leden",
        infoDisplayTime: 5,
        tasksPerRoundMin: 2,
        tasksPerRoundMax: 5,
    });

    const [roles, setRoles] = useState<Role[]>([
        { name: "imposter", count: 3 },
        { name: "cupido", count: 1 },
        { name: "heilend mijske", count: 1 },
    ]);
    const [newRoleName, setNewRoleName] = useState<string>("");
    const [newRoleCount, setNewRoleCount] = useState<number>(1);

    const [questions, setQuestions] = useState<Question[]>([
        { key: "alcohol", question: "Drinkt ge dit spel alcohol?" },
        { key: "bier", question: "Drinkt ge dit spel bier?" },
    ]);
    const [newQuestionKey, setNewQuestionKey] = useState<string>("");
    const [newQuestionText, setNewQuestionText] = useState<string>("");

    const roleNameInputRef = useRef<HTMLInputElement>(null);
    const questionKeyInputRef = useRef<HTMLInputElement>(null);

    const addPlayer = () => {
        if (!newPlayer.trim()) return;
        if (players.find((p) => p === newPlayer)) {
            setError("Speler bestaat al");
            return;
        }
        setPlayers([newPlayer, ...players]);
        setNewPlayer("");
        setError("");
    };

    const removePlayer = (name: string) => {
        setPlayers(players.filter((p) => p !== name));
    };

    const addRole = () => {
        if (!newRoleName.trim()) return;
        setRoles([...roles, { name: newRoleName, count: newRoleCount }]);
        setNewRoleName("");
        setNewRoleCount(1);
        roleNameInputRef.current?.focus();
    };

    const removeRole = (index: number) => {
        setRoles(roles.filter((_, i) => i !== index));
    };

    const addQuestion = () => {
        if (!newQuestionKey.trim() || !newQuestionText.trim()) {
            setError("Vul zowel key als vraag in");
            return;
        }

        // Check of key geen spaties bevat
        if (newQuestionKey.includes(" ")) {
            setError("Key mag geen spaties bevatten. Gebruik underscore (_)");
            return;
        }

        // Check of key al bestaat
        if (questions.find((q) => q.key === newQuestionKey)) {
            setError("Deze key bestaat al");
            return;
        }

        setQuestions([...questions, { key: newQuestionKey, question: newQuestionText }]);
        setNewQuestionKey("");
        setNewQuestionText("");
        setError("");
        questionKeyInputRef.current?.focus();
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newRoles = Array.from(roles);
        const [removed] = newRoles.splice(result.source.index, 1);
        newRoles.splice(result.destination.index, 0, removed);
        setRoles(newRoles);
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
                roles,
                questions,
            });

            navigate(`/host/${res.code}`);
        } catch {
            setError("Kon game niet aanmaken");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setSettings((prev) => {
            let min = prev.tasksPerRoundMin;
            let max = prev.tasksPerRoundMax;

            if (max > players.length) {
                max = players.length;
            }

            if (min > max) {
                min = max;
            }

            return {
                ...prev,
                tasksPerRoundMin: min,
                tasksPerRoundMax: max,
            };
        });
    }, [players.length]);

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
                                        onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                                        className="bg-slate-900/50 border-purple-500/30 text-white"
                                    />
                                    <Button onClick={addPlayer} className="bg-green-600 hover:bg-green-700">
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="space-y-2 max-h-96 overflow-y-auto">
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

                            {/* Roles sectie */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Roles</h3>

                                <div className="mb-4">
                                    <label className="text-slate-300 text-sm">Task Template</label>
                                    <select
                                        value={settings.taskTemplate}
                                        onChange={(e) => setSettings({ ...settings, taskTemplate: e.target.value })}
                                        className="bg-slate-900/50 border-purple-500/30 text-white p-2 rounded w-full"
                                    >
                                        <option value="leden">leden</option>
                                        <option value="leiding">leiding</option>
                                    </select>

                                    <label className="text-slate-300 text-sm mt-2">time to display player info (in seconds)</label>
                                    <Input
                                        type="number"
                                        value={settings.infoDisplayTime}
                                        min={1}
                                        onChange={(e) => setSettings({ ...settings, infoDisplayTime: parseInt(e.target.value) })}
                                        className="bg-slate-900/50 border-purple-500/30 text-white w-full"
                                    />

                                    <label className="text-slate-300 text-sm mt-2">
                                        Tasks per round ({settings.tasksPerRoundMin} - {settings.tasksPerRoundMax})
                                    </label>

                                    <Slider
                                        min={1}
                                        max={players.length}
                                        step={1}
                                        value={[settings.tasksPerRoundMin, settings.tasksPerRoundMax]}
                                        onValueChange={([min, max]) => {
                                            setSettings((prev) => ({
                                                ...prev,
                                                tasksPerRoundMin: min,
                                                tasksPerRoundMax: max,
                                            }));
                                        }}
                                        className="mt-2"
                                    />

                                </div>

                                <div className="flex gap-2 mb-4">
                                    <Input
                                        ref={roleNameInputRef}
                                        placeholder="Role Naam"
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addRole()}
                                        className="bg-slate-900/50 border-purple-500/30 text-white"
                                    />
                                    <Input
                                        type="number"
                                        value={newRoleCount}
                                        min={1}
                                        onChange={(e) => setNewRoleCount(parseInt(e.target.value))}
                                        onKeyDown={(e) => e.key === "Enter" && addRole()}
                                        className="bg-slate-900/50 border-purple-500/30 text-white w-24"
                                    />
                                    <Button onClick={addRole} className="bg-green-600 hover:bg-green-700">
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>

                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="roles">
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="space-y-2 max-h-64 overflow-y-auto"
                                            >
                                                {roles.map((role, index) => (
                                                    <Draggable key={index} draggableId={`role-${index}`} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="flex items-center gap-2 bg-slate-900/50 p-2 rounded"
                                                            >
                                                                <Move className="h-5 w-5 text-purple-400 cursor-move" />
                                                                <Input
                                                                    value={role.name}
                                                                    onChange={(e) => {
                                                                        const newRoles = [...roles];
                                                                        newRoles[index].name = e.target.value;
                                                                        setRoles(newRoles);
                                                                    }}
                                                                    className="bg-slate-900/50 border-purple-500/30 text-white flex-1"
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    value={role.count}
                                                                    min={1}
                                                                    onChange={(e) => {
                                                                        const newRoles = [...roles];
                                                                        newRoles[index].count = parseInt(e.target.value);
                                                                        setRoles(newRoles);
                                                                    }}
                                                                    className="bg-slate-900/50 border-purple-500/30 text-white w-24"
                                                                />
                                                                <Button
                                                                    onClick={() => removeRole(index)}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>
                        </div>

                        {error && (
                            <Alert className="mt-4 bg-red-500/10 border-red-500/50 text-red-200">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="mt-6">
                            <h3 className="text-xl font-bold text-white mb-4">Vragen (Ja/Nee)</h3>
                            <p className="text-slate-400 text-sm mb-3">
                                Deze vragen krijgen spelers bij het begin van het spel. Gebruik dit om later specifieke spelers te kunnen selecteren.
                            </p>

                            <div className="flex gap-2 mb-4">
                                <Input
                                    ref={questionKeyInputRef}
                                    placeholder="Key (bijv. alcohol)"
                                    value={newQuestionKey}
                                    onChange={(e) => setNewQuestionKey(e.target.value.toLowerCase().replace(/ /g, "_"))}
                                    onKeyDown={(e) => e.key === "Enter" && addQuestion()}
                                    className="bg-slate-900/50 border-purple-500/30 text-white w-48"
                                />
                                <Input
                                    placeholder="Vraag (bijv. Drinkt ge alcohol?)"
                                    value={newQuestionText}
                                    onChange={(e) => setNewQuestionText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addQuestion()}
                                    className="bg-slate-900/50 border-purple-500/30 text-white flex-1"
                                />
                                <Button onClick={addQuestion} className="bg-green-600 hover:bg-green-700">
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {questions.map((q, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-slate-900/50 p-3 rounded">
                                        <div className="flex-1">
                                            <span className="text-purple-400 font-mono text-sm">{q.key}</span>
                                            <span className="text-white ml-3">{q.question}</span>
                                        </div>
                                        <Button
                                            onClick={() => removeQuestion(index)}
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

                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={createGame}
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-lg py-6"
                            >
                                {loading ? "Aanmaken..." : "Start Spel"}
                            </Button>
                            <Button onClick={() => navigate(`/`)} className="bg-slate-700 hover:bg-slate-600 px-8">
                                Terug
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}