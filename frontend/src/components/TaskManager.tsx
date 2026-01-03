import { useState } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';

interface TaskManagerProps {
  title: string;
  items: string[];
  onAdd: (item: string) => Promise<void>;
  onDelete: (item: string) => Promise<void>;
  placeholder?: string;
  borderColor?: string;
  titleColor?: string;
}

export default function TaskManager({
  title,
  items,
  onAdd,
  onDelete,
  placeholder = "Nieuwe item toevoegen...",
  borderColor = "border-blue-500/20",
  titleColor = "text-blue-400"
}: TaskManagerProps) {
  const [newItem, setNewItem] = useState<string>("");

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await onAdd(newItem);
    setNewItem("");
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur border ${borderColor} rounded-lg`}>
      <div className="p-6 border-b border-slate-700">
        <h3 className={`text-xl font-bold ${titleColor} flex items-center gap-2`}>
          <Target className="h-5 w-5" />
          {title}
        </h3>
      </div>
      <div className="p-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={placeholder}
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Toevoegen
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex items-center justify-between"
            >
              <span className="text-white text-sm">{item}</span>
              <button
                onClick={() => onDelete(item)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}