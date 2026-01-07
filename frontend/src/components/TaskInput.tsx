import { useState, useRef, useEffect } from "react";

interface TaskInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
}

const SUGGESTIONS = [
    { label: "{player}", detail: "Random speler" },
    { label: "{player:alive}", detail: "Levende speler" },
    { label: "{player:dead}", detail: "Dode speler" },
    { label: '{? "", "" }', detail: "Random keuze", cursorOffset: -7 },
    { label: '{self}', detail: "gekoze speler"},
];

export default function TaskInput({ value, onChange, onSubmit, placeholder }: TaskInputProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Check for { to show suggestions
    useEffect(() => {
        const cursorPos = textareaRef.current?.selectionStart || 0;
        const textBeforeCursor = value.slice(0, cursorPos);
        const lastChar = textBeforeCursor[textBeforeCursor.length - 1];

        setShowSuggestions(lastChar === "{");
        setSelectedIndex(0);
    }, [value]);

    const insertSuggestion = (suggestion: typeof SUGGESTIONS[0]) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const cursorPos = textarea.selectionStart;
        const textBefore = value.slice(0, cursorPos - 1); // Remove the {
        const textAfter = value.slice(cursorPos);

        const newText = textBefore + suggestion.label + textAfter;
        onChange(newText);
        setShowSuggestions(false);

        // Set cursor position
        setTimeout(() => {
            const newCursorPos = textBefore.length + suggestion.label.length + (suggestion.cursorOffset || 0);
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showSuggestions) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % SUGGESTIONS.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + SUGGESTIONS.length) % SUGGESTIONS.length);
            } else if (e.key === "Tab" || e.key === "Enter") {
                e.preventDefault();
                insertSuggestion(SUGGESTIONS[selectedIndex]);
                return;
            } else if (e.key === "Escape") {
                setShowSuggestions(false);
            }
        }

        if (e.key === "Enter" && !e.shiftKey && !showSuggestions) {
            e.preventDefault();
            onSubmit();
        }
    };

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = 'auto';
        target.style.height = Math.max(56, target.scrollHeight) + 'px';
    };

    return (
        <div className="flex-1 relative">
            {/* Actual textarea */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                placeholder={placeholder}
                className="relative w-full rounded-lg border border-slate-600 bg-slate-900 p-3 text-white text-base leading-6 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent overflow-auto"
                style={{
                    fontFamily: 'ui-monospace, monospace',
                    minHeight: '56px',
                    caretColor: '#38bdf8',
                }}
                rows={1}
            />

            {/* Autocomplete dropdown */}
            {showSuggestions && (
                <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
                    {SUGGESTIONS.map((suggestion, index) => (
                        <div
                            key={index}
                            className={`px-4 py-3 cursor-pointer transition-colors ${
                                index === selectedIndex
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-slate-700 text-slate-200"
                            }`}
                            onClick={() => insertSuggestion(suggestion)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div className="font-mono font-semibold">{suggestion.label}</div>
                            <div className="text-xs opacity-75">{suggestion.detail}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
