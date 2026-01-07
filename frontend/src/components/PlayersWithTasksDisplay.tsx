import type { Player } from '@/types/types';

interface PlayersWithTasksDisplayProps {
  players: Player[];
  titleColor?: string;
  cardBorderColor?: string;
  taskBgColor?: string;
  taskBorderColor?: string;
  taskTextColor?: string;
  showAlive?: boolean;
}

export default function PlayersWithTasksDisplay({
  players,
  titleColor = "text-yellow-400",
  cardBorderColor = "border-yellow-500/30",
  taskBgColor = "bg-yellow-900/20",
  taskBorderColor = "border-yellow-500/20",
  taskTextColor = "text-yellow-200",
  showAlive = true
}: PlayersWithTasksDisplayProps) {
  const filteredPlayers = players.filter(p => p.task && p.alive === showAlive);

  if (filteredPlayers.length === 0) return null;

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredPlayers.map((player) => (
        <div
          key={player.name}
          className={`bg-slate-900/70 border ${cardBorderColor} rounded-lg p-4`}
        >
          <div className="mb-3">
            <p className={`text-lg font-bold ${showAlive ? 'text-white' : 'text-gray-400 line-through'}`}>
              {player.name}
            </p>
            <p className={`text-sm ${titleColor} font-semibold`}>
              {player.role || 'burger'}
            </p>
          </div>
          <div className={`${taskBgColor} p-3 rounded border ${taskBorderColor}`}>
            <p className={`text-sm ${taskTextColor}`}>
              <span className="font-semibold">
                {showAlive ? 'Taak:' : 'Handicap:'}
              </span> {player.task}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}