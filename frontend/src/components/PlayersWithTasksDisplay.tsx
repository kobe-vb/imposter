import type { Player } from '@/types/types';
import PlayerTaskCard from './PlayerTaskCard';

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
  showAlive = true,
}: PlayersWithTasksDisplayProps) {
  const filteredPlayers = players.filter(p => p.task && p.alive === showAlive);

  if (filteredPlayers.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredPlayers.map((player) => (
        <PlayerTaskCard
          key={player.name}
          player={player}
          titleColor={titleColor}
          cardBorderColor={cardBorderColor}
          taskBgColor={taskBgColor}
          taskBorderColor={taskBorderColor}
          taskTextColor={taskTextColor}
          showAlive={showAlive}
        />
      ))}
    </div>
  );
}