import { api } from "@/api/api";
import { Card, CardContent } from "@/components/ui/card";
import type { Player } from "@/types/types";
import type { Question } from "@/types/types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PlayerInfoPage() {
  const { gameCode, playerName } = useParams<{ gameCode: string; playerName: string }>();
  const navigate = useNavigate();

  const [timer, setTimer] = useState(5);
  const [player, setPlayer] = useState<Player | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Haal player info op
  useEffect(() => {
    if (!playerName) {
      navigate(`/players/${gameCode}`);
      return;
    }

    const fetchPlayer = async () => {
      try {
        const data: Player = await api.get(`/player/${gameCode}/${playerName}/info`);
        setPlayer(data);

        if (data.haveVoted === false) {
          setLoadingQuestions(true);
          const qData: Question[] = await api.get(`/game/${gameCode}/questions`);
          setQuestions(qData);
          setLoadingQuestions(false);
          if (qData.length === 0) {
            setTimer(5);
            setPlayer({ ...data, haveVoted: true });
          }
        } else {
          setTimer(5); // start de normale countdown
        }
      } catch (err) {
        console.error("Failed to fetch player info", err);
      }
    };

    fetchPlayer();
  }, [playerName, gameCode, navigate]);

  // Timer voor normale display
  useEffect(() => {
    if (!player || player.haveVoted === false) return; // timer alleen als player al gestemd heeft
    if (timer <= 0) {
      navigate(`/players/${gameCode}`);
      return;
    }

    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, navigate, gameCode, player]);

  if (!player) return null;

  // Handle checkbox change
  const toggleQuestion = (key: string) => {
    setSelectedQuestions((prev) => {
      const copy = new Set(prev);
      if (copy.has(key)) copy.delete(key);
      else copy.add(key);
      return copy;
    });
  };

  // Handle submit van vragen
  const submitVotes = async () => {
    if (!playerName || !gameCode) return;
    try {
      await api.post(`/player/${gameCode}/${playerName}/questions`, {
        questions: Array.from(selectedQuestions),
      });
      // Update player om normale display te tonen
      setPlayer({ ...player, haveVoted: true });
      setTimer(5);
    } catch (err) {
      console.error("Failed to submit questions", err);
    }
  };

  // Als de speler nog moet stemmen
  if (player.haveVoted === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/30 backdrop-blur-lg shadow-lg rounded-2xl border border-white/10">
          <CardContent className="text-center p-8 text-white space-y-6">
            <h2 className="text-2xl font-bold mb-4">Stem op de vragen</h2>
            {loadingQuestions ? (
              <p>Loading questions...</p>
            ) : (
              <div className="space-y-4 text-left">
                {questions.map((q) => (
                  <label key={q.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.has(q.key)}
                      onChange={() => toggleQuestion(q.key)}
                      className="accent-purple-500"
                    />
                    <span>{q.question}</span>
                  </label>
                ))}
              </div>
            )}
            <button
              onClick={submitVotes}
              className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              Submit
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Normale display na stemmen
  const roleLabel = player.role ?? "burger";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/30 backdrop-blur-lg shadow-lg rounded-2xl border border-white/10">
        <CardContent className="text-center p-8 text-white space-y-6">
          <h2 className="text-4xl font-extrabold tracking-wide">{player.name}</h2>
          <p className="text-lg font-semibold text-white/90">
            Rol: <span className="capitalize">{roleLabel}</span>
          </p>
          <p
            className={`text-sm font-bold py-1 px-3 rounded-full w-max mx-auto ${
              player.alive ? "bg-green-600/80" : "bg-red-600/80"
            }`}
          >
            {player.alive ? "Alive" : "Dead"}
          </p>
          {player.commend && (
            <div className="bg-white/10 rounded-xl p-4 text-left">
              <h3 className="font-semibold mb-1 text-lg">Commend</h3>
              <p className="text-white/90 text-base">{player.commend}</p>
            </div>
          )}
          {player.task && (
            <div className="bg-white/10 rounded-xl p-4 text-left">
              <h3 className="font-semibold mb-1 text-lg">{player.alive ? "Task" : "Handicap"}</h3>
              <p className="text-white/90 text-base">{player.task}</p>
            </div>
          )}
          <div className="mt-4">
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-purple-500 transition-all duration-500"
                style={{ width: `${(timer / 5) * 100}%` }}
              ></div>
            </div>
            <p className="text-white/70 text-sm">Sluit over {timer} seconden...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
