/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 150;

const TRACKS = [
  { id: 1, title: "AI_GEN_01_CYBER_DIRGE", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "AI_GEN_02_NEURAL_STATIC", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "AI_GEN_03_VOID_RESONANCE", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

export default function App() {
  // --- Snake Game State ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // --- Music Player State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Game Logic ---
  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setIsGameRunning(true);
    generateFood();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGameRunning) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isGameRunning]);

  useEffect(() => {
    if (!isGameRunning || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // Check collisions
        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE ||
          prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameOver(true);
          setIsGameRunning(false);
          if (score > highScore) setHighScore(score);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          generateFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [direction, food, gameOver, isGameRunning, score, highScore, generateFood]);

  // --- Music Player Logic ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-cyan-400 font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="scanlines"></div>
      <div className="static-noise"></div>

      {/* Header */}
      <header className="absolute top-4 left-4 z-10 screen-tear">
        <h1 className="text-4xl font-bold glitch-text neon-text-magenta tracking-widest" data-text="NEON_SERPENT_OS">
          NEON_SERPENT_OS
        </h1>
        <p className="text-sm opacity-70 mt-1">v1.0.4 // SYSTEM_ONLINE</p>
      </header>

      {/* Main Content Grid */}
      <div className="z-10 flex flex-col lg:flex-row gap-8 items-center justify-center w-full max-w-6xl mt-16">
        
        {/* Left Panel - Music Player */}
        <div className="neon-border-cyan bg-black/80 p-6 w-full lg:w-80 flex flex-col gap-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-cyan-500/50 pb-2">
            <Terminal size={20} className="text-magenta-500" />
            <h2 className="text-xl tracking-wider neon-text-cyan">AUDIO_MODULE</h2>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xs opacity-50 uppercase tracking-widest">Now Playing</div>
            <div className="text-lg text-magenta-500 truncate glitch-text" data-text={TRACKS[currentTrackIndex].title}>
              {TRACKS[currentTrackIndex].title}
            </div>
            <div className="h-1 w-full bg-gray-800 mt-2 relative overflow-hidden">
              <div className={`h-full bg-cyan-400 ${isPlaying ? 'animate-pulse' : ''}`} style={{ width: isPlaying ? '100%' : '0%', transition: 'width 30s linear' }}></div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button onClick={prevTrack} className="hover:text-magenta-500 transition-colors focus:outline-none">
              <SkipBack size={24} />
            </button>
            <button onClick={togglePlay} className="p-3 neon-border-magenta rounded-full hover:bg-magenta-500/20 transition-all focus:outline-none">
              {isPlaying ? <Pause size={24} className="text-magenta-500" /> : <Play size={24} className="text-magenta-500" />}
            </button>
            <button onClick={nextTrack} className="hover:text-magenta-500 transition-colors focus:outline-none">
              <SkipForward size={24} />
            </button>
            <button onClick={() => setIsMuted(!isMuted)} className="ml-4 hover:text-magenta-500 transition-colors focus:outline-none">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          <div className="mt-4 border-t border-cyan-500/30 pt-4">
            <div className="text-xs opacity-50 uppercase tracking-widest mb-2">Tracklist</div>
            <ul className="flex flex-col gap-2 text-sm">
              {TRACKS.map((track, idx) => (
                <li 
                  key={track.id} 
                  className={`cursor-pointer hover:text-magenta-400 truncate ${idx === currentTrackIndex ? 'text-magenta-500' : 'opacity-70'}`}
                  onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }}
                >
                  [{idx + 1}] {track.title}
                </li>
              ))}
            </ul>
          </div>

          <audio 
            ref={audioRef} 
            src={TRACKS[currentTrackIndex].url} 
            onEnded={handleTrackEnd}
            className="hidden"
          />
        </div>

        {/* Center Panel - Snake Game */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-between w-full px-2 font-bold tracking-widest">
            <div className="neon-text-cyan">SCORE: {score.toString().padStart(4, '0')}</div>
            <div className="neon-text-magenta">HIGH: {highScore.toString().padStart(4, '0')}</div>
          </div>

          <div 
            className="neon-border-magenta bg-black relative"
            style={{ 
              width: `${GRID_SIZE * 20}px`, 
              height: `${GRID_SIZE * 20}px`,
              boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)'
            }}
          >
            {/* Grid Background */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              opacity: 0.5
            }}></div>

            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className="absolute bg-cyan-400"
                style={{
                  left: `${segment.x * 20}px`,
                  top: `${segment.y * 20}px`,
                  width: '20px',
                  height: '20px',
                  boxShadow: index === 0 ? '0 0 10px #00ffff' : 'none',
                  border: '1px solid #000'
                }}
              />
            ))}

            {/* Food */}
            <div
              className="absolute bg-magenta-500 animate-pulse"
              style={{
                left: `${food.x * 20}px`,
                top: `${food.y * 20}px`,
                width: '20px',
                height: '20px',
                boxShadow: '0 0 15px #ff00ff',
                borderRadius: '50%'
              }}
            />

            {/* Overlays */}
            {!isGameRunning && !gameOver && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                <button 
                  onClick={resetGame}
                  className="px-6 py-3 neon-border-cyan text-xl hover:bg-cyan-500/20 transition-colors uppercase tracking-widest focus:outline-none glitch-text"
                  data-text="INITIATE_SEQUENCE"
                >
                  INITIATE_SEQUENCE
                </button>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-6 backdrop-blur-md">
                <h2 className="text-4xl font-bold text-red-500 glitch-text tracking-widest" data-text="SYSTEM_FAILURE">
                  SYSTEM_FAILURE
                </h2>
                <div className="text-xl">FINAL_SCORE: {score}</div>
                <button 
                  onClick={resetGame}
                  className="px-6 py-3 neon-border-magenta text-magenta-500 hover:bg-magenta-500/20 transition-colors uppercase tracking-widest focus:outline-none"
                >
                  REBOOT_SYSTEM
                </button>
              </div>
            )}
          </div>
          
          <div className="text-xs opacity-50 uppercase tracking-widest mt-2 text-center">
            USE [W,A,S,D] OR [ARROW_KEYS] TO NAVIGATE
          </div>
        </div>

      </div>
    </div>
  );
}
