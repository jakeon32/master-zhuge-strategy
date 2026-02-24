
import React, { useState } from 'react';
import { BirthInfo } from '../types';

interface Props {
  onSubmit: (info: BirthInfo) => void;
}

type FormStep = 'welcome' | 'name' | 'gender' | 'year' | 'monthday' | 'time' | 'place';

const getZodiacAnimal = (year: number) => {
  const animals = ['원숭이', '닭', '개', '돼지', '쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양'];
  const emojis = ['🐵', '🐔', '🐕', '🐷', '🐀', '🐂', '🐅', '🐇', '🐉', '🐍', '🐎', '🐑'];
  const idx = year % 12;
  return { name: animals[idx], emoji: emojis[idx] };
};

const getGanJi = (year: number) => {
  const gan = ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'];
  const ji = ['신', '유', '술', '해', '자', '축', '인', '묘', '진', '사', '오', '미'];
  return `${gan[year % 10]}${ji[year % 12]}`;
};

const getZodiacSign = (month: number, day: number) => {
  const signs = [
    { name: '염소자리', emoji: '♑', end: [1, 19] },
    { name: '물병자리', emoji: '♒', end: [2, 18] },
    { name: '물고기자리', emoji: '♓', end: [3, 20] },
    { name: '양자리', emoji: '♈', end: [4, 19] },
    { name: '황소자리', emoji: '♉', end: [5, 20] },
    { name: '쌍둥이자리', emoji: '♊', end: [6, 21] },
    { name: '게자리', emoji: '♋', end: [7, 22] },
    { name: '사자자리', emoji: '♌', end: [8, 22] },
    { name: '처녀자리', emoji: '♍', end: [9, 22] },
    { name: '천칭자리', emoji: '♎', end: [10, 23] },
    { name: '전갈자리', emoji: '♏', end: [11, 22] },
    { name: '궁수자리', emoji: '♐', end: [12, 21] },
  ];
  for (let i = 0; i < signs.length; i++) {
    if (month < signs[i].end[0] || (month === signs[i].end[0] && day <= signs[i].end[1])) {
      return signs[i];
    }
  }
  return signs[0];
};

const getTimePillar = (hour: number) => {
  const pillars = [
    { name: '자시', range: '23:00~01:00', desc: '고요한 밤, 새로운 시작의 기운' },
    { name: '축시', range: '01:00~03:00', desc: '대지의 기운이 움트는 시각' },
    { name: '인시', range: '03:00~05:00', desc: '호랑이의 기운, 용맹한 새벽' },
    { name: '묘시', range: '05:00~07:00', desc: '동이 트는 시각, 희망의 빛' },
    { name: '진시', range: '07:00~09:00', desc: '용이 승천하는 시각' },
    { name: '사시', range: '09:00~11:00', desc: '뱀의 지혜, 맑은 오전' },
    { name: '오시', range: '11:00~13:00', desc: '하늘 가운데, 양기 극성' },
    { name: '미시', range: '13:00~15:00', desc: '온화한 오후, 조화의 기운' },
    { name: '신시', range: '15:00~17:00', desc: '금의 기운, 결실의 시각' },
    { name: '유시', range: '17:00~19:00', desc: '노을의 시각, 수확의 때' },
    { name: '술시', range: '19:00~21:00', desc: '충직한 저녁, 수성의 시각' },
    { name: '해시', range: '21:00~23:00', desc: '깊은 밤, 내면의 성찰' },
  ];
  const idx = hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12;
  return pillars[idx];
};

