
import React, { useState, useEffect } from 'react';

const messages = [
  "천기를 살피고 있습니다...",
  "팔괘를 던져 괘를 확인 중입니다...",
  "하늘의 지도를 펼쳐 길을 찾습니다...",
  "주군의 앞날에 서린 안개를 걷어내는 중...",
  "동남풍을 부르듯 운세를 끌어모읍니다...",
  "제갈량의 지혜가 담긴 서찰을 작성 중입니다..."
];

const LoadingScreen: React.FC = () => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12 animate-fade-in">
      <div className="relative w-40 h-40">
        {/* Mystical Ink/Yin-Yang Style Loader */}
        <div className="absolute inset-0 border-2 border-amber-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-t-2 border-amber-500 rounded-full animate-spin [animation-duration:2s]"></div>
        <div className="absolute inset-4 border-b-2 border-blue-500 rounded-full animate-spin [animation-duration:3s] [animation-direction:reverse]"></div>
        <div className="absolute inset-8 border-l-2 border-purple-500 rounded-full animate-spin [animation-duration:4s]"></div>
        
        {/* Core Pulsing Dot */}
        <div className="absolute inset-[45%] bg-amber-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.5)]"></div>
        
        {/* Stylized Floating Particles */}
        <div className="absolute -top-4 left-1/2 w-1 h-1 bg-amber-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/2 -right-4 w-1 h-1 bg-blue-400 rounded-full animate-ping [animation-delay:1s]"></div>
      </div>
      
      <div className="space-y-6 max-w-xs mx-auto">
        <h2 className="text-2xl font-serif text-amber-500 transition-all duration-700 h-16 flex items-center justify-center">
          {messages[msgIdx]}
        </h2>
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map(i => (
            <div 
              key={i} 
              className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" 
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="text-slate-600 text-xs italic tracking-widest uppercase">
          Prophetic Calculations in Progress
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
