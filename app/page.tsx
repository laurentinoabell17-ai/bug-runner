'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [fireworks, setFireworks] = useState(false);

  const playerRef = useRef({ y: 0, vy: 0, isJumping: false });
  const [playerY, setPlayerY] = useState(0);
  const [obstacleX, setObstacleX] = useState(600);
  const [obstacleType, setObstacleType] = useState<'ground' | 'air'>('ground');
  const animationFrameId = useRef<number | null>(null);

  // Carregar recorde do LocalStorage ao iniciar
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
    setObstacleX(600);
    setObstacleType('ground');
    setFireworks(false);
    playerRef.current = { y: 0, vy: 0, isJumping: false };
    setPlayerY(0);
  };

  useEffect(() => {
    if (!isPlaying) return;

    let currentObstacleX = 600;
    let currentScore = 0;
    let currentType: 'ground' | 'air' = 'ground';

    const updateGame = () => {
      // Física do pulo (Gravidade)
      playerRef.current.vy += 0.65;
      playerRef.current.y += playerRef.current.vy;

      if (playerRef.current.y > 0) {
        playerRef.current.y = 0;
        playerRef.current.vy = 0;
        playerRef.current.isJumping = false;
      }
      setPlayerY(playerRef.current.y);

      // Velocidade progressiva
      const gameSpeed = 7 + Math.floor(currentScore / 50);
      currentObstacleX -= gameSpeed;

      // Quando o obstáculo sai da tela, pontua e gera o próximo
      if (currentObstacleX < -40) {
        currentObstacleX = 600;
        currentScore += 10;
        setScore(currentScore);

        // Verifica Marcos Especiais para Fogos de Artifício (100, 500, 1000)
        if (currentScore === 100 || currentScore === 500 || currentScore === 1000) {
          setFireworks(true);
          setTimeout(() => setFireworks(false), 3000); // Some após 3 segundos
        }

        // Lógica de alternância: Após 500 pontos, mistura terrestre e aéreo aleatoriamente
        if (currentScore >= 500) {
          currentType = Math.random() > 0.5 ? 'air' : 'ground';
        } else {
          currentType = 'ground';
        }
        setObstacleType(currentType);
      }
      setObstacleX(currentObstacleX);

      // Lógica de Colisão precisa baseada no tipo de obstáculo
      // Obstáculo Terrestre (Bug): bate se estiver rasteirando/baixo
      if (currentType === 'ground') {
        if (currentObstacleX > 40 && currentObstacleX < 85 && playerRef.current.y > -28) {
          triggerGameOver(currentScore);
          return;
        }
      } 
      // Obstáculo Aéreo (Drone): bate se o player NÃO estiver abaixado/passando por baixo (aqui o player tem que ficar no chão, se pular bate no drone)
      else if (currentType === 'air') {
        if (currentObstacleX > 40 && currentObstacleX < 85 && playerRef.current.y > -75 && playerRef.current.y < -20) {
          triggerGameOver(currentScore);
          return;
        }
      }

      animationFrameId.current = requestAnimationFrame(updateGame);
    };

    const triggerGameOver = (finalScore: number) => {
      setIsPlaying(false);
      setGameOver(true);
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('bugRunnerHighScore', finalScore.toString());
      }
    };

    animationFrameId.current = requestAnimationFrame(updateGame);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isPlaying, highScore]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-emerald-400 tracking-wide flex items-center gap-2">
              🐛 Bug Runner <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">v3.0 Dual Mode</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Salte os bugs terrestres e desvie dos drones aéreos após 500 pontos!</p>
          </div>
        </div>

        {/* Placar */}
        <div className="flex justify-between mb-4 font-mono text-sm">
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Score:</span>
            <span className="text-emerald-400 font-bold text-base">{score}</span>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Recorde:</span>
            <span className="text-amber-400 font-bold text-base">{highScore}</span>
          </div>
        </div>

        {/* Palco do Jogo */}
        <div 
          onClick={jump}
          className="relative w-full h-72 bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-slate-800 rounded-xl overflow-hidden cursor-pointer flex items-end shadow-inner select-none"
        >
          {/* Efeito de Fogos de Artifício ao atingir Marcos Importantes */}
          {fireworks && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none animate-pulse bg-amber-500/10 backdrop-blur-[1px]">
              <div className="text-4xl animate-bounce mb-1">🎆 🎉 🎇</div>
              <span className="text-amber-300 font-black text-lg bg-black/60 px-4 py-1 rounded-full border border-amber-500/40 shadow-lg">
                MARCO INCRÍVEL ALCANÇADO!
              </span>
            </div>
          )}

          {/* Linha do Chão */}
          <div className="absolute bottom-0 w-full h-2.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>

          {/* Personagem (Dev) */}
          <div 
            style={{ bottom: `${Math.abs(playerY) + 10}px` }}
            className="absolute left-12 w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-2xl shadow-lg border border-indigo-400/30 transition-transform"
          >
            💻
          </div>

          {/* Obstáculos (Terrestre: Bug 🐞 ou Aéreo: Drone 🛸) */}
          {obstacleType === 'ground' ? (
            <div 
              style={{ left: `${obstacleX}px` }}
              className="absolute bottom-2.5 w-9 h-9 bg-rose-600/90 rounded-lg flex items-center justify-center text-xl shadow-lg border border-rose-400/40 animate-pulse"
            >
              🐞
            </div>
          ) : (
            <div 
              style={{ left: `${obstacleX}px`, bottom: `75px` }}
              className="absolute w-10 h-8 bg-cyan-600/90 rounded-lg flex items-center justify-center text-xl shadow-lg border border-cyan-400/40 animate-bounce"
            >
              🛸
            </div>
          )}

          {/* Tela Inicial */}
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-20">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-3xl mb-3 border border-emerald-500/20 animate-bounce">
                🚀
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Pronto para debugar?</h2>
              <p className="text-xs text-slate-400 mb-6 max-w-xs">
                Pressione <span className="text-emerald-400 font-semibold">ESPAÇO</span> ou <span className="text-emerald-400 font-semibold">CLIQUE</span> para saltar. Cuidado com os drones após 500 pontos!
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                INICIAR JOGO
              </button>
            </div>
          )}

          {/* Tela de Game Over */}
          {gameOver && (
            <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-20">
              <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-3xl mb-3 border border-rose-500/20">
                💥
              </div>
              <h2 className="text-xl font-black text-rose-400 mb-1">Crash do Sistema!</h2>
              <p className="text-xs text-slate-300 mb-6">
                Sua pontuação final foi de <span className="font-bold text-white text-sm">{score}</span> pontos.
              </p>
              
              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                TENTAR NOVAMENTE 🔄
              </button>
            </div>
          )}
        </div>
        
        {/* Rodapé de Dicas */}
        <div className="flex justify-between items-center text-xs text-slate-500 mt-4 px-1">
          <span>Modo: <strong className={score >= 500 ? "text-cyan-400" : "text-emerald-400"}>{score >= 500 ? "🔥 Avançado (Terrestre + Aéreo)" : "🟢 Padrão (Apenas Terrestre)"}</strong></span>
          <span className="text-emerald-500/80 font-medium">{isPlaying ? '🟢 Rodando' : '⏸️ Pausado'}</span>
        </div>
      </div>

      <footer className="mt-8 text-xs text-slate-500 font-medium">
        © 2026 Desenvolvido por Laurentino.
      </footer>
    </main>
  );
}