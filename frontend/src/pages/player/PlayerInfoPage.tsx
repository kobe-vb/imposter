import { api } from "@/api/api";
import { Card, CardContent } from "@/components/ui/card";
import type { Player } from "@/types/types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PlayerInfoPage() {
  const { gameCode, playerName } = useParams<{
    gameCode: string;
    playerName: string;
  }>();

  const navigate = useNavigate();
  const [timer, setTimer] = useState(5);
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (!playerName) {
      navigate(`/players/${gameCode}`);
      return;
    }

    const fetchPlayer = async () => {
      try {
        const data: Player = await api.get(
          `/game/${gameCode}/player/${playerName}/info`
        );
        setPlayer(data);
        setTimer(5);
      } catch (err) {
        console.error("Failed to fetch player info", err);
      }
    };

    fetchPlayer();
  }, [playerName, gameCode, navigate]);

  useEffect(() => {
    if (timer <= 0) {
      navigate(`/players/${gameCode}`);
      return;
    }

    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, navigate, gameCode]);

  if (!player) return null;

  const roleLabel = player.role ?? "burger";

  const cardGradient = player.alive
    ? "from-indigo-600 to-purple-700"
    : "from-red-700 to-red-900";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card
        className={`w-full max-w-2xl bg-gradient-to-br ${cardGradient} shadow-2xl`}
      >
        <CardContent className="pt-8 pb-8 text-center text-white">
          {/* NAME */}
          <h2 className="text-4xl font-bold mb-2">{player.name}</h2>

          {/* ROLE */}
          <p className="text-xl font-semibold mb-6 text-white/90">
            Rol: {roleLabel}
          </p>

          {/* TASK */}
          {player.task && (
            <div className="bg-black/20 rounded-lg p-6 mb-6">
              <p className="text-2xl">{player.task}</p>
            </div>
          )}

          {/* TIMER */}
          <p className="text-white/70">
            Sluit over {timer} seconden...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
