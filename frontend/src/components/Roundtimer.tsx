import { useEffect, useRef, useState } from "react";
import { Play, Square, RotateCcw, Timer } from "lucide-react";
import AnimatedCollapsibleSection from "./AnimatedCollapsibleSection";

function speak(text: string, audioRef: React.RefObject<HTMLAudioElement | null>) {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1.1;
  if (audioRef.current) audioRef.current.volume = 0.2;
  utterance.onend = () => {
    if (audioRef.current) audioRef.current.volume = 1;
  };
  speechSynthesis.speak(utterance);
}

interface RoundTimerProps {
  duration?: number; // in seconds
}

export default function RoundTimer({ duration = 300 }: RoundTimerProps) {
  const [customDuration, setCustomDuration] = useState(duration);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firedCuesRef = useRef<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement | null>(null);

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    if (audioRef.current) audioRef.current.pause();
    speechSynthesis.cancel();
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft(customDuration);
    setFinished(false);
    firedCuesRef.current = new Set();
  };

  const startTimer = () => {
    if (running) return;
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    setRunning(true);
    setFinished(false);
  };

  const handleTimerClick = () => {
    if (running) return;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    setEditValue(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  const commitEdit = () => {
    setEditing(false);
    const parts = editValue.split(":");
    let totalSeconds = 0;

    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10);
      const secs = parseInt(parts[1], 10);
      if (!isNaN(mins) && !isNaN(secs) && secs < 60) {
        totalSeconds = mins * 60 + secs;
      }
    } else if (parts.length === 1) {
      // Allow plain number input as minutes
      const mins = parseInt(parts[0], 10);
      if (!isNaN(mins)) {
        totalSeconds = mins * 60;
      }
    }

    if (totalSeconds > 0) {
      setCustomDuration(totalSeconds);
      setTimeLeft(totalSeconds);
      setFinished(false);
      firedCuesRef.current = new Set();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(false);
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (!running) return;

    if (timeLeft <= 0) {
      stopTimer();
      setFinished(true);
      speak("Stop. Come back.", audioRef);
      return;
    }

    if (timeLeft % 60 === 0 && timeLeft > 60 && !firedCuesRef.current.has(timeLeft) && timeLeft !== customDuration) {
      firedCuesRef.current.add(timeLeft);
      speak(`${timeLeft / 60} minutes left`, audioRef);
    }
    if (timeLeft === 60 && !firedCuesRef.current.has(60)) {
      firedCuesRef.current.add(60);
      speak("One minute left", audioRef);
    }
    if (timeLeft === 30 && !firedCuesRef.current.has(30)) {
      firedCuesRef.current.add(30);
      speak("Thirty seconds left", audioRef);
    }
    if (timeLeft <= 10 && timeLeft > 0 && !firedCuesRef.current.has(timeLeft)) {
      firedCuesRef.current.add(timeLeft);
      speak(timeLeft.toString(), audioRef);
    }
  }, [timeLeft, running]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      speechSynthesis.cancel();
    };
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = timeLeft / customDuration;

  const isLow = timeLeft <= 30 && timeLeft > 0;
  const isVeryLow = timeLeft <= 10 && timeLeft > 0;

  const progressColor = finished
    ? "bg-gray-500"
    : isVeryLow
    ? "bg-red-500"
    : isLow
    ? "bg-orange-500"
    : "bg-blue-500";

  const timeColor = finished
    ? "text-gray-400"
    : isVeryLow
    ? "text-red-400"
    : isLow
    ? "text-orange-400"
    : "text-white";

  const pulseClass = isVeryLow && running ? "animate-pulse" : "";

  return (
    <AnimatedCollapsibleSection
      title="Ronde Timer"
      icon={<Timer className="h-5 w-5" />}
      borderColor="border-blue-500/20"
      titleColor="text-blue-400"
      defaultOpen={false}
    >
      <div className="space-y-4">
        {/* Timer display */}
        <div className="text-center">
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleEditKeyDown}
              className="text-7xl font-mono font-bold tabular-nums text-center bg-transparent border-b-2 border-blue-400 text-white outline-none w-56"
              placeholder="MM:SS"
              autoFocus
            />
          ) : (
            <span
              onClick={handleTimerClick}
              title={!running ? "Klik om tijd aan te passen" : undefined}
              className={`text-7xl font-mono font-bold tabular-nums transition-colors duration-300 ${timeColor} ${pulseClass} ${
                !running ? "cursor-pointer hover:opacity-70" : "cursor-default"
              }`}
            >
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          )}
          {!running && !editing && !finished && (
            <p className="text-gray-500 mt-1 text-xs">Klik op de timer om de tijd aan te passen</p>
          )}
          {finished && (
            <p className="text-gray-400 mt-2 text-sm font-semibold uppercase tracking-widest">
              Ronde voorbij
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${progressColor}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Controls: Start/Stop | Reset */}
        <div className="flex gap-3">
          {!running ? (
            <button
              onClick={startTimer}
              disabled={finished || timeLeft <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Play className="h-5 w-5" />
              Start Timer
            </button>
          ) : (
            <button
              onClick={stopTimer}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Square className="h-5 w-5" />
              Stop
            </button>
          )}

          <button
            onClick={resetTimer}
            className="bg-slate-600 hover:bg-slate-500 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Hidden audio - vervang src met jouw muziekbestand */}
      <audio ref={audioRef} src="/music/timer.mp3" loop preload="auto" />
    </AnimatedCollapsibleSection>
  );
}