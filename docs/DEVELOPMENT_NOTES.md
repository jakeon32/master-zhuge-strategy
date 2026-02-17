# 제갈량의 천기누설 (Master Zhuge's Strategy) - 개발 노트

> 최종 업데이트: 2026-02-17
> 이 문서는 다른 환경(안티그래비티 등)에서 작업을 이어가더라도 컨텍스트를 잃지 않도록 작성되었습니다.

---

## 1. 프로젝트 개요

사주, 점성술, 수비학을 결합한 **AI 운세 전략 분석** 웹앱.
사용자가 이름/생년월일/출생시간/출생지를 입력하면 Claude API가 제갈량 페르소나로 2026년 커리어 운세와 인생 황금기 Top 5를 분석해준다.

---

## 2. 기술 스택

| 구분 | 기술 | 비고 |
|------|------|------|
| **Frontend** | React 19 + TypeScript + Vite 6 | SPA, CSR |
| **스타일링** | Tailwind CSS (CDN) + 커스텀 CSS (`index.css`) | 빌드 없이 CDN 사용 |
| **차트** | Recharts 3.7 | 황금기 차트 |
| **백엔드** | Supabase Edge Functions (Deno) | Claude API 프록시 |
| **AI** | Anthropic Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) | 운세 분석 |
| **DB** | Supabase PostgreSQL | profiles, analyses, rate_limits |
| **배포** | Vercel (Git 연동 자동 배포) | main 브랜치 push → 자동 빌드 |

---

## 3. 아키텍처 흐름

```
[사용자 브라우저]
    │
    ├─ React SPA (Vercel에서 서빙)
    │
    ├─ POST /functions/v1/analyze
    │   │
    │   ▼
    │  [Supabase Edge Function] (supabase/functions/analyze/index.ts)
    │   │
    │   ├─ ANTHROPIC_API_KEY로 Claude API 호출
    │   ├─ JSON 응답 파싱 후 프론트에 반환
    │   │
    │   ▼
    │  [Anthropic API] (claude-sonnet-4-5-20250929)
    │
    └─ 결과 화면 렌더링 (AnalysisDashboard)
```

**핵심 포인트**: API 키는 Edge Function 서버에만 존재. 프론트에서는 Supabase anon key로 Edge Function만 호출.

---

## 4. 계정 및 인프라 정보

### GitHub
- **계정**: jakeon32
- **저장소**: https://github.com/jakeon32/master-zhuge-strategy
- **브랜치**: main (단일 브랜치)

### Supabase
- **프로젝트 Ref**: `hjulnwfymubvxpkgotgy`
- **대시보드**: https://supabase.com/dashboard/project/hjulnwfymubvxpkgotgy
- **URL**: `https://hjulnwfymubvxpkgotgy.supabase.co`
- **Anon Key**: `.env` 파일 참조 (공개키, 브라우저 노출 OK)
- **Edge Function**: `analyze` (--no-verify-jwt로 배포됨, 익명 접근 허용)
- **Secret**: `ANTHROPIC_API_KEY`가 Supabase Secrets에 등록됨

### Vercel
- **프로덕션 URL**: https://master-zhuge-strategy.vercel.app/
- **Git 연동**: GitHub jakeon32/master-zhuge-strategy → main push 시 자동 배포
- **환경변수** (Vercel 대시보드 > Settings > Environment Variables):
  - `VITE_SUPABASE_URL` = Supabase 프로젝트 URL
  - `VITE_SUPABASE_ANON_KEY` = Supabase anon key
- **중요**: Vite는 빌드 타임에 `VITE_` 변수를 번들에 embed함. 환경변수 변경 후 **반드시 Redeploy** 필요.

---

## 5. 프로젝트 파일 구조

```
/
├── index.html              # HTML 엔트리 (Tailwind CDN, Google Fonts, animate-fade-in)
├── index.tsx               # React 엔트리 (index.css import)
├── index.css               # 커스텀 CSS (bg-mystical, stars, glass-panel, btn-seal, animate-float 등)
├── App.tsx                 # 메인 앱 (input → loading → result 3단계 FSM)
├── types.ts                # TypeScript 타입 정의 (BirthInfo, AnalysisResult, PeakYear 등)
├── vite.config.ts          # Vite 설정 (port 3000, @ alias)
├── tsconfig.json           # TypeScript 설정
├── package.json            # 의존성 (react, react-dom, recharts)
├── .env                    # 환경변수 (git에서 제외됨)
├── .env.example            # 환경변수 템플릿
├── .gitignore
│
├── components/
│   ├── InputForm.tsx       # 4단계 입력 폼 (welcome → name → gender_date → time_place)
│   ├── LoadingScreen.tsx   # 로딩 화면 (원형 glass-panel, SVG 스피너, 프로그레스 바)
│   └── AnalysisDashboard.tsx  # 결과 대시보드 (점수 배지, 차트, 황금기 카드, 총평)
│
├── services/
│   ├── claudeService.ts    # Supabase Edge Function 호출 (현재 사용 중)
│   └── geminiService.ts    # DEPRECATED - claudeService.ts로 re-export만 함
│
└── supabase/
    ├── config.toml         # Supabase 로컬 설정
    ├── functions/
    │   └── analyze/
    │       └── index.ts    # Edge Function: Claude API 프록시 (Deno)
    └── migrations/
        └── 20260217035148_init_schema.sql  # DB 스키마 (profiles, analyses, rate_limits)
```

