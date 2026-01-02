import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus, Play, SkullIcon, Users, Settings, Home } from 'lucide-react';

export default function MafiaGameApp() {
  const [mode, setMode] = useState('welcome'); // 'welcome' | 'player' | 'host'
  const [screen, setScreen] = useState('code');
  const [gameCode, setGameCode] = useState('');
  const [gameData, setGameData] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [infoTimer, setInfoTimer] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Host state
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [settings, setSettings] = useState({
    gameDuration: 30,
    imposters: 2,
    taskTime: 10,
    infoDisplayTime: 5
  });
  const [currentPhase, setCurrentPhase] = useState('waiting');

  // Mock API functions
  const mockFetchGame = async (code) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          game_id: code,
          phase: currentPhase,
          players: players.length > 0 ? players : [
            { name: 'Alice', alive: true, role: null, task: null },
            { name: 'Bob', alive: true, role: null, task: null },
            { name: 'Charlie', alive: true, role: null, task: null },
            { name: 'Diana', alive: true, role: null, task: null }
          ]
        });
      }, 500);
    });
  };

  const mockFetchPlayerInfo = async (code, playerName) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const player = players.find(p => p.name === playerName);
        if (player?.role && currentPhase === 'role') {
          resolve({ info_type: 'role', info: { role: player.role, description: player.role === 'Mafia' ? 'Je bent een imposter!' : 'Je bent onschuldig!' } });
        } else if (player?.task && currentPhase === 'task') {
          resolve({ info_type: 'task', info: { task: player.task } });
        } else if (!player?.alive) {
          resolve({ info_type: 'dead', info: { message: 'Je bent dood! 💀' } });
        } else {
          resolve({ info_type: 'none', info: { message: 'Wacht op de host...' } });
        }
      }, 300);
    });
  };

  const mockCreateGame = async (playersList, gameSettings) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const code = 'GAME' + Math.floor(Math.random() * 1000);
        resolve({ game_id: code });
      }, 5000);
    });
  };

  // Timer voor info scherm
  useEffect(() => {
    if (screen === 'playerInfo' && infoTimer > 0) {
      const timer = setTimeout(() => {
        setInfoTimer(infoTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (screen === 'playerInfo' && infoTimer === 0) {
      setScreen('players');
      setPlayerInfo(null);
      setSelectedPlayer(null);
    }
  }, [screen, infoTimer]);

  // Host functions
  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    if (players.find(p => p.name === newPlayerName)) {
      setError('Speler bestaat al');
      return;
    }
    setPlayers([...players, { name: newPlayerName, alive: true, role: null, task: null }]);
    setNewPlayerName('');
    setError('');
  };

  const removePlayer = (name) => {
    setPlayers(players.filter(p => p.name !== name));
  };

  const createGame = async () => {
    if (players.length < 3) {
      setError('Minimaal 3 spelers nodig');
      return;
    }
    setLoading(true);
    try {
      const data = await mockCreateGame(players, settings);
      setGameCode(data.game_id);
      setGameData({ game_id: data.game_id, phase: 'waiting', players });
      setScreen('hostControl');
    } catch (err) {
      setError('Kon game niet aanmaken');
    } finally {
      setLoading(false);
    }
  };

  const assignRoles = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const updated = shuffled.map((p, i) => ({
      ...p,
      role: i < settings.imposters ? 'Mafia' : 'Innocent'
    }));
    setPlayers(updated);
    setCurrentPhase('role');
    setError('');
  };

  const assignTasks = () => {
    const tasks = [
      'Dans 10 seconden',
      'Zing een liedje',
      'Doe 5 push-ups',
      'Vertel een mop',
      'Imiteer een dier',
      'Spreek backwards',
      'Maak een handstand',
      'Tel tot 20 in een vreemde taal'
    ];
    const updated = players.map(p => ({
      ...p,
      task: p.alive ? tasks[Math.floor(Math.random() * tasks.length)] : null
    }));
    setPlayers(updated);
    setCurrentPhase('task');
  };

  const killPlayer = (name) => {
    const updated = players.map(p => 
      p.name === name ? { ...p, alive: false } : p
    );
    setPlayers(updated);
  };

  const revivePlayer = (name) => {
    const updated = players.map(p => 
      p.name === name ? { ...p, alive: true } : p
    );
    setPlayers(updated);
  };

  // Player functions
  const joinGame = async () => {
    if (!gameCode.trim()) {
      setError('Voer een game code in');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await mockFetchGame(gameCode);
      setGameData(data);
      setPlayers(data.players);
      setScreen('players');
    } catch (err) {
      setError('Game niet gevonden');
    } finally {
      setLoading(false);
    }
  };

  const selectPlayer = async (playerName) => {
    setSelectedPlayer(playerName);
    setLoading(true);
    try {
      const info = await mockFetchPlayerInfo(gameCode, playerName);
      setPlayerInfo(info);
      setScreen('playerInfo');
      setInfoTimer(settings.infoDisplayTime);
    } catch (err) {
      setError('Kon info niet ophalen');
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setMode('welcome');
    setScreen('code');
    setGameCode('');
    setGameData(null);
    setPlayers([]);
    setCurrentPhase('waiting');
    setError('');
  };

  // WELCOME SCREEN
  if (mode === 'welcome') {
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
                onClick={() => { setMode('player'); setScreen('code'); }}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xl py-8 shadow-lg hover:shadow-blue-500/50"
              >
                <Users className="mr-2 h-6 w-6" />
                Speler (GSM)
              </Button>
              
              <Button
                onClick={() => { setMode('host'); setScreen('hostChoice'); }}
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

  // HOST: Choice between new game or join existing
  if (mode === 'host' && screen === 'hostChoice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur border-purple-500/20">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Host Modus</h2>
              <p className="text-slate-300">Start een nieuw spel of join bestaand</p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => setScreen('hostSetup')}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xl py-8"
              >
                <Plus className="mr-2 h-6 w-6" />
                Nieuw Spel
              </Button>
              
              <Button
                onClick={() => setScreen('hostJoin')}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xl py-8"
              >
                <Play className="mr-2 h-6 w-6" />
                Bestaand Spel
              </Button>

              <Button
                onClick={resetApp}
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

  // HOST: Join existing game
  if (mode === 'host' && screen === 'hostJoin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur border-purple-500/20">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Join Game</h2>
              <p className="text-slate-300">Voer de game code in</p>
            </div>
            
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="GAME123"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                className="text-center text-2xl font-mono bg-slate-900/50 border-purple-500/30 text-white"
                onKeyDown={(e) => e.key === 'Enter' && joinGame()}
              />
              
              {error && (
                <Alert className="bg-red-500/10 border-red-500/50 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={async () => {
                  await joinGame();
                  if (!error) setScreen('hostControl');
                }}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6"
              >
                {loading ? 'Laden...' : 'Join Game'}
              </Button>

              <Button
                onClick={() => setScreen('hostChoice')}
                className="w-full bg-slate-700 hover:bg-slate-600"
              >
                Terug
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // HOST SETUP SCREEN
  if (mode === 'host' && screen === 'hostSetup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20 mb-4">
            <CardHeader>
              <CardTitle className="text-3xl text-white text-center">🎮 Nieuw Spel Aanmaken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Spelers toevoegen */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Spelers ({players.length})</h3>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Naam"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                      className="bg-slate-900/50 border-purple-500/30 text-white"
                    />
                    <Button onClick={addPlayer} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {players.map((player) => (
                      <div key={player.name} className="flex items-center justify-between bg-slate-900/50 p-3 rounded">
                        <span className="text-white font-medium">{player.name}</span>
                        <Button
                          onClick={() => removePlayer(player.name)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instellingen */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Instellingen</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-slate-300 text-sm">Spel duur (minuten)</label>
                      <Input
                        type="number"
                        value={settings.gameDuration}
                        onChange={(e) => setSettings({...settings, gameDuration: parseInt(e.target.value)})}
                        className="bg-slate-900/50 border-purple-500/30 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="text-slate-300 text-sm">Aantal imposters</label>
                      <Input
                        type="number"
                        value={settings.imposters}
                        onChange={(e) => setSettings({...settings, imposters: parseInt(e.target.value)})}
                        className="bg-slate-900/50 border-purple-500/30 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="text-slate-300 text-sm">Task tijd (seconden)</label>
                      <Input
                        type="number"
                        value={settings.taskTime}
                        onChange={(e) => setSettings({...settings, taskTime: parseInt(e.target.value)})}
                        className="bg-slate-900/50 border-purple-500/30 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm">Info display tijd (seconden)</label>
                      <Input
                        type="number"
                        value={settings.infoDisplayTime}
                        onChange={(e) => setSettings({...settings, infoDisplayTime: parseInt(e.target.value)})}
                        className="bg-slate-900/50 border-purple-500/30 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <Alert className="mt-4 bg-red-500/10 border-red-500/50 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={createGame}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-lg py-6"
                >
                  {loading ? 'Aanmaken...' : 'Start Spel'}
                </Button>
                <Button
                  onClick={() => setScreen('hostChoice')}
                  className="bg-slate-700 hover:bg-slate-600 px-8"
                >
                  Terug
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // HOST CONTROL SCREEN
  if (mode === 'host' && screen === 'hostControl') {
    const alivePlayers = players.filter(p => p.alive).length;
    const deadPlayers = players.filter(p => !p.alive).length;
    const mafia = players.filter(p => p.role === 'Mafia' && p.alive).length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header met game code */}
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            <CardContent className="py-4">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-1">Game Code</h2>
                <p className="text-6xl font-mono font-bold text-white">{gameCode}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Stats */}
            <Card className="bg-slate-800/50 backdrop-blur border-green-500/20">
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-green-400">{alivePlayers}</p>
                <p className="text-slate-300">Levend</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 backdrop-blur border-red-500/20">
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-red-400">{mafia}</p>
                <p className="text-slate-300">Mafia</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 backdrop-blur border-gray-500/20">
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-gray-400">{deadPlayers}</p>
                <p className="text-slate-300">Dood</p>
              </CardContent>
            </Card>
          </div>

          {/* Phase controls */}
          <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20 mb-4">
            <CardHeader>
              <CardTitle className="text-white">Fase: {currentPhase}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={assignRoles}
                  className="bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                >
                  🎭 Deel Rollen Uit
                </Button>
                <Button
                  onClick={assignTasks}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                >
                  📋 Deel Tasks Uit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Players list */}
          <Card className="bg-slate-800/50 backdrop-blur border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Spelers Beheer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {players.map((player) => (
                  <div
                    key={player.name}
                    className={`p-4 rounded-lg flex items-center justify-between ${
                      player.alive ? 'bg-slate-900/50' : 'bg-gray-800/30'
                    }`}
                  >
                    <div>
                      <p className={`text-lg font-bold ${player.alive ? 'text-white' : 'text-gray-500 line-through'}`}>
                        {player.name}
                      </p>
                      <p className="text-sm text-slate-400">
                        {player.role ? `${player.role}` : 'Geen rol'}
                      </p>
                    </div>
                    {player.alive ? (
                      <Button
                        onClick={() => killPlayer(player.name)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <SkullIcon className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => revivePlayer(player.name)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        ❤️
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={resetApp}
            className="w-full mt-4 bg-slate-700 hover:bg-slate-600"
          >
            <Home className="mr-2 h-5 w-5" />
            Nieuw Spel
          </Button>
        </div>
      </div>
    );
  }

  // PLAYER MODE - CODE SCREEN
  if (mode === 'player' && screen === 'code') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur border-purple-500/20">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">🎭 Mafia</h1>
              <p className="text-slate-300">Voer je game code in</p>
            </div>
            
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="GAME123"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                className="text-center text-2xl font-mono bg-slate-900/50 border-purple-500/30 text-white"
                onKeyDown={(e) => e.key === 'Enter' && joinGame()}
              />
              
              {error && (
                <Alert className="bg-red-500/10 border-red-500/50 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={joinGame}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6"
              >
                {loading ? 'Laden...' : 'Doe mee'}
              </Button>

              <Button
                onClick={resetApp}
                className="w-full bg-slate-700 hover:bg-slate-600"
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

  // PLAYER MODE - PLAYER SELECTION SCREEN
  if (mode === 'player' && screen === 'players') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-1">Selecteer je naam</h2>
            <p className="text-slate-300">Game: {gameCode}</p>
          </div>

          {error && (
            <Alert className="mb-4 bg-red-500/10 border-red-500/50 text-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {players.map((player) => (
              <Button
                key={player.name}
                onClick={() => selectPlayer(player.name)}
                disabled={loading}
                className={`h-24 text-xl font-semibold transition-all ${
                  player.alive
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg hover:shadow-purple-500/50'
                    : 'bg-slate-700/50 text-slate-400 line-through'
                }`}
              >
                {player.name}
              </Button>
            ))}
          </div>

          <Button
            onClick={resetApp}
            className="mt-6 w-full bg-slate-700 hover:bg-slate-600"
          >
            <Home className="mr-2 h-5 w-5" />
            Terug naar start
          </Button>
        </div>
      </div>
    );
  }

  // PLAYER MODE - INFO SCREEN
  if (mode === 'player' && screen === 'playerInfo' && playerInfo) {
    const getInfoColor = () => {
      switch (playerInfo.info_type) {
        case 'role': return 'from-red-600 to-orange-600';
        case 'task': return 'from-blue-600 to-cyan-600';
        case 'dead': return 'from-gray-600 to-slate-600';
        default: return 'from-purple-600 to-pink-600';
      }
    };

    const getInfoIcon = () => {
      switch (playerInfo.info_type) {
        case 'role': return '🎭';
        case 'task': return '📋';
        case 'dead': return '💀';
        default: return '⏳';
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className={`w-full max-w-2xl bg-gradient-to-br ${getInfoColor()} shadow-2xl`}>
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="text-8xl mb-6">{getInfoIcon()}</div>
              <h2 className="text-3xl font-bold text-white mb-4">{selectedPlayer}</h2>
              
              <div className="bg-black/20 rounded-lg p-6 mb-6">
                {playerInfo.info_type === 'role' && (
                  <div>
                    <p className="text-2xl font-bold text-white mb-2">{playerInfo.info.role}</p>
                    <p className="text-lg text-white/90">{playerInfo.info.description}</p>
                  </div>
                )}
                
                {playerInfo.info_type === 'task' && (
                  <p className="text-2xl text-white">{playerInfo.info.task}</p>
                )}
                
                {(playerInfo.info_type === 'dead' || playerInfo.info_type === 'none') && (
                  <p className="text-2xl text-white">{playerInfo.info.message}</p>
                )}
              </div>

              <div className="text-white/70 text-lg">
                Sluit over {infoTimer} seconden...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}