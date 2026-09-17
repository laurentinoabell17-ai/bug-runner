'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const playerRef = useRef({ y: 0, vy: 0, isJumping: false });
  const [playerY, setPlayerY] = useState(0);
  const [bugX, setBugX] = useState(600);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
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
      playerRef.current.vy = -12;
      playerRef.current.isJumping = true;
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setBugX(600);
    playerRef.current = { y: 0, vy: 0, isJumping: false };
    setPlayerY(0);
  };

  useEffect(() => {
    if (!isPlaying) return;

    let currentBugX = 600;
    let currentScore = 0;

    const updateGame = () => {
      playerRef.current.vy += 0.6;
      playerRef.current.y += playerRef.current.vy;

      if (playerRef.current.y > 0) {
        playerRef.current.y = 0;
        playerRef.current.vy = 0;
        playerRef.current.isJumping = false;
      }
      setPlayerY(playerRef.current.y);

      currentBugX -= 7;
      if (currentBugX < -40) {
        currentBugX = 600;
        currentScore += 10;
        setScore(currentScore);
      }
      setBugX(currentBugX);

      if (currentBugX > 40 && currentBugX < 90 && playerRef.current.y > -25) {
        setIsPlaying(false);
        setGameOver(true);
        if (currentScore > highScore) {
          setHighScore(currentScore);
        }
        return;
      }

      animationFrameId.current = requestAnimationFrame(updateGame);
    };

    animationFrameId.current = requestAnimationFrame(updateGame);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isPlaying, highScore]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">🐛 Bug Runner</h1>
            <p className="text-sm text-slate-400">Projeto independente - Salte os erros de sistema!</p>
          </div>
        </div>

        <div className="flex justify-between mb-4 font-mono text-sm">
          <span className="bg-slate-800 px-3 py-1 rounded text-emerald-400">Score: {score}</span>
          <span className="bg-slate-800 px-3 py-1 rounded text-amber-400">Recorde: {highScore}</span>
        </div>

        <div 
          onClick={jump}
          className="relative w-full h-64 bg-slate-950 border-2 border-slate-700 rounded-lg overflow-hidden cursor-pointer flex items-end shadow-inner select-none"
        >
          <div className="absolute bottom-0 w-full h-2 bg-emerald-500"></div>

          <div 
            style={{ bottom: `${Math.abs(playerY) + 8}px` }}
            className="absolute left-12 w-10 h-10 bg-indigo-500 rounded flex items-center justify-center text-xl shadow-lg transition-transform"
          >
            💻
          </div>

          <div 
            style={{ left: `${bugX}px` }}
            className="absolute bottom-2 w-8 h-8 bg-rose-600 rounded flex items-center justify-center text-lg animate-pulse"
          >
            🐞
          </div>

          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4">
              <p className="text-lg font-bold mb-2">Pressione <span className="text-emerald-400">ESPAÇO</span> ou <span className="text-emerald-400">CLIQUE</span> para começar</p>
              <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg shadow transition">
                Iniciar Jogo 🚀
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-rose-950/80 flex flex-col items-center justify-center text-center p-4">
              <h2 className="text-2xl font-bold text-rose-400 mb-1">💥 Bug crítico encontrado!</h2>
              <p className="text-sm text-slate-300 mb-4">Pontuação final: <span className="font-bold text-white">{score}</span></p>
              <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg shadow transition">
                Tentar Novamente 🔄
              </button>
            </div>
          )}
        </div>
        
        <p className="text-xs text-center text-slate-500 mt-4">
          Dica: Use a tecla <kbd className="bg-slate-800 px-2 py-1 rounded text-slate-300">Espaço</kbd> para saltar.
        </p>
      </div>

      <footer className="mt-8 text-xs text-slate-500">
        © 2026 Todos os direitos reservados a Laurentino.
      </footer>
    </main>
  );
}