---

## 6. 핵심 컴포넌트 상세

### 6.1 App.tsx - 메인 FSM
```
State: 'input' | 'loading' | 'result'

input → (handleStartAnalysis) → loading → (API 응답) → result
result → (handleReset) → input
loading → (API 에러) → input (에러 메시지 표시)
```

### 6.2 InputForm.tsx - 4단계 입력 폼
```
Step: 'welcome' → 'name' → 'gender_date' → 'time_place'

- welcome: 인사 화면 + "알현 시작하기" 버튼
- name: 이름 입력 (Enter키 지원)
- gender_date: 성별 토글 + 년/월/일 셀렉트 드롭다운 (getDaysInMonth로 윤년 처리)
- time_place: 출생시간 (모름 체크박스) + 출생지역 → "천기누설 받기" 제출
```

### 6.3 LoadingScreen.tsx
- 원형 glass-panel 안에 SVG 스피너
- progress: 0→60 (빠름) → 60→85 (중간) → 85→95 (느림), 100ms 간격
- 메시지 3초마다 순환

### 6.4 AnalysisDashboard.tsx
- ScoreBadge: 사주/점성술/수비학/통합 점수 표시
- Recharts BarChart: 황금기 5개년 점수 비교 (그라데이션 fill)
- 황금기 카드: rank, year, age, focus, description, strategy
- 공유: 클립보드 복사 + mailto 이메일

### 6.5 Edge Function (supabase/functions/analyze/index.ts)
- CORS 헤더 포함 (브라우저 cross-origin 허용)
- birthTime 유무에 따라 프롬프트 분기 (사주 4기둥 vs 삼주 추명)
- Claude 응답에서 markdown code block 제거 후 JSON 파싱
- 모델: `claude-sonnet-4-5-20250929`, max_tokens: 4096

---

## 7. 타입 정의 (types.ts)

```typescript
interface BirthInfo {
  name: string;
  birthDate: string;        // "YYYY-MM-DD"
  birthTime?: string;       // "HH:mm" or undefined
  birthPlace: string;
  gender: 'male' | 'female';
}

interface YearAnalysis {
  year: number;
  sajuScore: number;         // 0-100
  astrologyScore: number;    // 0-100
  numerologyScore: number;   // 0-100
  totalScore: number;        // 가중 평균
  opportunity: string;
  risk: string;
  strategy: string;
}

interface PeakYear {
  rank: number;              // 1-5
  year: number;
  age: number;
  scores: { saju: number; astrology: number; numerology: number; };
  focus: string;             // "Money" or "Career"
  description: string;
  strategy: string;
}

interface AnalysisResult {
  analysis2026: YearAnalysis;
  goldenPeaks: PeakYear[];   // 5개
  summary: string;
}
```

---

## 8. DB 스키마 (PostgreSQL)

| 테이블 | 용도 | RLS |
|--------|------|-----|
| `profiles` | 사용자 프로필 (auth.users 연동) | 본인만 CRUD |
| `analyses` | 분석 결과 저장 | 비로그인도 insert 가능, 본인만 select |
| `rate_limits` | IP 기반 요청 제한 | service_role만 접근 |

- `check_rate_limit(client_ip, max_requests=10, window_minutes=60)` 함수 존재
- `cleanup_rate_limits()` 함수로 24시간 이전 기록 삭제
- **참고**: 현재 Edge Function에서 rate_limit/analyses 테이블에 write하는 로직은 미구현. 스키마만 준비된 상태.

---

## 9. 디자인 시스템

### CSS 변수 (index.css)
```css
--color-deep-space: #050510;   /* 메인 배경 */
--color-gold-dim: #8a7e58;     /* 어두운 골드 */
--color-gold-bright: #ebbf4c;  /* 밝은 골드 */
--color-jade-dark: #1a2f26;
--color-jade-light: #4e8064;
```

