import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";
import type { Player } from "@/types/types";

interface PlayerInfoPopoverProps {
  player: Player;
}

export default function PlayerInfoPopover({ player }: PlayerInfoPopoverProps) {
  // Bepaal welke keys aanwezig zijn
  const hasTask = !!player.task;
  const hasCommend = !!player.commend;

  if (!hasTask && !hasCommend) return null; // niks tonen

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-1 hover:bg-slate-700 rounded-full">
          <Info className="h-5 w-5 text-slate-300" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="bg-slate-900 text-white rounded-lg p-4 w-64 flex flex-col gap-3 shadow-lg">
        {/* Task */}
        {hasTask && (
          <div>
            <p className="text-xs font-semibold text-slate-400">Task</p>
            <p className="text-sm text-white">{player.task}</p>
          </div>
        )}

        {/* Commend */}
        {hasCommend && (
          <div>
            <p className="text-xs font-semibold text-slate-400">Commend</p>
            <p className="text-sm text-white">{player.commend}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
