import { api } from "@/api/api";
import { Card, CardContent } from "@/components/ui/card";
import type { Player } from "@/types/types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PlayerInfoPage() {
  const { gameCode, playerName } = useParams<{ gameCode: string; playerName: string }>();
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
        const data: Player = await api.get(`/game/${gameCode}/player/${playerName}/info`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/30 backdrop-blur-lg shadow-lg rounded-2xl border border-white/10">
        <CardContent className="text-center p-8 text-white space-y-6">
          {/* NAME */}
          <h2 className="text-4xl font-extrabold tracking-wide">{player.name}</h2>

          {/* ROLE */}
          <p className="text-lg font-semibold text-white/90">
            Rol: <span className="capitalize">{roleLabel}</span>
          </p>

          {/* ALIVE STATUS */}
          <p
            className={`text-sm font-bold py-1 px-3 rounded-full w-max mx-auto ${
              player.alive ? "bg-green-600/80" : "bg-red-600/80"
            }`}
          >
            {player.alive ? "Alive" : "Dead"}
          </p>

          {/* COMMEND */}
          {player.commend && (
            <div className="bg-white/10 rounded-xl p-4 text-left">
              <h3 className="font-semibold mb-1 text-lg">Commend</h3>
              <p className="text-white/90 text-base">{player.commend}</p>
            </div>
          )}

          {/* TASK */}
          {player.task && (
            <div className="bg-white/10 rounded-xl p-4 text-left">
              <h3 className="font-semibold mb-1 text-lg">Task</h3>
              <p className="text-white/90 text-base">{player.task}</p>
            </div>
          )}

          {/* TIMER */}
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
