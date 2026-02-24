
import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

const ScoreBadge: React.FC<{ label: string; score: number; color: string; icon?: string }> = ({ label, score, color, icon }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-2xl border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 relative group overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <span className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-serif z-10">{label}</span>
    <span className={`text-3xl font-serif font-bold ${color} z-10 drop-shadow-lg`}>{score}</span>
    {icon && <span className="absolute -bottom-2 -right-2 text-4xl opacity-10 grayscale group-hover:grayscale-0 transition-all">{icon}</span>}
  </div>
);

const TOTAL_STEPS = 5;

const stepTitles = [
  { num: 'I', title: '운세 점수가 나왔습니다', sub: '사주 · 점성술 · 수비학 통합 분석' },
  { num: 'II', title: '기회와 위기를 읽습니다', sub: '2026년 핵심 변수 분석' },
  { num: 'III', title: '제갈량의 전략을 전합니다', sub: '승리를 위한 핵심 제언' },
  { num: 'IV', title: '인생의 황금기를 밝힙니다', sub: '당신의 최고 전성기 분석' },
  { num: 'V', title: '천기누설을 마무리합니다', sub: '총평과 최종 조언' },
];

const AnalysisDashboard: React.FC<Props> = ({ result, onReset }) => {
  const [revealStep, setRevealStep] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const chartData = result.goldenPeaks.map(p => ({
    name: `${p.year}년`,
    saju: p.scores.saju,
    astro: p.scores.astrology,
    num: p.scores.numerology,
    total: Math.round((p.scores.saju + p.scores.astrology + p.scores.numerology) / 3)
  }));

  const goNext = () => {
    if (revealStep < TOTAL_STEPS - 1) {
      setRevealStep(prev => prev + 1);
    } else {
      setShowAll(true);
    }
  };

  const goPrev = () => {
    if (revealStep > 0) setRevealStep(prev => prev - 1);
  };

  const handleShowAll = () => setShowAll(true);

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

  // ─── Step-by-step card view ───
  if (!showAll) {
    return (
      <div className="w-full max-w-2xl mx-auto animate-fade-in">
        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mb-8">
          {stepTitles.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx < revealStep ? 'w-8 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : idx === revealStep ? 'w-8 bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Card container */}
        <div className="glass-panel rounded-3xl overflow-hidden relative min-h-[500px] flex flex-col">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
          <div className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-1000" style={{ boxShadow: `inset 0 0 ${revealStep * 15}px rgba(245, 158, 11, ${revealStep * 0.02})` }} />

          {/* Step header */}
          <div className="p-5 pb-3 sm:p-8 sm:pb-4 text-center">
            <span className="text-amber-500/80 font-serif text-sm tracking-widest uppercase">Revelation {stepTitles[revealStep].num}</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-100 mt-2">{stepTitles[revealStep].title}</h2>
            <p className="text-slate-500 text-sm mt-1">{stepTitles[revealStep].sub}</p>
          </div>

          {/* Step content */}
          <div className="flex-1 p-5 pt-3 sm:p-8 sm:pt-4 flex flex-col justify-center">
            {revealStep === 0 && (
              <div className="animate-fade-in space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <ScoreBadge label="사주" score={result.analysis2026.sajuScore} color="text-amber-400" icon="📜" />
                  <ScoreBadge label="점성술" score={result.analysis2026.astrologyScore} color="text-blue-400" icon="✨" />
                  <ScoreBadge label="수비학" score={result.analysis2026.numerologyScore} color="text-purple-400" icon="🔢" />
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <ScoreBadge label="통합 운세" score={result.analysis2026.totalScore} color="text-emerald-400" icon="🐲" />
                  </div>
                </div>
                <p className="text-center text-slate-500 text-sm mt-4">
                  통합 점수 <span className="text-emerald-400 font-bold text-lg">{result.analysis2026.totalScore}</span>점 — {result.analysis2026.totalScore >= 75 ? '상당히 좋은 운세입니다' : result.analysis2026.totalScore >= 50 ? '균형 잡힌 한 해가 예상됩니다' : '전략적 접근이 필요한 해입니다'}
                </p>
              </div>
            )}

            {revealStep === 1 && (
              <div className="animate-fade-in space-y-4 sm:space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-amber-200/90 flex items-center">
                    <span className="w-1 h-6 bg-amber-500/50 mr-3 rounded-full"></span> 포착해야 할 기회
                  </h3>
                  <div className="bg-slate-900/40 p-3 sm:p-5 rounded-2xl border border-slate-700/50">
                    <p className="text-slate-300 leading-relaxed font-light">{result.analysis2026.opportunity}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-red-200/90 flex items-center">
                    <span className="w-1 h-6 bg-red-500/50 mr-3 rounded-full"></span> 주의해야 할 위기
                  </h3>
                  <div className="bg-slate-900/40 p-3 sm:p-5 rounded-2xl border border-slate-700/50">
                    <p className="text-slate-300 leading-relaxed font-light">{result.analysis2026.risk}</p>
                  </div>
                </div>
              </div>
            )}

            {revealStep === 2 && (
              <div className="animate-fade-in">
                <div className="relative p-4 sm:p-8 bg-gradient-to-br from-amber-900/20 to-slate-900/50 rounded-2xl border border-amber-500/20 overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" className="text-amber-500 animate-[spin_60s_linear_infinite]">
                      <path d="M50 0 L100 50 L50 100 L0 50 Z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-amber-500 mb-4 font-serif relative z-10 flex items-center">
                    <span className="mr-2 text-2xl">📜</span> 제갈량의 전략 제언
                  </h3>
                  <p className="text-slate-100 text-lg leading-relaxed font-serif italic relative z-10 pl-6 border-l-2 border-amber-500/30">
                    "{result.analysis2026.strategy}"
                  </p>
                </div>
              </div>
            )}

            {revealStep === 3 && (
              <div className="animate-fade-in space-y-6">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorSaju" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAstro" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorNum" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#475569' }} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#e2e8f0', fontSize: '13px' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="saju" name="사주" fill="url(#colorSaju)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="astro" name="점성술" fill="url(#colorAstro)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="num" name="수비학" fill="url(#colorNum)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {result.goldenPeaks[0] && (
                  <p className="text-center text-slate-500 text-sm">
                    최고의 황금기: <span className="text-amber-400 font-bold">{result.goldenPeaks[0].year}년</span> ({result.goldenPeaks[0].age}세) — {result.goldenPeaks[0].focus}
                  </p>
                )}
              </div>
            )}

            {revealStep === 4 && (
              <div className="animate-fade-in space-y-6">
                <div className="relative p-4 sm:p-6 bg-gradient-to-br from-amber-900/10 to-slate-900/30 rounded-2xl border border-amber-500/20 overflow-hidden">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                  <h3 className="text-xl font-serif font-bold text-slate-100 mb-3 text-center relative z-10">천기누설 총평</h3>
                  <div className="w-16 h-1 bg-amber-500/30 mx-auto rounded-full mb-4"></div>
                  <p className="text-slate-200 leading-relaxed text-lg font-light italic text-center relative z-10 px-2">
                    "{result.summary}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="p-5 pt-3 sm:p-8 sm:pt-4">
            <div className="flex gap-3">
              {revealStep > 0 && (
                <button onClick={goPrev} className="flex-1 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 font-medium transition-colors">
                  이전
                </button>
              )}
              {revealStep < TOTAL_STEPS - 1 ? (
                <button onClick={goNext} className="flex-[2] btn-seal py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all hover:-translate-y-0.5">
                  다음 결과 보기
                </button>
              ) : (
                <button onClick={goNext} className="flex-[2] btn-seal py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-900 font-bold shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all hover:-translate-y-0.5">
                  전체 결과 보기
                </button>
              )}
            </div>
            {revealStep < TOTAL_STEPS - 1 && (
              <button onClick={handleShowAll} className="w-full mt-3 text-slate-600 hover:text-slate-400 text-xs transition-colors">
                건너뛰고 전체 보기
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Full dashboard view (after all steps or skip) ───
  return (
    <div className="space-y-12 animate-fade-in pb-24 w-full max-w-5xl mx-auto">

      {/* 2026 Forecast Card */}
      <section className="glass-panel rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

        <div className="p-5 sm:p-8 md:p-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <div className="text-amber-500/70 text-xs tracking-[0.2em] font-serif uppercase mb-2">Strategic Analysis</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-100 flex items-center gap-3">
                <span className="text-amber-500 text-2xl">❖</span> 2026년 커리어 전략서
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEmail}
                className="p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl text-amber-500 transition-all hover:scale-105 active:scale-95"
                title="이메일로 보내기"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={handleCopy}
                className="p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl text-amber-500 transition-all hover:scale-105 active:scale-95"
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
          </header>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <ScoreBadge label="사주" score={result.analysis2026.sajuScore} color="text-amber-400" icon="📜" />
            <ScoreBadge label="점성술" score={result.analysis2026.astrologyScore} color="text-blue-400" icon="✨" />
            <ScoreBadge label="수비학" score={result.analysis2026.numerologyScore} color="text-purple-400" icon="🔢" />
            <div className="relative group col-span-2 lg:col-span-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <ScoreBadge label="통합 운세" score={result.analysis2026.totalScore} color="text-emerald-400" icon="🐲" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-10">
            <div className="space-y-3">
              <h3 className="text-lg font-serif font-bold text-amber-200/90 flex items-center">
                <span className="w-1 h-6 bg-amber-500/50 mr-3 rounded-full"></span> 포착해야 할 기회
              </h3>
              <div className="bg-slate-900/40 p-3 sm:p-5 rounded-2xl border border-slate-700/50">
                <p className="text-slate-300 leading-relaxed font-light">{result.analysis2026.opportunity}</p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-serif font-bold text-red-200/90 flex items-center">
                <span className="w-1 h-6 bg-red-500/50 mr-3 rounded-full"></span> 주의해야 할 위기
              </h3>
              <div className="bg-slate-900/40 p-3 sm:p-5 rounded-2xl border border-slate-700/50">
                <p className="text-slate-300 leading-relaxed font-light">{result.analysis2026.risk}</p>
              </div>
            </div>
          </div>

          <div className="relative p-4 sm:p-8 bg-gradient-to-br from-amber-900/20 to-slate-900/50 rounded-2xl border border-amber-500/20 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" className="text-amber-500 animate-[spin_60s_linear_infinite]">
                <path d="M50 0 L100 50 L50 100 L0 50 Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-amber-500 mb-4 font-serif relative z-10 flex items-center">
              <span className="mr-2 text-2xl">📜</span> 제갈량의 전략 제언
            </h3>
            <p className="text-slate-100 text-lg leading-relaxed font-serif italic relative z-10 pl-6 border-l-2 border-amber-500/30">
              "{result.analysis2026.strategy}"
            </p>
          </div>
        </div>
      </section>

      {/* Golden Era Visualization */}
      <section className="glass-panel rounded-3xl p-5 sm:p-8 md:p-10 relative overflow-hidden">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 mb-6 sm:mb-8 flex items-center">
          <span className="text-amber-500 mr-3">📈</span> 당신의 인생 황금기
        </h2>

        <div className="h-[350px] mb-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorSajuFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAstroFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNumFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#475569' }} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#e2e8f0', fontSize: '13px' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="saju" name="사주" fill="url(#colorSajuFull)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar dataKey="astro" name="점성술" fill="url(#colorAstroFull)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar dataKey="num" name="수비학" fill="url(#colorNumFull)" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6">
          {result.goldenPeaks.map((peak, idx) => (
            <div key={idx} className="group relative bg-slate-900/30 border border-slate-700/50 hover:border-amber-500/40 rounded-2xl p-4 sm:p-6 transition-all duration-500 hover:bg-slate-800/50">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 flex md:flex-col items-center gap-3">
                  <div className={`w-12 h-12 flex items-center justify-center font-bold text-xl rounded-full shadow-lg border-2 ${idx === 0 ? 'bg-amber-500 text-slate-900 border-amber-300' : 'bg-slate-800 text-slate-400 border-slate-600'}`}>
                    {peak.rank}
                  </div>
                  <div className="h-full w-0.5 bg-slate-700/50 hidden md:block"></div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h4 className="text-2xl font-bold text-slate-100 font-serif">{peak.year}년</h4>
                    <span className="text-slate-500 text-lg">({peak.age}세)</span>
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-full ml-auto md:ml-2">
                      {peak.focus}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{peak.description}</p>
                  <div className="pt-3 border-t border-slate-700/30">
                    <span className="text-amber-500/70 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Victory Strategy</span>
                    <p className="text-slate-200 text-sm italic font-serif">"{peak.strategy}"</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Summary Card */}
      <section className="glass-panel rounded-3xl p-5 sm:p-8 md:p-10 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

        <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mb-2">천기누설 총평</h3>
        <div className="w-16 h-1 bg-amber-500/30 mx-auto rounded-full"></div>
        <p className="text-slate-200 leading-relaxed text-lg font-light italic px-4 md:px-12">
          "{result.summary}"
        </p>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4">
          <button
            onClick={handleEmail}
            className="w-full md:w-auto px-8 py-4 btn-seal bg-gradient-to-r from-amber-600 to-amber-500 text-slate-900 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>분석 결과 이메일 발송</span>
          </button>
          <button
            onClick={onReset}
            className="w-full md:w-auto px-8 py-4 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-bold rounded-xl transition-all"
          >
            처음으로 돌아가기
          </button>
        </div>
      </section>
    </div>
  );
};

export default AnalysisDashboard;
