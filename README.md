# 제갈량의 천기누설 (Master Zhuge's Strategy)

사주, 점성술, 수비학을 결합한 AI 운세 전략 분석 웹앱.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Recharts
- **AI**: Claude API (Sonnet 4.5) via Supabase Edge Functions
- **Deploy**: Vercel (Frontend) + Supabase (Edge Functions)

## Setup

### 1. Supabase 설정

```bash
# Supabase CLI 설치 후
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
supabase functions deploy analyze
```

### 2. 프론트엔드 환경변수

`.env.example`을 `.env.local`로 복사 후 Supabase 프로젝트 URL과 anon key를 입력:

```bash
cp .env.example .env.local
```

### 3. 로컬 개발

```bash
npm install
npm run dev
```

### 4. Vercel 배포

Vercel에서 환경변수 설정:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Architecture

```
Browser → Vercel (Static) → Supabase Edge Function → Claude API
```

프론트엔드에서 직접 Claude API를 호출하지 않고, Supabase Edge Function을 프록시로 사용하여 API 키를 안전하게 보호합니다.
