# 설계서 (Design Document)
## 제갈량의 천기누설 (Master Zhuge's Strategy)

> 작성일: 2026-02-17 (역추적 작성)
> 상태: 완료 (구현 후 역방향 문서화)

---

## 1. 시스템 아키텍처

### 1.1 전체 구조

```
┌─────────────────────────────────────────────┐
│              Frontend (Vercel)              │
│  React 19 + TypeScript + Tailwind CSS      │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │InputForm │→│Loading   │→│Analysis     │ │
│  │(4-step)  │ │Screen    │ │Dashboard    │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
│         ↓                        ↑          │
│  ┌──────────────────────────────────────┐   │
│  │      claudeService.ts (API Client)  │   │
│  └──────────────────────────────────────┘   │
└─────────────────┬───────────────────────────┘
                  │ POST /functions/v1/analyze
                  ▼
┌─────────────────────────────────────────────┐
│        Supabase Edge Function (Deno)        │
│  ┌──────────────────────────────────────┐   │
│  │  analyze/index.ts                    │   │
│  │  - CORS 처리                         │   │
│  │  - BirthInfo 파싱                    │   │
│  │  - 프롬프트 생성 (시간 유무 분기)      │   │
│  │  - Claude API 호출                   │   │
│  │  - JSON 파싱 및 반환                  │   │
│  └──────────────────────────────────────┘   │
└─────────────────┬───────────────────────────┘
                  │ Anthropic Messages API
                  ▼
┌─────────────────────────────────────────────┐
│        Claude Sonnet 4.5 (AI Engine)        │
│  - 제갈량 페르소나 기반 분석               │
│  - 사주/점성술/수비학 통합 JSON 생성       │
│  - max_tokens: 4096                        │
└─────────────────────────────────────────────┘
```

### 1.2 통신 흐름
1. 프론트엔드 → Supabase Edge Function: `POST` (JSON body: `BirthInfo`)
2. Edge Function → Claude API: `POST` (system/user prompt + `BirthInfo`)
3. Claude API → Edge Function: 텍스트 응답 (JSON 형태)
4. Edge Function → 프론트엔드: 파싱된 `AnalysisResult` JSON

---

## 2. 데이터 모델

### 2.1 입력 데이터 (BirthInfo)

```typescript
interface BirthInfo {
  name: string;           // 사용자 이름
  birthDate: string;      // YYYY-MM-DD
  birthTime?: string;     // HH:MM (선택)
  birthPlace: string;     // 출생 장소
  gender: 'male' | 'female';
}
```

### 2.2 분석 결과 (AnalysisResult)

```typescript
interface AnalysisResult {
  analysis2026: YearAnalysis;   // 2026년 운세
  goldenPeaks: PeakYear[];     // 황금기 Top 5
  summary: string;              // 종합 요약 메시지
}
```

### 2.3 연도별 분석 (YearAnalysis)

```typescript
interface YearAnalysis {
  year: number;              // 분석 연도
  sajuScore: number;         // 사주 점수 (0-100)
  astrologyScore: number;    // 점성술 점수 (0-100)
  numerologyScore: number;   // 수비학 점수 (0-100)
  totalScore: number;        // 종합 점수 (0-100)
  opportunity: string;       // 기회 요인
  risk: string;              // 리스크 요인
  strategy: string;          // 전략적 조언
}
```

### 2.4 황금기 연도 (PeakYear)

```typescript
interface PeakYear {
  rank: number;              // 순위 (1-5)
  year: number;              // 연도
  age: number;               // 나이
  scores: {
    saju: number;            // 사주 점수
    astrology: number;       // 점성술 점수
    numerology: number;      // 수비학 점수
  };
  focus: string;             // 집중 분야 태그
  description: string;       // 상세 설명
  strategy: string;          // 전략 조언
}
```

---

## 3. 컴포넌트 설계

### 3.1 컴포넌트 트리

```
App
├── InputForm (step === 'input')
│   ├── WelcomeStep
│   ├── NameStep
│   ├── GenderDateStep
│   └── TimePlaceStep
├── LoadingScreen (step === 'loading')
└── AnalysisDashboard (step === 'result')
    ├── ScoreBadge (x4: 사주/점성/수비/종합)
    ├── OpportunityCard
    ├── RiskCard
    ├── StrategyQuote
    ├── BarChart (Recharts)
    ├── PeakYearCard (x5)
    ├── SummaryCard
    └── ShareButtons
```

### 3.2 상태 관리

**App 레벨 상태** (useState):
| 상태 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| step | `'input' \| 'loading' \| 'result'` | `'input'` | 현재 화면 단계 |
| result | `AnalysisResult \| null` | `null` | AI 분석 결과 |
| error | `string \| null` | `null` | 에러 메시지 |

**InputForm 내부 상태**:
| 상태 | 타입 | 설명 |
|------|------|------|
| currentStep | `'welcome' \| 'name' \| 'gender_date' \| 'time_place'` | 입력 위자드 단계 |
| name | `string` | 이름 |
| gender | `'male' \| 'female'` | 성별 |
| birthDate | `string` | 생년월일 |
| birthTime | `string` | 출생 시간 |
| birthPlace | `string` | 출생 장소 |
| unknownTime | `boolean` | 출생 시간 모름 체크 |

---

## 4. UI/UX 설계

