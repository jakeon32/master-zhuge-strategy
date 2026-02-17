import { BirthInfo, AnalysisResult } from "../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const getFortuneAnalysis = async (info: BirthInfo): Promise<AnalysisResult> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(info),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `분석 요청 실패 (${response.status})`);
  }

  const data: AnalysisResult = await response.json();
  return data;
};
