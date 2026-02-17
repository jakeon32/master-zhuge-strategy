import React from 'react';

interface Props {
  isPlaying: boolean;
  onToggle: () => void;
}

const AudioToggle: React.FC<Props> = ({ isPlaying, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full glass-panel border border-slate-700/50 hover:border-amber-500/50 flex items-center justify-center transition-all duration-300 group"
      title={isPlaying ? '소리 끄기' : '소리 켜기'}
    >
      {isPlaying ? (
        <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" className="animate-pulse" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-slate-500 group-hover:text-amber-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}

      {/* Sound wave animation */}
      {isPlaying && (
        <div className="absolute -top-1 -right-1 flex space-x-0.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-0.5 bg-amber-500 rounded-full animate-bounce"
              style={{
                height: `${6 + Math.random() * 6}px`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.6s',
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
};

export default AudioToggle;
