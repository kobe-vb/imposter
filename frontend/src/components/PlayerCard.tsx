import { useState } from 'react';
import { Skull, Plus, X, Repeat } from 'lucide-react';
import type { Player } from '@/types/types';

type EditMode = 'task' | 'role' | null;

interface PlayerCardProps {
  player: Player;
  onKill: (name: string) => void;
  onRevive: (name: string) => void;
  onAssignTask: (name: string, task: string) => void;
  onChangeRole: (name: string, role: string) => void;
}

export default function PlayerCard({
  player,
  onKill,
  onRevive,
  onAssignTask,
  onChangeRole
}: PlayerCardProps) {
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [value, setValue] = useState('');

  const handleConfirm = () => {
    if (!value.trim()) return;

    if (editMode === 'task') {
      onAssignTask(player.name, value);
    }
    else if (editMode === 'role') {
      onChangeRole(player.name, value);
    }

    setEditMode(null);
    setValue('');
  };

  const handleCancel = () => {
    setEditMode(null);
    setValue('');
  };

  const isEditing = editMode !== null;

  return (
    <div
      className={`border rounded-lg p-4 min-h-[220px] flex flex-col justify-center ${
        player.alive
          ? 'bg-slate-900/50 border-slate-700'
          : 'bg-gray-800/30 border-gray-700'
      }`}
    >
      {/* PLAYER INFO */}
      <div className="text-center mb-4">
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

      {/* EDIT MODE (TASK / ROLE) */}
      {isEditing && (
        <div className="flex flex-col items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            placeholder={editMode === 'task' ? 'Taak...' : 'Rol...'}
            className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
            autoFocus
          />

          <div className="flex gap-2 w-full">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded text-sm font-medium"
            >
              ✓
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-1 rounded text-sm font-medium"
            >
              <X className="h-4 w-4 mx-auto" />
            </button>
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      {!isEditing && (
        <div className="flex flex-col gap-2 justify-center flex-1">
          {player.alive ? (
            <>
              <button
                onClick={() => onKill(player.name)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
              >
                <Skull className="h-4 w-4" />
                Kill
              </button>

              <button
                onClick={() => setEditMode('task')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Taak
              </button>

              <button
                onClick={() => setEditMode('role')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
              >
                <Repeat className="h-4 w-4" />
                Change role
              </button>
            </>
          ) : (
            <div className="flex justify-center items-center flex-1">
              <button
                onClick={() => onRevive(player.name)}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg text-sm font-medium"
              >
                ❤️ Revive
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
