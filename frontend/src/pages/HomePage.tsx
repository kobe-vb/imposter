import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur border-purple-500/20">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">🎭 Mafia</h1>
            <p className="text-slate-300 text-lg">Kies je rol</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/players/setup")}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xl py-8 shadow-lg hover:shadow-blue-500/50"
            >
              <Users className="mr-2 h-6 w-6" />
              Speler (GSM)
            </Button>

            <Button
              onClick={() => navigate("/host/welcome")}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xl py-8 shadow-lg hover:shadow-purple-500/50"
            >
              <Settings className="mr-2 h-6 w-6" />
              Host (Computer)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
