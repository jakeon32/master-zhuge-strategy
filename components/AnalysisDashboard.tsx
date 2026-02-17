
import React, { useState } from 'react';
import { AnalysisResult, PeakYear } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

const ScoreBadge: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
  <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-2xl border border-slate-700">
    <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{label}</span>
    <span className={`text-2xl font-bold ${color}`}>{score}</span>
  </div>
);

const AnalysisDashboard: React.FC<Props> = ({ result, onReset }) => {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'sending'>('idle');

  const chartData = result.goldenPeaks.map(p => ({
    name: `${p.year}년`,
    saju: p.scores.saju,
    astro: p.scores.astrology,
    num: p.scores.numerology,
    total: Math.round((p.scores.saju + p.scores.astrology + p.scores.numerology) / 3)
  }));

  const getResultText = () => {
    let text = `[제갈량의 천기누설 - 분석 보고서]\n\n`;
    text += `■ 2026년 운세 점수: ${result.analysis2026.totalScore}점\n`;
    text += `■ 전략 제언: ${result.analysis2026.strategy}\n\n`;
    text += `■ 인생의 황금기 Top 5:\n`;
    result.goldenPeaks.forEach(peak => {
      text += `${peak.rank}위: ${peak.year}년(${peak.age}세) - ${peak.focus}\n`;
      text += `  - 요약: ${peak.description}\n`;
    });
    text += `\n분석 요약: ${result.summary}\n`;
    return text;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getResultText());
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch (err) {
      console.error("복사 실패", err);
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("[제갈량의 천기누설] 주군의 운세 분석 보고서입니다");
    const body = encodeURIComponent(getResultText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-12 animate-fade-in pb-24">
      {/* 2026 Forecast Card */}
      <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-6 flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-500">2026년 커리어 전략서</h2>
          <div className="flex gap-2">
             <button 
              onClick={handleEmail}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-amber-500 transition-colors"
              title="이메일로 보내기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button 
              onClick={handleCopy}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-amber-500 transition-colors"
              title="결과 복사하기"
            >
              {shareStatus === 'copied' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <ScoreBadge label="사주" score={result.analysis2026.sajuScore} color="text-amber-400" />
            <ScoreBadge label="점성술" score={result.analysis2026.astrologyScore} color="text-blue-400" />
            <ScoreBadge label="수비학" score={result.analysis2026.numerologyScore} color="text-purple-400" />
            <ScoreBadge label="통합 운세" score={result.analysis2026.totalScore} color="text-emerald-400" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-emerald-400 flex items-center">
                <span className="mr-2">✨</span> 포착해야 할 기회
              </h3>
              <p className="text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                {result.analysis2026.opportunity}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-red-400 flex items-center">
                <span className="mr-2">⚠️</span> 주의해야 할 위기
              </h3>
              <p className="text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                {result.analysis2026.risk}
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-amber-500/5 rounded-2xl border border-amber-500/20">
            <h3 className="text-xl font-bold text-amber-500 mb-3 font-serif">제갈량의 전략 제언</h3>
            <p className="text-slate-200 leading-relaxed italic">
              "{result.analysis2026.strategy}"
            </p>
          </div>
        </div>
      </section>

      {/* Golden Era Visualization */}
      <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-3xl font-serif font-bold text-amber-500 mb-8">당신의 인생 황금기 Top 5</h2>
        
        <div className="h-[300px] mb-12">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis domain={[0, 100]} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend />
              <Bar dataKey="saju" name="사주" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="astro" name="점성술" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              <Bar dataKey="num" name="수비학" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6">
          {result.goldenPeaks.map((peak, idx) => (
            <div key={idx} className="group relative bg-slate-800/40 border border-slate-700 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-300">
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-amber-500 text-slate-950 flex items-center justify-center font-bold rounded-full shadow-lg">
                {peak.rank}
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h4 className="text-2xl font-bold text-slate-100">{peak.year}년 <span className="text-slate-500 text-lg font-normal">({peak.age}세)</span></h4>
                  <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full mt-2">
                    주력 분야: {peak.focus}
                  </span>
                </div>
              </div>
              <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                {peak.description}
              </p>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <span className="text-amber-500 text-xs font-bold uppercase tracking-widest block mb-1">성공 전략</span>
                <p className="text-slate-200 text-sm italic">{peak.strategy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary Card */}
      <section className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-serif font-bold text-amber-500">총평 (Summary)</h3>
        <p className="text-slate-300 leading-relaxed text-lg italic">
          "{result.summary}"
        </p>
      </section>

      <div className="flex flex-col items-center gap-4 pt-8">
        <button
          onClick={handleEmail}
          className="flex items-center gap-2 px-8 py-4 bg-amber-500 text-slate-950 font-bold rounded-2xl hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          이메일로 분석 결과 받기
        </button>
        <button
          onClick={onReset}
          className="px-8 py-3 text-slate-500 hover:text-slate-300 transition-all text-sm uppercase tracking-widest"
        >
          처음으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
