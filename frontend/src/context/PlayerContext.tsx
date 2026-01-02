import type { PlayerName } from "@/types/types";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Dispatch, SetStateAction } from "react";

interface PlayerContextType {
  players: PlayerName[];
  setPlayers: Dispatch<SetStateAction<PlayerName[]>>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayerContext = () => {
    const context = useContext(PlayerContext);
    if (!context) throw new Error("usePlayerContext must be used within PlayerProvider");
    return context;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    const [players, setPlayers] = useState<PlayerName[]>([]);

    return (
        <PlayerContext.Provider value={{ players, setPlayers}}>
            {children}
        </PlayerContext.Provider>
    );
};
