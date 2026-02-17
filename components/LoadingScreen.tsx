
import React, { useState, useEffect } from 'react';

const messages = [
  "천기를 살피고 있습니다...",
  "하늘의 별들이 길을 안내합니다...",
  "동남풍을 부르듯 운세를 모으는 중...",
  "주군의 앞날에 서린 안개를 걷어냅니다...",
  "제갈량의 비책을 풀고 있습니다..."
];

const LoadingScreen: React.FC = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 60) return prev + 2;
        if (prev < 85) return prev + 0.5;
        if (prev < 95) return prev + 0.2;
        return prev;
      });
    }, 100);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in relative z-10 glass-panel p-12 rounded-full aspect-square max-w-lg mx-auto shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-slate-700/30">

      {/* Outer Rotating Ring */}
      <div className="absolute inset-0 rounded-full border border-slate-700/50 animate-[spin_10s_linear_infinite]"></div>
      <div className="absolute inset-2 rounded-full border border-slate-800/50 animate-[spin_15s_linear_infinite_reverse]"></div>

      {/* Magical Circle Elements */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>

        {/* Inner Spinner */}
        <svg className="w-full h-full animate-[spin_8s_linear_infinite] opacity-80" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#8a7e58', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#ebbf4c', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path d="M50 10 A40 40 0 0 1 90 50" fill="none" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round" />
          <path d="M50 90 A40 40 0 0 1 10 50" fill="none" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round" />

          <circle cx="50" cy="50" r="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
          <path d="M50 20 L50 35 M50 65 L50 80 M20 50 L35 50 M65 50 L80 50" stroke="currentColor" className="text-amber-500" strokeWidth="2" />
        </svg>

        {/* Yin Yang / Core Symbol (Simplified) */}
        <div className="absolute w-20 h-20 bg-slate-900 rounded-full border-2 border-amber-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-float">
          <span className="text-3xl">🔮</span>
        </div>
      </div>

      <div className="mt-12 text-center space-y-4 max-w-xs relative z-10">
        <div className="h-16 flex items-center justify-center">
          <h2 className="text-xl font-serif text-amber-100 font-light tracking-widest animate-fade-up">
            {messages[msgIdx]}
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
          <div
            className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-amber-500/50 pt-2 font-mono">{Math.floor(progress)}% CALCULATING</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
