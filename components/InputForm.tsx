
import React, { useState } from 'react';
import { BirthInfo } from '../types';

interface Props {
  onSubmit: (info: BirthInfo) => void;
}

type FormStep = 'welcome' | 'name' | 'gender_date' | 'time_place';

const InputForm: React.FC<Props> = ({ onSubmit }) => {
  const [step, setStep] = useState<FormStep>('welcome');
  const [isUnknownTime, setIsUnknownTime] = useState(false);
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

  const updateBirthDate = (y: string, m: string, d: string) => {
    setBirthYear(y); setBirthMonth(m); setBirthDay(d);
    if (y && m && d) {
      const date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, birthDate: date }));
    } else {
      setFormData(prev => ({ ...prev, birthDate: '' }));
    }
  };

  const nextStep = () => {
    if (step === 'welcome') setStep('name');
    else if (step === 'name' && formData.name) setStep('gender_date');
    else if (step === 'gender_date' && formData.birthDate) setStep('time_place');
  };

  const prevStep = () => {
    if (step === 'name') setStep('welcome');
    else if (step === 'gender_date') setStep('name');
    else if (step === 'time_place') setStep('gender_date');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData: BirthInfo = {
      ...formData,
      birthTime: isUnknownTime ? undefined : formData.birthTime,
    };
    onSubmit(submissionData);
  };

  const steps = ['welcome', 'name', 'gender_date', 'time_place'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="w-full max-w-lg mx-auto min-h-[550px] flex flex-col justify-between p-8 rounded-3xl glass-panel relative overflow-hidden transition-all duration-500">

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/30 rounded-tl-xl pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500/30 rounded-tr-xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500/30 rounded-bl-xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/30 rounded-br-xl pointer-events-none"></div>

      {/* Progress Dots */}
      <div className="flex justify-center space-x-3 mb-8">
        {steps.map((s, idx) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-500 ${idx <= currentStepIndex ? 'w-8 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'w-2 bg-slate-700'
              }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {step === 'welcome' && (
          <div className="text-center space-y-8 animate-fade-in w-full">
            <div className="relative w-40 h-40 mx-auto group">
              <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-3xl animate-pulse group-hover:bg-amber-500/20 transition-all duration-700"></div>
              {/* Animated Fan SVG */}
              <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full text-amber-500 fill-current opacity-90 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-float">
                <path d="M50 85 C30 85 10 70 5 50 C5 30 25 15 50 15 C75 15 95 30 95 50 C90 70 70 85 50 85 M50 20 C35 20 20 30 20 45 C20 60 35 75 50 75 C65 75 80 60 80 45 C80 30 65 20 50 20" opacity="0.4" />
                <path d="M50 80 L30 30 M50 80 L40 25 M50 80 L50 20 M50 80 L60 25 M50 80 L70 30" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="50" cy="80" r="3" fill="#fbbf24" />
              </svg>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-serif font-bold text-slate-100 drop-shadow-md">어서오십시오, 주군.</h2>
              <p className="text-slate-300/80 leading-relaxed px-4 font-light tracking-wide">
                저는 당신의 승리를 위해 북극성을 읽는 책사 <span className="text-amber-400 font-medium">제갈량</span>입니다. <br />
                천명을 분석하여 최선의 전략을 제안하겠습니다.
              </p>
            </div>
            <button
              onClick={nextStep}
              className="w-full btn-seal bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all transform hover:-translate-y-1"
            >
              알현 시작하기
            </button>
          </div>
        )}

        {step === 'name' && (
          <div className="w-full space-y-10 animate-fade-in text-center">
            <div className="space-y-4">
              <span className="text-amber-500/80 font-serif text-sm tracking-widest uppercase">Question I</span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-100">주군의 존함은 어떻게 되십니까?</h2>
            </div>
            <div className="px-4">
              <input
                autoFocus
                type="text"
                className="w-full bg-transparent text-center text-4xl font-serif font-bold py-4 text-amber-500 input-underline focus:outline-none placeholder:text-slate-700/50"
                placeholder="이름"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && formData.name && nextStep()}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 font-medium transition-colors">이전</button>
              <button
                onClick={nextStep}
                disabled={!formData.name}
                className="flex-[2] btn-seal py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {step === 'gender_date' && (
          <div className="w-full space-y-8 animate-fade-in text-center">
            <div className="space-y-4">
              <span className="text-amber-500/80 font-serif text-sm tracking-widest uppercase">Question II</span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-100">어느 때에 세상에 나오셨습니까?</h2>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 p-1 bg-slate-900/40 rounded-2xl mx-auto max-w-xs">
                <button
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  className={`flex-1 py-3 rounded-xl transition-all duration-300 font-medium ${formData.gender === 'male' ? 'bg-amber-500 text-slate-900 shadow-md scale-105' : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  남성
                </button>
                <button
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  className={`flex-1 py-3 rounded-xl transition-all duration-300 font-medium ${formData.gender === 'female' ? 'bg-amber-500 text-slate-900 shadow-md scale-105' : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  여성
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/30 rounded-xl p-2 border border-slate-700/50 hover:border-amber-500/30 transition-colors">
                  <span className="block text-xs text-slate-500 mb-1">년(Year)</span>
                  <select
                    className="w-full bg-transparent text-lg text-slate-100 focus:outline-none appearance-none text-center cursor-pointer"
                    value={birthYear}
                    onChange={(e) => updateBirthDate(e.target.value, birthMonth, birthDay)}
                  >
                    <option value="" className="bg-slate-900">--</option>
                    {years.map(y => <option key={y} value={String(y)} className="bg-slate-900">{y}</option>)}
                  </select>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-2 border border-slate-700/50 hover:border-amber-500/30 transition-colors">
                  <span className="block text-xs text-slate-500 mb-1">월(Month)</span>
                  <select
                    className="w-full bg-transparent text-lg text-slate-100 focus:outline-none appearance-none text-center cursor-pointer"
                    value={birthMonth}
                    onChange={(e) => updateBirthDate(birthYear, e.target.value, birthDay)}
                  >
                    <option value="" className="bg-slate-900">--</option>
                    {months.map(m => <option key={m} value={String(m)} className="bg-slate-900">{m}</option>)}
                  </select>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-2 border border-slate-700/50 hover:border-amber-500/30 transition-colors">
                  <span className="block text-xs text-slate-500 mb-1">일(Day)</span>
                  <select
                    className="w-full bg-transparent text-lg text-slate-100 focus:outline-none appearance-none text-center cursor-pointer"
                    value={birthDay}
                    onChange={(e) => updateBirthDate(birthYear, birthMonth, e.target.value)}
                  >
                    <option value="" className="bg-slate-900">--</option>
                    {getDaysInMonth(birthYear, birthMonth).map(d => <option key={d} value={String(d)} className="bg-slate-900">{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 font-medium transition-colors">이전</button>
              <button
                onClick={nextStep}
                disabled={!formData.birthDate}
                className="flex-[2] btn-seal py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold disabled:opacity-50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {step === 'time_place' && (
          <div className="w-full space-y-8 animate-fade-in text-center">
            <div className="space-y-4">
              <span className="text-amber-500/80 font-serif text-sm tracking-widest uppercase">Last Question</span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-100">탄생의 시(時)와 지(地)를 묻습니다.</h2>
            </div>

            <div className="space-y-8 px-4">
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400">출생 시간</span>
                  <label className="flex items-center text-xs text-slate-500 cursor-pointer hover:text-amber-500 transition-colors">
                    <input
                      type="checkbox"
                      className="mr-2 accent-amber-500"
                      checked={isUnknownTime}
                      onChange={(e) => setIsUnknownTime(e.target.checked)}
                    />
                    시간을 모릅니다
                  </label>
                </div>
                <input
                  disabled={isUnknownTime}
                  type="time"
                  className={`w-full bg-transparent text-center text-2xl py-2 px-4 border rounded-xl transition-all ${isUnknownTime ? 'border-slate-800 text-slate-700 cursor-not-allowed' : 'border-slate-600 text-amber-500 focus:border-amber-500'
                    }`}
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                />
              </div>

              <div>
                <input
                  required
                  type="text"
                  placeholder="태어난 지역 (예: 서울)"
                  className="w-full bg-transparent text-center text-2xl font-serif font-bold py-3 text-amber-500 input-underline focus:outline-none placeholder:text-slate-700/50"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-8">
              <button onClick={prevStep} className="flex-1 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 font-medium transition-colors">이전</button>
              <button
                onClick={handleSubmit}
                disabled={!formData.birthPlace}
                className="flex-[2] btn-seal py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-900 font-bold shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-1"
              >
                천기누설 받기
              </button>
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
