import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

interface BirthInfo {
  name: string;
  birthDate: string;
  birthTime?: string;
  birthPlace: string;
  gender: "male" | "female";
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const info: BirthInfo = await req.json();

    const timeContext = info.birthTime
      ? `출생 시간은 [${info.birthTime}]입니다. 이를 기반으로 사주 팔자(4기둥)와 점성술 하우스/상승궁을 포함한 정밀 분석을 수행하십시오.`
      : `출생 시간을 모릅니다. 사주는 '삼주 추명(년·월·일)'으로 분석하고, 점성술은 상승궁/하우스 없이 행성 간 각도(Aspect)와 트랜짓 중심으로 분석하십시오.`;

    const prompt = `당신은 역사상 최고의 지략가 '제갈량'입니다.
사용자의 정보: 성함[${info.name}], 생년월일[${info.birthDate}], 성별[${info.gender === "male" ? "남성" : "여성"}], 출생지[${info.birthPlace}].
${timeContext}

분석 미션:
1. 2026년 커리어 운세: 사주, 어스트롤로지(점성술), 수비학을 결합하여 분석하십시오.
   - 절대 좋은 말만 늘어놓지 마십시오. 날카롭고 솔직하게 '기회'와 '위기'를 짚어주십시오.
   - 책사로서 주군에게 보고하듯 엄격하고 논리적인 어조를 사용하십시오.
2. 인생의 황금기 Top 5: 20대부터 60대 사이의 커리어/금전 정점기 5곳을 연도별로 정확하게 산출하십시오.
3. 점수 산정: 각 항목(사주, 점성술, 수비학)에 대해 100점 만점 기준으로 점수를 매기십시오.
4. 금전과 커리어 중심 전략: 구체적인 행동 지침을 제안하십시오.

반드시 아래 JSON 구조로만 응답하십시오. JSON 외의 텍스트는 절대 포함하지 마십시오:

{
  "analysis2026": {
    "year": 2026,
    "sajuScore": (0-100 정수),
    "astrologyScore": (0-100 정수),
    "numerologyScore": (0-100 정수),
    "totalScore": (0-100 정수, 세 점수의 가중 평균),
    "opportunity": "(기회 분석 텍스트)",
    "risk": "(위기 분석 텍스트)",
    "strategy": "(전략 제언 텍스트)"
  },
  "goldenPeaks": [
    {
      "rank": 1,
      "year": (연도),
      "age": (나이),
      "scores": { "saju": (0-100), "astrology": (0-100), "numerology": (0-100) },
      "focus": "(Money 또는 Career)",
      "description": "(해당 연도 분석)",
      "strategy": "(해당 연도 전략)"
    }
  ],
  "summary": "(총평 텍스트)"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI 분석 중 오류가 발생했습니다.", details: errorText }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const textContent = data.content?.find((block: any) => block.type === "text")?.text;

    if (!textContent) {
      throw new Error("No text content in response");
    }

    // Extract JSON from the response (handle potential markdown code blocks)
    let jsonStr = textContent.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const analysisResult = JSON.parse(jsonStr);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "분석 처리 중 오류가 발생했습니다.", message: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
