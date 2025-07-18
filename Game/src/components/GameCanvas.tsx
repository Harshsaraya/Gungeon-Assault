import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (canvasRef.current && !gameEngineRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 800;
      canvas.height = 600;
      
      gameEngineRef.current = new GameEngine(canvas);
    }

    return () => {
      // Cleanup if needed
      if (gameEngineRef.current) {
        // Add any cleanup logic here
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          Gungeon Assault
        </h1>
        <p className="text-gray-400 text-center">
          An advanced top-down shooter experience
        </p>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-700 rounded-lg bg-black cursor-crosshair"
          tabIndex={0}
        />
        
        <div className="absolute -bottom-16 left-0 right-0">
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <div className="text-center">
              <div className="font-semibold text-white">Movement</div>
              <div>WASD Keys</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white">Aim & Shoot</div>
              <div>Mouse</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white">Reload</div>
              <div>R Key</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white">Pause</div>
              <div>ESC Key</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 max-w-2xl text-center text-gray-300">
        <h2 className="text-xl font-semibold mb-2">.</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>• Multiple enemy types with unique AI</div>
          <div>• Weapon upgrades and progression</div>
          <div>• Procedurally generated levels</div>
          <div>• Particle effects and screen shake</div>
          <div>• Experience and leveling system</div>
          <div>• Professional game feel</div>
        </div>
      </div>
    </div>
  );
};