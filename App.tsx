
import React, { useState } from 'react';
import { BirthInfo, AnalysisResult } from './types';
import { getFortuneAnalysis } from './services/claudeService';
import InputForm from './components/InputForm';
import AnalysisDashboard from './components/AnalysisDashboard';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Mystical Background Layers */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-900/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[160px]"></div>
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-purple-900/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {step === 'input' && (
          <div className="animate-fade-in flex flex-col items-center">
            <header className="text-center mb-10 space-y-2">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-amber-500 tracking-tight">
                제갈량의 <span className="text-slate-100">천기누설</span>
              </h1>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
            </header>
            <InputForm onSubmit={handleStartAnalysis} />
          </div>
        )}

        {step === 'loading' && <LoadingScreen />}

        {step === 'result' && result && (
          <div className="animate-fade-in">
             <header className="text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-100 tracking-tight">
                분석 <span className="text-amber-500">완료</span>
              </h1>
              <p className="text-slate-500 mt-2">하늘의 뜻이 담긴 책략을 확인하십시오</p>
            </header>
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
