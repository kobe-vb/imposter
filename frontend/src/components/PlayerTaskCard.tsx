import { useState } from 'react';
import type { Player } from '@/types/types';

interface PlayerCardProps {
  player: Player;
  cardBorderColor?: string;
  taskBgColor?: string;
  taskBorderColor?: string;
  taskTextColor?: string;
  titleColor?: string;
  showAlive?: boolean;
}

export default function PlayerTaskCard({
  player,
  cardBorderColor = "border-yellow-500/30",
  taskBgColor = "bg-yellow-900/20",
  taskBorderColor = "border-yellow-500/20",
  taskTextColor = "text-yellow-200",
  titleColor = "text-yellow-400",
  showAlive = true,
}: PlayerCardProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div className={`bg-slate-900/70 border ${cardBorderColor} rounded-lg p-4`}>
      <div className="mb-3">
        <p className={`text-lg font-bold text-white`}>
          {player.name}
        </p>
        <p className={`text-sm ${titleColor} font-semibold`}>
          {player.role || 'burger'}
        </p>
      </div>

{showAlive && (
      <div className={`${taskBgColor} p-3 rounded border ${taskBorderColor}`}>
        
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => setChecked(prev => !prev)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-yellow-400 cursor-pointer"
          />
          <p className={`text-sm ${taskTextColor} ${checked ? 'line-through opacity-50' : ''} transition-all`}>
            {player.task}
          </p>
        </label> 
      </div> )}
  {!showAlive && (
    <div className={`text-sm ${taskTextColor}`}>
      {player.task}
    </div>
  )}
    </div>
  );
}