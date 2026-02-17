
export interface BirthInfo {
  name: string;
  birthDate: string;
  birthTime?: string; // Optional
  birthPlace: string;
  gender: 'male' | 'female';
}

export interface YearAnalysis {
  year: number;
  sajuScore: number;
  astrologyScore: number;
  numerologyScore: number;
  totalScore: number;
  opportunity: string;
  risk: string;
  strategy: string;
}

export interface PeakYear {
  rank: number;
  year: number;
  age: number;
  scores: {
    saju: number;
    astrology: number;
    numerology: number;
  };
  focus: string; // Money or Career
  description: string;
  strategy: string;
}

export interface AnalysisResult {
  analysis2026: YearAnalysis;
  goldenPeaks: PeakYear[];
  summary: string;
}
