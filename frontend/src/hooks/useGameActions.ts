import { api } from '@/api/api';
import type { Player } from '@/types/types';
import { useState } from 'react';

export function useGameActions(gameCode: string | undefined) {
    const [loadingTaskAssign, setLoadingTaskAssign] = useState(false);

    const submitTaskWithRole = async (
        task: string,
        role: string,
        onSuccess: (players: Player[]) => void
    ) => {
        if (!gameCode || !task.trim()) {
            alert('Voer een taak in!');
            return;
        }

        setLoadingTaskAssign(true);
        try {
            const updated: Player[] = await api.post(`/tasks/${gameCode}/assign/random`, {
                task,
                role
            });
            onSuccess(updated);
        } catch (error) {
            console.error('Error assigning task:', error);
        } finally {
            setLoadingTaskAssign(false);
        }
    };

    const resetGame = async (onSuccess: () => void) => {
        if (!gameCode) return;

        const confirm = window.confirm('Zijt ge zeker dat ge het spel wilt resetten?');
        if (!confirm) return;

        try {
            await api.post(`/game/${gameCode}/reset`, {});
            onSuccess();
        } catch (error) {
            console.error('Error resetting game:', error);
        }
    };

    const killPlayer = async (name: string, onSuccess: (players: Player[]) => void) => {
        if (!gameCode) return;

        try {
            const updated: Player[] = await api.del(`/player/${gameCode}/${name}/kill`);
            onSuccess(updated);
        } catch (error) {
            console.error('Error killing player:', error);
        }
    };

    const revivePlayer = async (name: string, onSuccess: (players: Player[]) => void) => {
        if (!gameCode) return;

        try {
            const updated: Player[] = await api.post(`/player/${gameCode}/revive`, { name });
            onSuccess(updated);
        } catch (error) {
            console.error('Error reviving player:', error);
        }
    };

    const newRound = async (onSuccess: (players: Player[]) => void) => {
        if (!gameCode) return;

        try {
            const players: Player[] = await api.get(`/game/${gameCode}/round/new`);
            onSuccess(players);
        } catch (error) {
            console.error('Error starting new round:', error);
        }
    };

    const addTask = async (task: string, onSuccess: (tasks: string[]) => void) => {
        if (!gameCode || !task.trim()) {
            throw new Error("Taak mag niet leeg zijn");
        }

        try {
            const tasks: string[] = await api.post(`/tasks/${gameCode}`, { task });
            onSuccess(tasks);
        } catch (error) {
            throw error;
        }
    };

    const deleteTask = async (task: string, onSuccess: (tasks: string[]) => void) => {
        if (!gameCode) return;

        try {
            const tasks: string[] = await api.del(`/tasks/${gameCode}/${encodeURIComponent(task)}`);
            onSuccess(tasks);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const addHandicap = async (handicap: string, onSuccess: (handicaps: string[]) => void) => {
        if (!gameCode || !handicap.trim()) {
            throw new Error("Handicap mag niet leeg zijn");
        }

        try {
            const handicaps: string[] = await api.post(`/handicaps/${gameCode}`, { task: handicap });
            onSuccess(handicaps);
        } catch (error) {
            throw error;
        }
    };

    const deleteHandicap = async (handicap: string, onSuccess: (handicaps: string[]) => void) => {
        if (!gameCode) return;

        try {
            const handicaps: string[] = await api.del(`/handicaps/${gameCode}/${encodeURIComponent(handicap)}`);
            onSuccess(handicaps);
        } catch (error) {
            console.error('Error deleting handicap:', error);
        }
    };

    const assignCustomTask = async (
        playerName: string,
        customTask: string,
        onSuccess: (players: Player[]) => void
    ) => {
        if (!gameCode || !customTask.trim()) return;

        try {
            const updated: Player[] = await api.post(
                `/player/${gameCode}/${playerName}/task`,
                { task: customTask }
            );
            onSuccess(updated);
        } catch (error) {
            console.error('Error assigning task:', error);
        }
    };

    const assignCommend = async (
        playerName: string,
        commend: string,
        onSuccess: (players: Player[]) => void
    ) => {
        if (!gameCode || !commend.trim()) return;

        try {
            const updated: Player[] = await api.post(
                `/player/${gameCode}/${playerName}/commend`,
                { commend }
            );
            onSuccess(updated);
        } catch (error) {
            console.error('Error assigning commend:', error);
        }
    };

    const assignRole = async (
        playerName: string,
        role: string,
        onSuccess: (players: Player[]) => void
    ) => {
        if (!gameCode) return;

        try {
            const updated: Player[] = await api.post(
                `/player/${gameCode}/${playerName}/role`,
                { role }
            );
            onSuccess(updated);
        } catch (error) {
            console.error('Error assigning role:', error);
        }
    };

    return {
        submitTaskWithRole,
        resetGame,
        killPlayer,
        revivePlayer,
        newRound,
        addTask,
        deleteTask,
        addHandicap,
        deleteHandicap,
        assignCustomTask,
        assignRole,
        assignCommend,
        loadingTaskAssign
    };
}