### 주요 CSS 클래스
| 클래스 | 용도 |
|--------|------|
| `.bg-mystical` | 전체 배경 (radial-gradient 레이어) |
| `.stars` | 별 배경 효과 (twinkle 애니메이션) |
| `.glass-panel` | 반투명 카드 (backdrop-blur) |
| `.btn-seal` | 버튼 hover 시 물결 효과 |
| `.input-underline` | 밑줄 입력 필드 |
| `.animate-float` | 상하 부유 애니메이션 |
| `.animate-fade-up` | 아래→위 페이드인 |
| `.animate-fade-in` | 페이드인 (index.html `<style>`에 정의) |

### 폰트
- **본문**: Pretendard (system-ui 폴백)
- **서체 (serif)**: Noto Serif KR
- **추가 서체**: Gowun Batang (index.css에서 로드)

### 색상 팔레트 (Tailwind)
- 주 강조: `amber-500` (#f59e0b)
- 배경: `slate-900` ~ `slate-950` 계열
- 보조: `blue-400` (점성술), `purple-400` (수비학), `emerald-400` (통합)

---

## 10. 로컬 개발 환경 세팅

```bash
# 1. 저장소 클론
git clone https://github.com/jakeon32/master-zhuge-strategy.git
cd master-zhuge-strategy

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env
# .env 파일에 Supabase URL과 anon key 입력

# 4. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

### Supabase Edge Function 배포
```bash
# Supabase CLI 로그인 (access token 필요)
npx supabase login

# Edge Function 배포 (JWT 검증 비활성화)
npx supabase functions deploy analyze --no-verify-jwt --project-ref hjulnwfymubvxpkgotgy

# Anthropic API 키 시크릿 등록
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx --project-ref hjulnwfymubvxpkgotgy
```

### Vercel 배포
- GitHub 연동 완료 상태. `main` 브랜치에 push하면 자동 배포됨.
- 환경변수 변경 시 Vercel 대시보드에서 수정 후 Redeploy 필요.

---

## 11. 커밋 히스토리

| 커밋 | 내용 |
|------|------|
| `8702284` | Initial commit - 전체 프로젝트 구조 |
| `6bb6dd1` | Supabase DB migration + config 추가 |
| `dd4ba70` | 로딩 프로그레스 + 생년월일 드롭다운 UX 개선 |
| `4b2b7ed` | UI 디자인 리뉴얼 (glass-panel, 배경 효과, 애니메이션) |

---

## 12. 알려진 이슈 및 TODO

### 현재 이슈
- `index.html`의 `<style>` 태그와 `index.css`에 중복 정의 있음 (body, .font-serif). 동작에 문제는 없으나 정리 필요.
- `index.html`에서 Noto Serif KR을 로드하고, `index.css`에서도 더 많은 weight로 로드함 (이중 로딩).
- `services/geminiService.ts`는 deprecated. 삭제해도 무방.
- `nul` 파일이 프로젝트 루트에 존재 (Windows에서 실수로 생성됨). 삭제해도 됨.
- Tailwind CSS CDN 사용 중 → 프로덕션 경고 발생. 빌드 타임 Tailwind로 전환 권장.

### 미구현 기능
- [ ] Edge Function에서 analyses 테이블에 분석 결과 저장
- [ ] Edge Function에서 rate_limits 테이블 활용한 요청 제한
- [ ] 사용자 인증 (Supabase Auth) 연동
- [ ] 분석 히스토리 조회 기능
- [ ] Tailwind CSS 빌드 타임 전환 (CDN → PostCSS)

---

## 13. Edge Function 테스트 방법

```bash
# 직접 curl로 테스트
curl -X POST "https://hjulnwfymubvxpkgotgy.supabase.co/functions/v1/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -d '{"name":"테스트","birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"서울","gender":"male"}'
```

응답은 `AnalysisResult` JSON 구조로 반환됨. Claude API 호출이 포함되므로 10~30초 소요.

---

## 14. 트러블슈팅 가이드

| 증상 | 원인 | 해결 |
|------|------|------|
| "Supabase 환경 변수가 설정되지 않았습니다" | Vercel에 VITE_ 환경변수 미설정 | Vercel 대시보드에서 환경변수 추가 후 Redeploy |
| Edge Function 502 에러 | ANTHROPIC_API_KEY 미등록 | `supabase secrets set` 명령으로 등록 |
| 로딩이 무한히 계속됨 | Edge Function 응답 실패 또는 JSON 파싱 에러 | 브라우저 콘솔 + Supabase 대시보드 Logs 확인 |
| CORS 에러 | Edge Function의 corsHeaders 누락 | analyze/index.ts의 corsHeaders 확인 |
| Vercel 빌드 실패 | TypeScript 에러 | `npm run build` 로컬에서 먼저 확인 |
| "cdn.tailwindcss.com should not be used in production" | Tailwind CDN 사용 경고 | 기능 문제 없음. 추후 빌드 타임 전환 가능 |