const InputForm: React.FC<Props> = ({ onSubmit }) => {
  const [step, setStep] = useState<FormStep>('welcome');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [formData, setFormData] = useState<BirthInfo>({
    name: '',
    birthDate: '',
    birthTime: '12:00',
    birthPlace: '',
    gender: 'male',
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const getDaysInMonth = (y: string, m: string) => {
    if (!y || !m) return Array.from({ length: 31 }, (_, i) => i + 1);
    return Array.from({ length: new Date(Number(y), Number(m), 0).getDate() }, (_, i) => i + 1);
  };

  const allSteps: FormStep[] = ['welcome', 'name', 'gender', 'year', 'monthday', 'time', 'place'];
  const currentIdx = allSteps.indexOf(step);

  const goNext = () => {
    const idx = allSteps.indexOf(step);
    if (idx < allSteps.length - 1) setStep(allSteps[idx + 1]);
  };
  const goPrev = () => {
    const idx = allSteps.indexOf(step);
    if (idx > 0) setStep(allSteps[idx - 1]);
  };

  const handleSubmit = () => {
    const date = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    onSubmit({ ...formData, birthDate: date });
  };

  const handleTimeSkip = () => {
    setFormData(prev => ({ ...prev, birthTime: undefined as any }));
    setStep('place');
  };

  const stepLabels: Record<FormStep, { num: string; question: string }> = {
    welcome: { num: '', question: '' },
    name: { num: 'I', question: '주군의 존함을 알려주십시오' },
    gender: { num: 'II', question: '음양의 기운을 확인합니다' },
    year: { num: 'III', question: '탄생의 해(年)를 묻습니다' },
    monthday: { num: 'IV', question: '탄생의 월일(月日)을 묻습니다' },
    time: { num: 'V', question: '탄생의 시(時)를 묻습니다' },
    place: { num: 'VI', question: '마지막으로, 탄생의 지(地)를 묻습니다' },
  };

  const zodiac = birthYear ? getZodiacAnimal(Number(birthYear)) : null;
  const ganji = birthYear ? getGanJi(Number(birthYear)) : null;
  const zodiacSign = birthMonth && birthDay ? getZodiacSign(Number(birthMonth), Number(birthDay)) : null;
  const timePillar = formData.birthTime ? getTimePillar(Number(formData.birthTime.split(':')[0])) : null;

  return (
    <div className="w-full max-w-lg mx-auto min-h-[550px] flex flex-col justify-between p-5 sm:p-8 rounded-3xl glass-panel relative overflow-hidden transition-all duration-500">
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/30 rounded-tl-xl pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500/30 rounded-tr-xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500/30 rounded-bl-xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/30 rounded-br-xl pointer-events-none"></div>
      <div className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-1000" style={{ boxShadow: `inset 0 0 ${currentIdx * 15}px rgba(245, 158, 11, ${currentIdx * 0.02})` }} />

      {step !== 'welcome' && (
        <div className="flex justify-center space-x-2 mb-8">
          {allSteps.slice(1).map((s, idx) => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${idx < currentIdx ? 'w-8 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : idx === currentIdx - 1 ? 'w-8 bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'w-2 bg-slate-700'}`} />
          ))}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {step === 'welcome' && (
          <div className="text-center space-y-8 animate-fade-in w-full">
            <div className="relative w-40 h-40 mx-auto group">
              <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-3xl animate-pulse group-hover:bg-amber-500/20 transition-all duration-700"></div>
              <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full text-amber-500 fill-current opacity-90 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-float">
                <path d="M50 85 C30 85 10 70 5 50 C5 30 25 15 50 15 C75 15 95 30 95 50 C90 70 70 85 50 85 M50 20 C35 20 20 30 20 45 C20 60 35 75 50 75 C65 75 80 60 80 45 C80 30 65 20 50 20" opacity="0.4" />
                <path d="M50 80 L30 30 M50 80 L40 25 M50 80 L50 20 M50 80 L60 25 M50 80 L70 30" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="50" cy="80" r="3" fill="#fbbf24" />
              </svg>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 drop-shadow-md">어서오십시오, 주군.</h2>
              <p className="text-slate-300/80 leading-relaxed px-4 font-light tracking-wide">
                저는 당신의 승리를 위해 북극성을 읽는 책사 <span className="text-amber-400 font-medium">제갈량</span>입니다. <br />
                천명을 분석하여 최선의 전략을 제안하겠습니다.
              </p>
            </div>
            <button onClick={goNext} className="w-full btn-seal bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all transform hover:-translate-y-1">알현 시작하기</button>
          </div>
        )}

        {step === 'name' && (
          <div className="w-full space-y-10 animate-fade-in text-center">
            <div className="space-y-3">
              <span className="text-amber-500/80 font-serif text-sm tracking-widest uppercase">Question {stepLabels.name.num}</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-100">{stepLabels.name.question}</h2>
            </div>
            <div className="px-4">
              <input autoFocus type="text" className="w-full bg-transparent text-center text-2xl sm:text-4xl font-serif font-bold py-4 text-amber-500 input-underline focus:outline-none placeholder:text-slate-700/50" placeholder="이름 혹은 별칭" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && formData.name && goNext()} />
            </div>
            {formData.name && <p className="text-slate-500 text-sm animate-fade-up"><span className="text-amber-400">{formData.name}</span> 주군이시군요. 반갑습니다.</p>}
            <div className="flex gap-4 pt-4">
              <button onClick={goPrev} className="flex-1 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 font-medium transition-colors">이전</button>
              <button onClick={goNext} disabled={!formData.name} className="flex-[2] btn-seal py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(245,158,11,0.15)]">다음</button>
            </div>
          </div>
        )}

        {step === 'gender' && (
          <div className="w-full space-y-10 animate-fade-in text-center">
            <div className="space-y-3">
              <span className="text-amber-500/80 font-serif text-sm tracking-widest uppercase">Question {stepLabels.gender.num}</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-100">{stepLabels.gender.question}</h2>
            </div>
            <div className="flex gap-6 justify-center">
              <button onClick={() => setFormData({ ...formData, gender: 'male' })} className={`w-32 h-32 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${formData.gender === 'male' ? 'border-amber-500 bg-amber-500/10 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-slate-700 hover:border-slate-500'}`}>
                <span className="text-4xl">☀️</span>
                <span className={`font-serif font-bold ${formData.gender === 'male' ? 'text-amber-500' : 'text-slate-500'}`}>양 (陽)</span>
                <span className="text-xs text-slate-500">남성</span>
              </button>
              <button onClick={() => setFormData({ ...formData, gender: 'female' })} className={`w-32 h-32 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${formData.gender === 'female' ? 'border-amber-500 bg-amber-500/10 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-slate-700 hover:border-slate-500'}`}>
                <span className="text-4xl">🌙</span>
                <span className={`font-serif font-bold ${formData.gender === 'female' ? 'text-amber-500' : 'text-slate-500'}`}>음 (陰)</span>
                <span className="text-xs text-slate-500">여성</span>
              </button>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={goPrev} className="flex-1 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 font-medium transition-colors">이전</button>
              <button onClick={goNext} className="flex-[2] btn-seal py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)]">다음</button>
            </div>
          </div>
        )}

        {step === 'year' && (
          <div className="w-full space-y-8 animate-fade-in text-center">
            <div className="space-y-3">
              <span className="text-amber-500/80 font-serif text-sm tracking-widest uppercase">Question {stepLabels.year.num}</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-100">{stepLabels.year.question}</h2>
            </div>
            <div className="max-w-xs mx-auto">
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 hover:border-amber-500/30 transition-colors">
                <select className="w-full bg-transparent text-2xl sm:text-3xl text-amber-500 font-serif font-bold focus:outline-none appearance-none text-center cursor-pointer" value={birthYear} onChange={(e) => setBirthYear(e.target.value)}>
                  <option value="" className="bg-slate-900 text-slate-500">출생 연도</option>
                  {years.map(y => <option key={y} value={String(y)} className="bg-slate-900 text-slate-100">{y}년</option>)}
                </select>
              </div>
            </div>
            {zodiac && ganji && (
              <div className="animate-fade-up space-y-2 py-4">
                <div className="text-5xl">{zodiac.emoji}</div>
                <p className="text-amber-400 font-serif text-lg font-bold">{ganji}년 — {zodiac.name}띠</p>
                <p className="text-slate-500 text-xs">주군은 {zodiac.name}의 기운을 타고나셨습니다</p>
              </div>
            )}
            <div className="flex gap-4 pt-4">
              <button onClick={goPrev} className="flex-1 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 font-medium transition-colors">이전</button>
              <button onClick={goNext} disabled={!birthYear} className="flex-[2] btn-seal py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold disabled:opacity-50 shadow-[0_0_15px_rgba(245,158,11,0.15)]">다음</button>
            </div>
          </div>
        )}

        {step === 'monthday' && (
          <div className="w-full space-y-8 animate-fade-in text-center">
            <div className="space-y-3">
              <span className="text-amber-500/80 font-serif text-sm tracking-widest uppercase">Question {stepLabels.monthday.num}</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-100">{stepLabels.monthday.question}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50 hover:border-amber-500/30 transition-colors">
                <span className="block text-xs text-slate-500 mb-1">월</span>
                <select className="w-full bg-transparent text-2xl text-amber-500 font-serif font-bold focus:outline-none appearance-none text-center cursor-pointer" value={birthMonth} onChange={(e) => { setBirthMonth(e.target.value); setBirthDay(''); }}>
                  <option value="" className="bg-slate-900">--</option>
                  {months.map(m => <option key={m} value={String(m)} className="bg-slate-900">{m}월</option>)}
                </select>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50 hover:border-amber-500/30 transition-colors">
                <span className="block text-xs text-slate-500 mb-1">일</span>
                <select className="w-full bg-transparent text-2xl text-amber-500 font-serif font-bold focus:outline-none appearance-none text-center cursor-pointer" value={birthDay} onChange={(e) => setBirthDay(e.target.value)}>
                  <option value="" className="bg-slate-900">--</option>
                  {getDaysInMonth(birthYear, birthMonth).map(d => <option key={d} value={String(d)} className="bg-slate-900">{d}일</option>)}
                </select>
              </div>
            </div>
            {zodiacSign && (
              <div className="animate-fade-up space-y-2 py-4">
                <div className="text-5xl">{zodiacSign.emoji}</div>
                <p className="text-amber-400 font-serif text-lg font-bold">{zodiacSign.name}</p>
                <p className="text-slate-500 text-xs">{zodiac?.emoji} {zodiac?.name}띠 + {zodiacSign.name}의 조합이 드러났습니다</p>
              </div>
            )}
            <div className="flex gap-4 pt-4">
              <button onClick={goPrev} className="flex-1 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 font-medium transition-colors">이전</button>
              <button onClick={goNext} disabled={!birthMonth || !birthDay} className="flex-[2] btn-seal py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold disabled:opacity-50 shadow-[0_0_15px_rgba(245,158,11,0.15)]">다음</button>
            </div>
          </div>
        )}

        {step === 'time' && (
          <div className="w-full space-y-8 animate-fade-in text-center">
            <div className="space-y-3">
              <span className="text-amber-500/80 font-serif text-sm tracking-widest uppercase">Question {stepLabels.time.num}</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-100">{stepLabels.time.question}</h2>
              <p className="text-slate-500 text-sm">시간을 모르시면 아래 "모름" 버튼을 누르십시오</p>
            </div>
            <div className="max-w-xs mx-auto">
              <input type="time" className="w-full bg-transparent text-center text-2xl sm:text-3xl py-3 px-4 border border-slate-600 rounded-xl text-amber-500 focus:border-amber-500 focus:outline-none transition-all" value={formData.birthTime || '12:00'} onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })} />
            </div>
            {timePillar && (
              <div className="animate-fade-up space-y-2 py-2">
                <p className="text-amber-400 font-serif text-lg font-bold">{timePillar.name} ({timePillar.range})</p>
                <p className="text-slate-500 text-xs">{timePillar.desc}</p>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button onClick={goPrev} className="flex-1 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 font-medium transition-colors">이전</button>
              <button onClick={handleTimeSkip} className="flex-1 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 font-medium transition-colors">모름</button>
              <button onClick={goNext} className="flex-[2] btn-seal py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)]">다음</button>
            </div>
          </div>
        )}

        {step === 'place' && (
          <div className="w-full space-y-8 animate-fade-in text-center">
            <div className="space-y-3">
              <span className="text-amber-500/80 font-serif text-sm tracking-widest uppercase">Final Question</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-100">{stepLabels.place.question}</h2>
            </div>
            <div className="px-4">
              <input autoFocus required type="text" placeholder="예: 서울, 부산, 뉴욕" className="w-full bg-transparent text-center text-2xl sm:text-3xl font-serif font-bold py-4 text-amber-500 input-underline focus:outline-none placeholder:text-slate-700/50" value={formData.birthPlace} onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && formData.birthPlace && handleSubmit()} />
            </div>
            {formData.birthPlace && (
              <p className="text-slate-500 text-sm animate-fade-up">
                {zodiac?.emoji} {birthYear}년 {birthMonth}월 {birthDay}일생, <span className="text-amber-400">{formData.birthPlace}</span> 출신
              </p>
            )}
            <div className="flex gap-4 pt-8">
              <button onClick={goPrev} className="flex-1 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 font-medium transition-colors">이전</button>
              <button onClick={handleSubmit} disabled={!formData.birthPlace} className="flex-[2] btn-seal py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-900 font-bold shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-1">천기누설 받기</button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-serif">Master Zhuge Liang's Hidden Strategy</p>
      </div>
    </div>
  );
};

export default InputForm;
