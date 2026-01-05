import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Monitor, Play, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HostWelcomePage() {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur border-purple-500/20">
                <CardContent className="pt-6">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Host Modus</h2>
                        <p className="text-slate-300">Start een nieuw spel of monitor een bestaand</p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate(`/host/setup`)}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xl py-8"
                        >
                            <Plus className="mr-2 h-6 w-6" />
                            Nieuw Spel
                        </Button>

                        <Button
                            onClick={() => navigate(`/host/join`)}
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xl py-8"
                        >
                            <Monitor className="mr-2 h-6 w-6" />
                            monitor Spel
                        </Button>

                        <Button
                            onClick={() => navigate(`/`)}
                            className="w-full bg-slate-700 hover:bg-slate-600 mt-4"
                        >
                            <Home className="mr-2 h-5 w-5" />
                            Terug
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}