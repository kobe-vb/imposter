import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

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

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const cursorPos = textarea.selectionStart || 0;
        const textBeforeCursor = value.slice(0, cursorPos);
        
        const lastBraceIndex = textBeforeCursor.lastIndexOf("{");
        
        const textAfterBrace = value.slice(lastBraceIndex + 1);
        const hasClosingBrace = textAfterBrace.includes("}");
        
        if (lastBraceIndex !== -1 && !hasClosingBrace) {
            setShowSuggestions(true);
            setSelectedIndex(0);
        } else {
            setShowSuggestions(false);
        }
    }, [value]);

    const getFilteredSuggestions = () => {
        const textarea = textareaRef.current;
        if (!textarea) return SUGGESTIONS;

        const cursorPos = textarea.selectionStart || 0;
        const textBeforeCursor = value.slice(0, cursorPos);
        const lastBraceIndex = textBeforeCursor.lastIndexOf("{");
        
        if (lastBraceIndex === -1) return SUGGESTIONS;
        
        const searchTerm = textBeforeCursor.slice(lastBraceIndex + 1).toLowerCase();
        
        if (!searchTerm) return SUGGESTIONS;
        
        return SUGGESTIONS.filter(s => 
            s.label.toLowerCase().includes(searchTerm)
        );
    };

    const filteredSuggestions = getFilteredSuggestions();

    const insertSuggestion = (suggestion: typeof SUGGESTIONS[0]) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = value.slice(0, cursorPos);
        const textAfter = value.slice(cursorPos);
        
        const lastBraceIndex = textBeforeCursor.lastIndexOf("{");
        
        const textBefore = value.slice(0, lastBraceIndex);
        const newText = textBefore + suggestion.label + textAfter;
        onChange(newText);
        setShowSuggestions(false);

        setTimeout(() => {
            const newCursorPos = textBefore.length + suggestion.label.length + (suggestion.cursorOffset || 0);
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showSuggestions && filteredSuggestions.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredSuggestions.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
            } else if (e.key === "Tab" || e.key === "Enter") {
                e.preventDefault();
                insertSuggestion(filteredSuggestions[selectedIndex]);
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

    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (showSuggestions && textareaRef.current) {
            const rect = textareaRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;
            
            const showAbove = spaceBelow < 200 && spaceAbove > spaceBelow;
            
            setDropdownStyle({
                position: 'fixed',
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                ...(showAbove 
                    ? { bottom: `${viewportHeight - rect.top + 4}px` }
                    : { top: `${rect.bottom + 4}px` }
                ),
                maxHeight: showAbove ? `${Math.min(300, spaceAbove - 20)}px` : `${Math.min(300, spaceBelow - 20)}px`,
            });
        }
    }, [showSuggestions, value]);

    return (
        <>
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
            </div>

            {/* Autocomplete dropdown - RENDERED AS PORTAL - ALWAYS ON TOP */}
            {showSuggestions && filteredSuggestions.length > 0 && createPortal(
                <div 
                    className="bg-slate-800 border-2 border-blue-500 rounded-lg shadow-2xl overflow-y-auto"
                    style={{
                        ...dropdownStyle,
                        zIndex: 999999,
                    }}
                >
                    {filteredSuggestions.map((suggestion, index) => (
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
                </div>,
                document.body
            )}
        </>
    );
}