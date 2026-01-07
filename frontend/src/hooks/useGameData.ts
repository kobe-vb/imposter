import { api } from "@/api/api";
import type { Player } from "@/types/types";
import { useEffect, useMemo, useState } from "react";

export function useGameData(gameCode: string | undefined) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [availableTasks, setAvailableTasks] = useState<string[]>([]);
    const [availableHandicaps, setAvailableHandicaps] = useState<string[]>([]);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const gameStats = useMemo(() => ({
        alive: players.filter(p => p.alive).length,
        dead: players.filter(p => !p.alive).length,
        mafia: players.filter(p => p.role === 'imposter' && p.alive).length,
        alivePlayers: players.filter(p => p.alive),
        deadPlayers: players.filter(p => !p.alive),
        numberOfTasksAssigned: players.filter(p => p.alive && p.task !== null).length
    }), [players]);

    const fetchInitialData = async () => {
        if (!gameCode) return;

        setLoading(true);
        setError(null);

        try {
            const [playersData, tasksData, handicapsData, rolesData] = await Promise.all([
                api.get<Player[]>(`/game/${gameCode}/players`),
                api.get<string[]>(`/game/${gameCode}/tasks`),
                api.get<string[]>(`/game/${gameCode}/handicaps`),
                api.get<string[]>(`/game/${gameCode}/roles`)
            ]);

            setPlayers(playersData);
            setAvailableTasks(tasksData);
            setAvailableHandicaps(handicapsData);
            setAvailableRoles(rolesData);
        } catch (err) {
            setError('Fout bij het laden van data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [gameCode]);

    return {
        players,
        setPlayers,
        availableTasks,
        setAvailableTasks,
        availableHandicaps,
        setAvailableHandicaps,
        availableRoles,
        loading,
        error,
        gameStats,
        refetch: fetchInitialData
    };
}
