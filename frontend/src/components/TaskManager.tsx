import { useState } from "react";
import { Plus, Trash2, Target } from "lucide-react";
import TaskInput from "./TaskInput";

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
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setError(null);

    const value = newItem.trim();

    if (!value) {
      setError("Item mag niet leeg zijn");
      return;
    }

    try {
      await onAdd(value);
      setNewItem("");
    }
    catch (error: any) {
      const message =
        error?.message?.detail ||
        error?.message ||
        "Er ging iets mis";
      setError(message);
    }
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
        <div className="flex gap-3 mb-4">
          <TaskInput
            value={newItem}
            onChange={(v) => { setNewItem(v); if (error) setError(null); }}
            onSubmit={handleAdd}
            placeholder={placeholder}
          />

          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg self-start"
            style={{ height: "56px" }}
          >
            <Plus className="h-5 w-5" />
            Toevoegen
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-900/20 px-4 py-3 text-red-200">
            <span className="text-red-400 text-lg leading-none">⚠️</span>
            <p className="text-sm leading-snug">
              {error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex items-center justify-between hover:border-slate-600 transition-colors"
            >
              <span className="text-white text-sm break-words flex-1 mr-2">{item}</span>
              <button
                onClick={() => onDelete(item)}
                className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
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