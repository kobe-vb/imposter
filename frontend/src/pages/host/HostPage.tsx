import { useState } from 'react';
import { Home, RefreshCcw, Target, Skull, Users, ListChecks, AlertTriangle} from 'lucide-react';
import { useParams } from 'react-router-dom';
import PlayersWithTasksDisplay from '@/components/PlayersWithTasksDisplay';
import TaskManager from '@/components/TaskManager';
import PlayerCard from '@/components/PlayerCard';
import TaskInput from '@/components/TaskInput';
import { useGameData } from '@/hooks/useGameData';
import { useGameActions } from '@/hooks/useGameActions';
import AnimatedCollapsibleSection from '@/components/AnimatedCollapsibleSection';


export default function HostPage() {
  const { gameCode } = useParams();
  
  const {
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
    refetch
  } = useGameData(gameCode);

  const {
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
    loadingTaskAssign
  } = useGameActions(gameCode);

  const [newTask, setNewTask] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('any');

  const handleSubmitTask = () => {
    submitTaskWithRole(newTask, selectedRole, (updated) => {
      setPlayers(updated);
      setNewTask('');
      setSelectedRole('any');
    });
  };

  const handleAddTask = async (task: string) => {
    await addTask(task, (newTasks) => {
      setAvailableTasks(newTasks);
    });
  };

  const handleDeleteTask = async (task: string) => {
    await deleteTask(task, (newTasks) => {
      setAvailableTasks(newTasks);
    });
  };

  const handleAddHandicap = async (handicap: string) => {
    await addHandicap(handicap, (newHandicaps) => {
      setAvailableHandicaps(newHandicaps);
    });
  };

  const handleDeleteHandicap = async (handicap: string) => {
    await deleteHandicap(handicap, (newHandicaps) => {
      setAvailableHandicaps(newHandicaps);
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-white">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
          >
            Probeer opnieuw
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6">
          <div className="text-center relative">
            <h2 className="text-4xl font-bold text-white mb-1">Game Code</h2>
            <p className="text-6xl font-mono font-bold text-white">{gameCode}</p>
            
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 backdrop-blur border border-green-500/20 rounded-lg p-6 text-center">
            <p className="text-4xl font-bold text-green-400">{gameStats.alive}</p>
            <p className="text-slate-300">Levend</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-red-500/20 rounded-lg p-6 text-center">
            <p className="text-4xl font-bold text-red-400">{gameStats.mafia}</p>
            <p className="text-slate-300">Mafia</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-gray-500/20 rounded-lg p-6 text-center">
            <p className="text-4xl font-bold text-gray-400">{gameStats.dead}</p>
            <p className="text-slate-300">Dood</p>
          </div>
        </div>

        {/* Beschikbare Taken - Collapsible */}
        <AnimatedCollapsibleSection
          title="Beschikbare Taken"
          icon={<ListChecks className="h-5 w-5" />}
          badge={availableTasks.length}
          borderColor="border-blue-500/20"
          titleColor="text-blue-400"
          defaultOpen={false}
        >
          <TaskManager
            items={availableTasks}
            onAdd={handleAddTask}
            onDelete={handleDeleteTask}
            placeholder="Nieuwe taak toevoegen..."
          />
        </AnimatedCollapsibleSection>

        {/* Beschikbare Handicaps - Collapsible */}
        <AnimatedCollapsibleSection
          title="Beschikbare Handicaps"
          icon={<AlertTriangle className="h-5 w-5" />}
          badge={availableHandicaps.length}
          borderColor="border-red-500/20"
          titleColor="text-red-400"
          defaultOpen={false}
        >
          <TaskManager
            items={availableHandicaps}
            onAdd={handleAddHandicap}
            onDelete={handleDeleteHandicap}
            placeholder="Nieuwe handicap toevoegen..."
          />
        </AnimatedCollapsibleSection>

        {/* New Round Button */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-4">
          <button
            onClick={() => newRound(setPlayers)}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Laden...' : 'Nieuwe Ronde'}
          </button>
        </div>

        {/* New Task Section */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
          <TaskInput
            value={newTask}
            onChange={setNewTask}
            placeholder="Voer taak in..."
            onSubmit={handleSubmitTask}
          />

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-700/50 border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <button
            onClick={handleSubmitTask}
            disabled={loadingTaskAssign}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loadingTaskAssign ? 'Bezig...' : 'Submit'}
          </button>
        </div>

        {/* Taken Deze Ronde - Collapsible */}
        <AnimatedCollapsibleSection
          title="Taken Deze Ronde"
          icon={<Target className="h-5 w-5" />}
          badge={gameStats.numberOfTasksAssigned}
          borderColor="border-yellow-500/20"
          titleColor="text-yellow-400"
          defaultOpen={false}
        >
          <PlayersWithTasksDisplay
            players={players}
            showAlive={true}
            titleColor="text-yellow-400"
            cardBorderColor="border-yellow-500/30"
            taskBgColor="bg-yellow-900/20"
            taskBorderColor="border-yellow-500/20"
            taskTextColor="text-yellow-200"
          />
        </AnimatedCollapsibleSection>

        {/* Handicaps - Collapsible */}
        <AnimatedCollapsibleSection
          title="Handicaps Dode Spelers"
          icon={<Skull className="h-5 w-5" />}
          badge={gameStats.dead}
          borderColor="border-red-500/20"
          titleColor="text-red-400"
          defaultOpen={false}
        >
          <PlayersWithTasksDisplay
            players={players}
            showAlive={false}
            titleColor="text-red-400"
            cardBorderColor="border-red-500/30"
            taskBgColor="bg-red-900/20"
            taskBorderColor="border-red-500/20"
            taskTextColor="text-red-200"
          />
        </AnimatedCollapsibleSection>

        {/* Alle Spelers - Collapsible */}
        <AnimatedCollapsibleSection
          title="Spelers Beheer"
          icon={<Users className="h-5 w-5" />}
          badge={players.length}
          borderColor="border-purple-500/20"
          titleColor="text-purple-400"
          defaultOpen={true}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((player) => (
              <PlayerCard
                key={player.name}
                player={player}
                onKill={(name) => killPlayer(name, setPlayers)}
                onRevive={(name) => revivePlayer(name, setPlayers)}
                onAssignTask={(name, task) => assignCustomTask(name, task, setPlayers)}
                onChangeRole={(name, role) => assignRole(name, role, setPlayers)}
              />
            ))}
          </div>
        </AnimatedCollapsibleSection>

        {/* Reset Button */}
        <button
          onClick={() => resetGame(refetch)}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCcw className="h-5 w-5" />
          Reset Game
        </button>

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