### 4.1 디자인 컨셉
- **테마**: 동양 신비주의 (Mystical Oriental)
- **색상**: 다크 배경 (#0a0a1a ~ #1a1a2e) + 골드 액센트 (amber-400/500)
- **폰트**: Noto Serif KR (제목) + Pretendard (본문)
- **그라데이션**: amber → blue → purple 블러 오브 배경

### 4.2 화면별 설계

#### 4.2.1 Welcome 화면
- 제갈량 테마 타이틀 "천기누설"
- 부제 설명문
- "분석 시작하기" CTA 버튼

#### 4.2.2 입력 위자드 (4단계)
- 상단 프로그레스 바 (0% → 33% → 66% → 100%)
- 단계별 입력 필드
- "이전/다음" 네비게이션 버튼
- 페이드/슬라이드 트랜지션

#### 4.2.3 로딩 화면
- 동심원 스피닝 애니메이션 (amber/blue/purple)
- 6개 로딩 메시지 순환 (2.8초 간격)
  - "천문을 관측하고 있습니다..."
  - "사주팔자를 풀이하고 있습니다..."
  - "별자리의 움직임을 읽고 있습니다..."
  - "수리의 기운을 계산하고 있습니다..."
  - "운명의 흐름을 분석하고 있습니다..."
  - "전략을 수립하고 있습니다..."
- 하단 바운싱 도트 인디케이터

#### 4.2.4 결과 대시보드
- **2026 운세 카드**: 4개 ScoreBadge + 기회/리스크 패널 + 전략 인용구
- **황금기 차트**: Recharts BarChart (사주/점성/수비 3색 막대)
- **Top 5 카드 리스트**: 순위 뱃지 + 연도/나이 + 점수 + 설명 + 전략
- **종합 요약**: 제갈량 인용구 스타일 카드
- **공유 버튼**: 클립보드 복사 + 이메일 전송

### 4.3 반응형 설계
- `max-w-4xl` 컨테이너 중앙 정렬
- 모바일: 단일 컬럼 레이아웃
- 데스크톱: 기회/리스크 2컬럼 그리드

---

## 5. API 설계

### 5.1 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | `/functions/v1/analyze` | 운세 분석 요청 |
| OPTIONS | `/functions/v1/analyze` | CORS preflight |

### 5.2 요청/응답

**Request:**
```json
{
  "name": "홍길동",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "서울",
  "gender": "male"
}
```

**Response:**
```json
{
  "analysis2026": {
    "year": 2026,
    "sajuScore": 78,
    "astrologyScore": 82,
    "numerologyScore": 75,
    "totalScore": 79,
    "opportunity": "...",
    "risk": "...",
    "strategy": "..."
  },
  "goldenPeaks": [
    {
      "rank": 1,
      "year": 2028,
      "age": 38,
      "scores": { "saju": 92, "astrology": 88, "numerology": 85 },
      "focus": "Career",
      "description": "...",
      "strategy": "..."
    }
  ],
  "summary": "..."
}
```

### 5.3 에러 처리

| HTTP Status | 원인 | 프론트엔드 메시지 |
|-------------|------|-------------------|
| 405 | POST 외 메서드 | "분석 요청 중 오류가 발생했습니다" |
| 500 | API 키 미설정 | "서버 설정 오류" |
| 500 | Claude API 실패 | "AI 분석 중 오류가 발생했습니다" |
| 500 | JSON 파싱 실패 | "응답 처리 중 오류가 발생했습니다" |
| Network | 연결 실패 | "서버 연결에 실패했습니다" |

### 5.4 CORS 설정
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
```

---

## 6. AI 프롬프트 설계

### 6.1 시스템 프롬프트 역할
- 제갈량 페르소나 부여
- 사주/점성술/수비학 전문가 역할 지정
- JSON 출력 형식 강제

### 6.2 프롬프트 분기 전략

| 조건 | 사주 분석 방식 | 점성술 분석 방식 |
|------|---------------|-----------------|
| birthTime 있음 | 사주팔자 (연주+월주+일주+시주) | 하우스/어센던트 포함 |
| birthTime 없음 | 삼주추명 (연주+월주+일주) | 행성 배치/트랜짓 중심 |

### 6.3 AI 모델 설정
- 모델: `claude-sonnet-4-5-20250929`
- max_tokens: `4096`
- 응답 후처리: 마크다운 코드 펜스 제거 → JSON.parse

---

## 7. 보안 설계

| 위협 | 대응 |
|------|------|
| API 키 노출 | Supabase Edge Function에서 서버 사이드 관리 |
| 무단 접근 | JWT 검증 활성화 (`verify_jwt = true`) |
| CORS 악용 | Allow-Origin `*` (공개 서비스이므로 허용) |
| 입력 검증 | Edge Function에서 BirthInfo 필수 필드 확인 |

---

## 8. 파일 구조

```
/
├── index.html              # HTML 진입점 (Tailwind CDN, Google Fonts)
├── index.tsx               # React DOM 마운트
├── App.tsx                 # 루트 컴포넌트 (상태 머신)
├── types.ts                # 공유 타입 정의
├── vite.config.ts          # Vite 설정
├── package.json            # 의존성 관리
├── tsconfig.json           # TypeScript 설정
├── components/
│   ├── InputForm.tsx       # 4단계 입력 위자드
│   ├── LoadingScreen.tsx   # 로딩 애니메이션
│   └── AnalysisDashboard.tsx # 결과 대시보드
├── services/
│   ├── claudeService.ts    # API 클라이언트
│   └── geminiService.ts    # 미사용 (호환성 래퍼)
└── supabase/
    ├── config.toml         # Supabase 프로젝트 설정
    └── functions/
        └── analyze/
            └── index.ts    # Edge Function (Claude API 프록시)
```
