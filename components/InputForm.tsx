
import React, { useState } from 'react';
import { BirthInfo } from '../types';

interface Props {
  onSubmit: (info: BirthInfo) => void;
}

type FormStep = 'welcome' | 'name' | 'gender_date' | 'time_place';

const InputForm: React.FC<Props> = ({ onSubmit }) => {
  const [step, setStep] = useState<FormStep>('welcome');
  const [isUnknownTime, setIsUnknownTime] = useState(false);
  const [formData, setFormData] = useState<BirthInfo>({
    name: '',
    birthDate: '',
    birthTime: '12:00',
    birthPlace: '',
    gender: 'male',
  });

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

  const progress = {
    welcome: 0,
    name: 33,
    gender_date: 66,
    time_place: 100,
  }[step];

  return (
    <div className="w-full max-w-md mx-auto min-h-[500px] flex flex-col justify-between">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-amber-500 transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center">
        {step === 'welcome' && (
          <div className="text-center space-y-8 animate-fade-in w-full">
            <div className="w-48 h-48 mx-auto relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse"></div>
              {/* Stylized Fan Illustration (Simple SVG) */}
              <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full text-amber-500 fill-current opacity-80">
                <path d="M50 85 C30 85 10 70 5 50 C5 30 25 15 50 15 C75 15 95 30 95 50 C90 70 70 85 50 85 M50 20 C35 20 20 30 20 45 C20 60 35 75 50 75 C65 75 80 60 80 45 C80 30 65 20 50 20" opacity="0.5"/>
                <path d="M50 80 L30 30 M50 80 L40 25 M50 80 L50 20 M50 80 L60 25 M50 80 L70 30" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-serif font-bold text-slate-100">어서오십시오, 주군.</h2>
              <p className="text-slate-400 leading-relaxed px-4">
                저는 당신의 승리를 위해 북극성을 읽는 책사 제갈량입니다. <br/>
                당신의 천명을 분석하여 전략을 제안하겠습니다.
              </p>
            </div>
            <button
              onClick={nextStep}
              className="w-full bg-amber-500 text-slate-950 font-bold py-4 rounded-2xl shadow-lg transition-transform active:scale-95"
            >
              알현 시작하기
            </button>
          </div>
        )}

        {step === 'name' && (
          <div className="w-full space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-amber-500 font-serif text-lg">첫 번째 질문</span>
              <h2 className="text-2xl font-bold text-slate-100">주군의 존함은 어떻게 되십니까?</h2>
            </div>
            <input
              autoFocus
              type="text"
              className="w-full bg-slate-900/50 border-b-2 border-slate-700 text-3xl font-bold py-4 text-amber-500 focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-800"
              placeholder="이름 혹은 별칭"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && formData.name && nextStep()}
            />
            <div className="flex gap-3 pt-8">
              <button onClick={prevStep} className="flex-1 py-4 rounded-2xl bg-slate-800 text-slate-400 font-bold">이전</button>
              <button 
                onClick={nextStep} 
                disabled={!formData.name}
                className="flex-[2] py-4 rounded-2xl bg-amber-500 text-slate-950 font-bold disabled:opacity-50"
              >
                다음 단계로
              </button>
            </div>
          </div>
        )}

        {step === 'gender_date' && (
          <div className="w-full space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-amber-500 font-serif text-lg">두 번째 질문</span>
              <h2 className="text-2xl font-bold text-slate-100">어느 때에 세상에 나오셨습니까?</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  className={`flex-1 py-4 rounded-2xl border-2 transition-all font-bold ${
                    formData.gender === 'male' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-800 text-slate-500'
                  }`}
                >
                  남성
                </button>
                <button
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  className={`flex-1 py-4 rounded-2xl border-2 transition-all font-bold ${
                    formData.gender === 'female' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-800 text-slate-500'
                  }`}
                >
                  여성
                </button>
              </div>

              <input
                required
                type="date"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-8">
              <button onClick={prevStep} className="flex-1 py-4 rounded-2xl bg-slate-800 text-slate-400 font-bold">이전</button>
              <button 
                onClick={nextStep} 
                disabled={!formData.birthDate}
                className="flex-[2] py-4 rounded-2xl bg-amber-500 text-slate-950 font-bold disabled:opacity-50"
              >
                다음 단계로
              </button>
            </div>
          </div>
        )}

        {step === 'time_place' && (
          <div className="w-full space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-amber-500 font-serif text-lg">마지막 질문</span>
              <h2 className="text-2xl font-bold text-slate-100">탄생의 시(時)와 지(地)를 묻습니다.</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-sm text-slate-400">출생 시간</span>
                  <label className="flex items-center text-xs text-slate-500 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-1 accent-amber-500"
                      checked={isUnknownTime}
                      onChange={(e) => setIsUnknownTime(e.target.checked)}
                    />
                    모름
                  </label>
                </div>
                <input
                  disabled={isUnknownTime}
                  type="time"
                  className={`w-full border rounded-2xl px-4 py-4 text-xl transition-all ${
                    isUnknownTime ? 'bg-slate-900 border-slate-800 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                />
              </div>

              <div>
                <span className="block text-sm text-slate-400 mb-2 px-1">출생 지역</span>
                <input
                  required
                  type="text"
                  placeholder="예: 서울, 부산 등"
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-8">
              <button onClick={prevStep} className="flex-1 py-4 rounded-2xl bg-slate-800 text-slate-400 font-bold">이전</button>
              <button 
                onClick={handleSubmit}
                disabled={!formData.birthPlace}
                className="flex-[2] py-4 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-xl shadow-amber-500/20"
              >
                천기누설 받기
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 text-center">
         <p className="text-[10px] text-slate-600 uppercase tracking-widest font-serif">Master Zhuge Liang's Hidden Strategy</p>
      </div>
    </div>
  );
};

export default InputForm;
