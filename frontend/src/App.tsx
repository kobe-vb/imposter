import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlayerSetupPage from './pages/player/PayerSetupPage';
import PlayerPage from './pages/player/PlayerPage';
import { PlayerProvider } from './context/PlayerContext';
import PlayerInfoPage from './pages/player/PlayerInfoPage';
import HostWelcomePage from './pages/host/HostWelcomePage';
import HostJoinPage from './pages/host/HostJoinPage';
import HostSetupPage from './pages/host/HostSetupPage';
import HostPage from './pages/host/HostPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/host/welcome" element={<HostWelcomePage />} />
        <Route path="/host/join" element={<HostJoinPage />} />
        <Route path="/host/setup" element={<HostSetupPage />} />
        <Route path="/host/:gameCode" element={<HostPage />} />

        <Route path="/players/setup" element={<PlayerSetupPage />} />

        {/* Player routes met context */}
        <Route path="/players/:gameCode" element={<PlayerProvider><PlayerPage /></PlayerProvider>} />
        <Route path="/players/:gameCode/info/:playerName" element={<PlayerProvider><PlayerInfoPage /></PlayerProvider>} />

      </Routes>
    </BrowserRouter>

  );
}

export default App;