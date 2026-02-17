
import React, { useState } from 'react';
import { BirthInfo, AnalysisResult } from './types';
import { getFortuneAnalysis } from './services/claudeService';
import InputForm from './components/InputForm';
import AnalysisDashboard from './components/AnalysisDashboard';
import LoadingScreen from './components/LoadingScreen';
import ParticleCanvas from './components/ParticleCanvas';
import AmbientSound from './components/AmbientSound';
import AudioToggle from './components/AudioToggle';

const App: React.FC = () => {
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const handleStartAnalysis = async (info: BirthInfo) => {
    setStep('loading');
    setError(null);
    try {
      const data = await getFortuneAnalysis(info);
      setResult(data);
      setStep('result');
    } catch (err: any) {
      console.error(err);
      setError('제갈량의 지혜를 빌려오는 도중 오류가 발생했습니다. 다시 시도해 주십시오.');
      setStep('input');
    }
  };

  const handleReset = () => {
    setStep('input');
    setResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 text-slate-100 overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200 font-sans">
      {/* Mystical Background Layers */}
      <div className="bg-mystical"></div>
      <div className="stars"></div>
      <ParticleCanvas />
      <AmbientSound isPlaying={audioPlaying} />
      <AudioToggle isPlaying={audioPlaying} onToggle={() => setAudioPlaying(prev => !prev)} />

      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {step === 'input' && (
          <div className="animate-fade-in flex flex-col items-center">
            <header className="text-center mb-12 space-y-4 relative z-10">
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 tracking-tight drop-shadow-sm animate-fade-in">
                제갈량의 <span className="text-slate-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">천기누설</span>
              </h1>
              <div className="flex items-center justify-center gap-4 opacity-70">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500"></div>
                <span className="text-xs font-serif tracking-[0.3em] text-amber-500 uppercase">Master Zhuge's Strategy</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500"></div>
              </div>
            </header>
            <InputForm onSubmit={handleStartAnalysis} />
          </div>
        )}

        {step === 'loading' && <LoadingScreen />}

        {step === 'result' && result && (
          <div className="animate-fade-in">

            <AnalysisDashboard result={result} onReset={handleReset} />
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-2xl text-center animate-fade-in">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
