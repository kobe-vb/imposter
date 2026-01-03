import { useState, useEffect } from 'react';
import { Home, Skull, Plus, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { Player } from '@/types/types';
import { api } from '@/api/api';
import PlayersWithTasksDisplay from '@/components/PlayersWithTasksDisplay';
import TaskManager from '@/components/TaskManager';

export default function HostPage() {
  const { gameCode } = useParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [availableTasks, setAvailableTasks] = useState<string[]>([]);
  const [availableHandicaps, setAvailableHandicaps] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [customTask, setCustomTask] = useState<string>("");

  const alivePlayers = players.filter(p => p.alive).length;
  const deadPlayers = players.filter(p => !p.alive).length;
  const mafia = players.filter(p => p.role === 'imposter' && p.alive).length;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const players: Player[] = await api.get(`/game/${gameCode}/players`);
      const tasks: string[] = await api.get(`/game/${gameCode}/tasks`);
      const handicaps: string[] = await api.get(`/game/${gameCode}/handicaps`);

      setPlayers(players);
      setAvailableTasks(tasks);
      setAvailableHandicaps(handicaps);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const killPlayer = async (name: string) => {
    try {
      const updated: Player[] = await api.del(`/game/${gameCode}/player/${name}/kill`);
      setPlayers(updated);
    } catch (error) {
      console.error('Error killing player:', error);
    }
  };

  const revivePlayer = async (player: string) => {
    try {
      const updated: Player[] = await api.post(`/game/${gameCode}/player/revive`, { name: player });
      setPlayers(updated);
    } catch (error) {
      console.error('Error reviving player:', error);
    }
  };

  const newRound = async () => {
    setLoading(true);
    try {
      const players: Player[] = await api.get(`/game/${gameCode}/round/new`);
      setPlayers(players);
    } catch (error) {
      console.error('Error starting new round:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: string) => {
    try {
      await api.post(`/game/${gameCode}/task`, { task });
      setAvailableTasks([...availableTasks, task]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const deleteTask = async (task: string) => {
    try {
      await api.del(`/game/${gameCode}/task/${encodeURIComponent(task)}`);
      setAvailableTasks(availableTasks.filter(t => t !== task));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const addHandicap = async (handicap: string) => {
    try {
      await api.post(`/game/${gameCode}/handicap`, { task: handicap });
      setAvailableHandicaps([...availableHandicaps, handicap]);
    } catch (error) {
      console.error('Error adding handicap:', error);
    }
  };

  const deleteHandicap = async (handicap: string) => {
    try {
      await api.del(`/game/${gameCode}/handicap/${encodeURIComponent(handicap)}`);
      setAvailableHandicaps(availableHandicaps.filter(h => h !== handicap));
    } catch (error) {
      console.error('Error deleting handicap:', error);
    }
  };

  const assignCustomTask = async (playerName: string) => {
    if (!customTask.trim()) return;

    try {
      const updated: Player[] = await api.post(`/game/${gameCode}/player/${playerName}/task`, { task: customTask });
      setPlayers(updated);
      setEditingPlayer(null);
      setCustomTask("");
    } catch (error) {
      console.error('Error assigning task:', error);
    } finally {
      setEditingPlayer(null);
      setCustomTask("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header met game code */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-1">Game Code</h2>
            <p className="text-6xl font-mono font-bold text-white">{gameCode}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 backdrop-blur border border-green-500/20 rounded-lg p-6 text-center">
            <p className="text-4xl font-bold text-green-400">{alivePlayers}</p>
            <p className="text-slate-300">Levend</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-red-500/20 rounded-lg p-6 text-center">
            <p className="text-4xl font-bold text-red-400">{mafia}</p>
            <p className="text-slate-300">Mafia</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-gray-500/20 rounded-lg p-6 text-center">
            <p className="text-4xl font-bold text-gray-400">{deadPlayers}</p>
            <p className="text-slate-300">Dood</p>
          </div>
        </div>

        {/* Beschikbare Taken */}
        <TaskManager
          title="Beschikbare Taken"
          items={availableTasks}
          onAdd={addTask}
          onDelete={deleteTask}
          placeholder="Nieuwe taak toevoegen..."
          borderColor="border-blue-500/20"
          titleColor="text-blue-400"
        />

        {/* Beschikbare Handicaps */}
        <TaskManager
          title="Beschikbare Handicaps"
          items={availableHandicaps}
          onAdd={addHandicap}
          onDelete={deleteHandicap}
          placeholder="Nieuwe handicap toevoegen..."
          borderColor="border-red-500/20"
          titleColor="text-red-400"
        />

        {/* New Round Button */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-4">
          <button
            onClick={newRound}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Laden...' : 'Nieuwe Ronde'}
          </button>
        </div>

        {/* Taken Deze Ronde - Levende Spelers */}
        <PlayersWithTasksDisplay
          players={players}
          title="Taken Deze Ronde"
          icon="target"
          showAlive={true}
          borderColor="border-yellow-500/20"
          titleColor="text-yellow-400"
          cardBorderColor="border-yellow-500/30"
          taskBgColor="bg-yellow-900/20"
          taskBorderColor="border-yellow-500/20"
          taskTextColor="text-yellow-200"
        />

        {/* Handicaps - Dode Spelers */}
        <PlayersWithTasksDisplay
          players={players}
          title="Handicaps Dode Spelers"
          icon="skull"
          showAlive={false}
          borderColor="border-red-500/20"
          titleColor="text-red-400"
          cardBorderColor="border-red-500/30"
          taskBgColor="bg-red-900/20"
          taskBorderColor="border-red-500/20"
          taskTextColor="text-red-200"
        />

        {/* Alle Spelers */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-xl font-bold text-white">Spelers Beheer</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {players.map((player) => (
                <div
                  key={player.name}
                  className={`border rounded-lg p-4 ${
                    player.alive
                      ? 'bg-slate-900/50 border-slate-700'
                      : 'bg-gray-800/30 border-gray-700'
                  }`}
                >
                  <div className="mb-3">
                    <p
                      className={`text-base font-bold truncate ${
                        player.alive ? 'text-white' : 'text-gray-500 line-through'
                      }`}
                    >
                      {player.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {player.role || 'burger'}
                    </p>
                  </div>

                  {editingPlayer === player.name ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customTask}
                        onChange={(e) => setCustomTask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && assignCustomTask(player.name)}
                        placeholder="Taak..."
                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => assignCustomTask(player.name)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs font-medium transition-colors"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingPlayer(null);
                            setCustomTask("");
                          }}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 rounded text-xs font-medium transition-colors"
                        >
                          <X className="h-3 w-3 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {player.alive ? (
                        <>
                          <button
                            onClick={() => killPlayer(player.name)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <Skull className="h-4 w-4" />
                            Kill
                          </button>
                          <button
                            onClick={() => setEditingPlayer(player.name)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            Taak
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => revivePlayer(player.name)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                        >
                          ❤️ Revive
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Home Button */}
        <button
          onClick={() => (window.location.href = '/')}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Home className="h-5 w-5" />
          Nieuw Spel
        </button>
      </div>
    </div>
  );
}