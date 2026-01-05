import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_WS;

type MonitorEvent = {
    player: string;
    timestamp: string;
    color: string;
};

const COLORS = [
    "bg-purple-600",
    "bg-blue-600",
    "bg-green-600",
    "bg-pink-600",
    "bg-orange-600",
    "bg-red-600",
    "bg-indigo-600",
];

const getRandomColor = () =>
    COLORS[Math.floor(Math.random() * COLORS.length)];


export default function HostMonitorPage() {
    const { gameCode } = useParams<{ gameCode: string }>();
    const [events, setEvents] = useState<MonitorEvent[]>([]);

    useEffect(() => {
        if (!gameCode) return;

        const ws = new WebSocket(`${API_BASE}/ws/game/${gameCode}/monitor`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            const newEvent: MonitorEvent = {
                player: data.player,
                timestamp: data.timestamp,
                color: getRandomColor(),
            };

            setEvents(prev =>
                [newEvent, ...prev].slice(0, 20)
            );
        };

        return () => ws.close();
    }, [gameCode]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-4 text-center">
                    Live Monitor
                </h2>

                <section className="bg-black/40 rounded-xl p-4 space-y-2">
                    {events.map((e, i) => (
                        <div
                            key={i}
                            className={`flex justify-between items-center rounded-lg px-4 py-2 text-white ${e.color}`}
                        >
                            <span className="font-semibold">
                                {e.player}
                            </span>

                            <span className="text-sm opacity-80">
                                {new Date(e.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}
