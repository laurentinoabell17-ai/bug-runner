'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [fireworks, setFireworks] = useState(false);

  const [shieldActive, setShieldActive] = useState(false);
  const [immunityActive, setImmunityActive] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);

  const playerRef = useRef({ y: 0, vy: 0, isJumping: false });
  const [playerY, setPlayerY] = useState(0);
  const [obstacleX, setObstacleX] = useState(600);
  const [powerUp, setPowerUp] = useState<{ type: 'coffee' | 'shield' | 'patch'; x: number; active: boolean }>({ type: 'coffee', x: -100, active: false });
  
  const scoreRef = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  // Temas de fases reais de um jogo (Cenários visuais imersivos)
  const themes = [
    { 
      name: "Mundo Digital (Cyber Valley)", 
      bg: "from-indigo-950 via-purple-950 to-slate-950", 
      border: "border-purple-500/30", 
      text: "text-purple-400",
      scenery: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Estrelas / Partículas de fundo do jogo */}
          <div className="absolute top-8 left-16 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping"></div>
          <div className="absolute top-16 right-24 w-1 h-1 bg-indigo-300 rounded-full animate-pulse"></div>
          <div className="absolute top-10 right-40 w-2 h-2 bg-pink-400/60 rounded-full"></div>
          {/* Colinas / Silhuetas de Cenário Estilizadas */}
          <div className="absolute bottom-2.5 w-full h-16 bg-gradient-to-t from-purple-900/30 to-transparent clip-path-hills"></div>
        </div>
      )
    },
    { 
      name: "Caverna Neon (Cyber Cave)", 
      bg: "from-slate-950 via-emerald-950/60 to-black", 
      border: "border-emerald-500/30", 
      text: "text-emerald-400",
      scenery: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Cristais de Fundo Estilizados */}
          <div className="absolute bottom-2.5 left-20 w-6 h-16 bg-emerald-500/10 clip-polygon border-t border-emerald-400/30"></div>
          <div className="absolute bottom-2.5 right-32 w-10 h-24 bg-teal-500/10 clip-polygon border-t border-teal-400/30"></div>
          <div className="absolute top-12 left-32 w-1.5 h-1.5 bg-emerald-300 rounded-full animate-ping"></div>
        </div>
      )
    },
    { 
      name: "Espaço Sideral (Deep Space)", 
      bg: "from-blue-950 via-slate-950 to-indigo-950", 
      border: "border-cyan-500/30", 
      text: "text-cyan-400",
      scenery: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Planeta Distante e Nebulosa */}
          <div className="absolute top-6 right-12 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-600/30 border border-cyan-400/30 blur-[1px]"></div>
          <div className="absolute top-12 left-24 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-20 right-64 w-1.5 h-1.5 bg-cyan-200 rounded-full animate-pulse"></div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const savedHighScore = localStorage.getItem('bugRunnerHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  const jump = () => {
    if (!isPlaying && !gameOver) {
      startGame();
      return;
    }
    if (!playerRef.current.isJumping && isPlaying) {
      playerRef.current.vy = -13;
      playerRef.current.isJumping = true;
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    scoreRef.current = 0;
    setObstacleX(600);
    setShieldActive(false);
    setImmunityActive(false);
    setFireworks(false);
    setThemeIndex(0);
    setPowerUp({ type: 'coffee', x: -100, active: false });
    playerRef.current = { y: 0, vy: 0, isJumping: false };
    setPlayerY(0);
  };

  useEffect(() => {
    if (!isPlaying) return;

    let currentObstacleX = 600;
    let currentPowerUp = { type: 'coffee' as 'coffee' | 'shield' | 'patch', x: -100, active: false };

    const updateGame = () => {
      playerRef.current.vy += 0.65;
      playerRef.current.y += playerRef.current.vy;

      if (playerRef.current.y > 0) {
        playerRef.current.y = 0;
        playerRef.current.vy = 0;
        playerRef.current.isJumping = false;
      }
      setPlayerY(playerRef.current.y);

      const gameSpeed = 6 + Math.min(Math.floor(scoreRef.current / 100), 4);
      currentObstacleX -= gameSpeed;

      if (currentPowerUp.active) {
        currentPowerUp.x -= gameSpeed;
        if (currentPowerUp.x < -40) currentPowerUp.active = false;
      } else if (Math.random() < 0.012 && currentObstacleX > 400) {
        const types: ('coffee' | 'shield' | 'patch')[] = ['coffee', 'shield', 'patch'];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        currentPowerUp = { type: chosenType, x: 600, active: true };
      }
      setPowerUp({ ...currentPowerUp });

      if (currentObstacleX < -40) {
        currentObstacleX = 600;
        scoreRef.current += 10;
        setScore(scoreRef.current);

        const newThemeLevel = Math.min(Math.floor(scoreRef.current / 200), themes.length - 1);
        setThemeIndex(newThemeLevel);

        if (scoreRef.current === 100 || scoreRef.current === 500 || scoreRef.current === 1000) {
          setFireworks(true);
          setTimeout(() => setFireworks(false), 3000);
        }
      }
      setObstacleX(currentObstacleX);

      if (currentPowerUp.active && currentPowerUp.x > 35 && currentPowerUp.x < 90) {
        if (currentPowerUp.type === 'coffee') {
          setImmunityActive(true);
          setTimeout(() => setImmunityActive(false), 5000);
        } else if (currentPowerUp.type === 'shield') {
          setShieldActive(true);
        } else if (currentPowerUp.type === 'patch') {
          scoreRef.current += 50;
          setScore(scoreRef.current);
        }
        currentPowerUp.active = false;
        setPowerUp({ ...currentPowerUp });
      }

      if (currentObstacleX > 40 && currentObstacleX < 85 && playerRef.current.y > -28) {
        if (immunityActive) {
          // Imune
        } else if (shieldActive) {
          setShieldActive(false);
          currentObstacleX = -50;
        } else {
          setIsPlaying(false);
          setGameOver(true);
          if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            localStorage.setItem('bugRunnerHighScore', scoreRef.current.toString());
          }
          return;
        }
      }

      animationFrameId.current = requestAnimationFrame(updateGame);
    };

    animationFrameId.current = requestAnimationFrame(updateGame);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isPlaying, highScore, shieldActive, immunityActive]);

  const currentTheme = themes[themeIndex];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className={`w-full max-w-xl bg-slate-900 border ${currentTheme.border} rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-700`}>
        
        {/* Cabeçalho limpo do mini game */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div>
            <h1 className={`text-2xl font-black ${currentTheme.text} tracking-wide flex items-center gap-2 transition-colors duration-500`}>
              🎮 Cyber Runner <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">Arcade</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Fase atual: <strong className="text-white">{currentTheme.name}</strong></p>
          </div>
        </div>

        <div className="flex justify-between mb-4 font-mono text-sm items-center">
          <div className="flex gap-2">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <span className="text-slate-400 text-xs">Pontos:</span>
              <span className="text-emerald-400 font-bold">{score}</span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <span className="text-slate-400 text-xs">Recorde:</span>
              <span className="text-amber-400 font-bold">{highScore}</span>
            </div>
          </div>

          <div className="flex gap-1.5">
            {shieldActive && <span className="text-xs bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-2 py-1 rounded-md animate-pulse">🛡️ Escudo</span>}
            {immunityActive && <span className="text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-1 rounded-md animate-pulse">⚡ Turbo</span>}
          </div>
        </div>

        {/* Tela do Mini Game com Cenário Imersivo */}
        <div 
          onClick={jump}
          className={`relative w-full h-72 bg-gradient-to-b ${currentTheme.bg} border-2 ${currentTheme.border} rounded-xl overflow-hidden cursor-pointer flex items-end shadow-inner select-none transition-colors duration-700`}
        >
          {/* Cenário Gráfico do Jogo */}
          {currentTheme.scenery}

          {fireworks && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none animate-pulse bg-amber-500/10 backdrop-blur-[1px]">
              <div className="text-4xl animate-bounce mb-1">🎆 🎉 🎇</div>
              <span className="text-amber-300 font-black text-lg bg-black/60 px-4 py-1 rounded-full border border-amber-500/40 shadow-lg">
                FASE CONCLUÍDA - {score} PONTOS!
              </span>
            </div>
          )}

          {/* Chão do Jogo */}
          <div className="absolute bottom-0 w-full h-3 bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500 shadow-[0_0_15px_rgba(168,85,247,0.6)] z-10"></div>

          {/* Personagem do Jogador */}
          <div 
            style={{ bottom: `${Math.abs(playerY) + 12}px` }}
            className={`absolute left-12 w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl flex items-center justify-center text-2xl shadow-lg border ${shieldActive ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'border-purple-400/40'} z-20 transition-transform`}
          >
            🤖
          </div>

          {/* Obstáculo */}
          <div 
            style={{ left: `${obstacleX}px` }}
            className="absolute bottom-3 w-9 h-9 bg-rose-600/90 rounded-lg flex items-center justify-center text-xl shadow-lg border border-rose-400/40 animate-pulse z-20"
          >
            👾
          </div>

          {/* Power-ups */}
          {powerUp.active && (
            <div 
              style={{ left: `${powerUp.x}px` }}
              className="absolute bottom-10 w-9 h-9 bg-slate-800/90 rounded-lg flex items-center justify-center text-xl shadow-lg border border-slate-600 animate-bounce z-20"
            >
              {powerUp.type === 'coffee' && '⚡'}
              {powerUp.type === 'shield' && '🛡️'}
              {powerUp.type === 'patch' && '⭐'}
            </div>
          )}

          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-30">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-3xl mb-3 border border-purple-500/20 animate-bounce">
                🕹️
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Pronto para jogar?</h2>
              <p className="text-xs text-slate-400 mb-4 max-w-xs">
                Pressione <span className="text-purple-400 font-semibold">ESPAÇO</span> ou <span className="text-purple-400 font-semibold">CLIQUE</span> para saltar os obstáculos.
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow-lg shadow-purple-600/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                JOGAR AGORA
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-30">
              <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-3xl mb-3 border border-rose-500/20">
                💀
              </div>
              <h2 className="text-xl font-black text-rose-400 mb-1">Fim de Jogo!</h2>
              <p className="text-xs text-slate-300 mb-6">
                Você fez <span className="font-bold text-white text-sm">{score}</span> pontos.
              </p>
              
              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow-lg shadow-purple-600/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                JOGAR NOVAMENTE 🔄
              </button>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center text-xs text-slate-500 mt-4 px-1">
          <span>Itens: ⚡ (Turbo), 🛡️ (Escudo), ⭐ (+50pts).</span>
          <span className="text-purple-400 font-medium">{isPlaying ? '🎮 Jogando' : '⏸️ Pausado'}</span>
        </div>
      </div>

      <footer className="mt-8 text-xs text-slate-500 font-medium">
        © 2026 Desenvolvido por Laurentino.
      </footer>
    </main>
  );
}