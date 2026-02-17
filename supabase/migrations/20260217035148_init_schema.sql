-- ============================================
-- 제갈량의 천기누설 - DB Schema
-- ============================================

-- 1. 사용자 프로필 테이블 (Supabase Auth 연동)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 자동 프로필 생성 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. 분석 결과 저장 테이블
create table public.analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  -- 입력 정보
  name text not null,
  birth_date date not null,
  birth_time time,
  birth_place text not null,
  gender text not null check (gender in ('male', 'female')),
  -- 2026 분석 결과
  saju_score smallint check (saju_score between 0 and 100),
  astrology_score smallint check (astrology_score between 0 and 100),
  numerology_score smallint check (numerology_score between 0 and 100),
  total_score smallint check (total_score between 0 and 100),
  opportunity text,
  risk text,
  strategy text,
  -- 황금기 Top 5 (JSON 배열)
  golden_peaks jsonb,
  -- 종합 요약
  summary text,
  -- 메타
  created_at timestamptz default now() not null,
  ip_address inet
);

alter table public.analyses enable row level security;

-- 로그인 사용자: 본인 기록만 조회
create policy "Users can view own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

-- 비로그인 사용자도 insert 허용 (user_id null)
create policy "Anyone can insert analyses"
  on public.analyses for insert
  with check (true);

-- 인덱스
create index idx_analyses_user_id on public.analyses(user_id);
create index idx_analyses_created_at on public.analyses(created_at desc);
create index idx_analyses_ip on public.analyses(ip_address);

-- 3. Rate Limiting 테이블
create table public.rate_limits (
  id uuid default gen_random_uuid() primary key,
  ip_address inet not null,
  endpoint text not null default 'analyze',
  requested_at timestamptz default now() not null
);

alter table public.rate_limits enable row level security;

-- 서비스 역할만 접근 (Edge Function에서 service_role key 사용)
create policy "Service role only"
  on public.rate_limits
  using (false);

-- 인덱스: IP + 시간 기준 조회 최적화
create index idx_rate_limits_lookup
  on public.rate_limits(ip_address, endpoint, requested_at desc);

-- 오래된 rate limit 기록 자동 삭제 (24시간 이전)
create or replace function public.cleanup_rate_limits()
returns void as $$
begin
  delete from public.rate_limits
  where requested_at < now() - interval '24 hours';
end;
$$ language plpgsql security definer;

-- Rate limit 체크 함수 (시간당 10회 제한)
create or replace function public.check_rate_limit(
  client_ip inet,
  max_requests int default 10,
  window_minutes int default 60
)
returns boolean as $$
declare
  request_count int;
begin
  select count(*) into request_count
  from public.rate_limits
  where ip_address = client_ip
    and endpoint = 'analyze'
    and requested_at > now() - (window_minutes || ' minutes')::interval;

  if request_count >= max_requests then
    return false;
  end if;

  insert into public.rate_limits (ip_address, endpoint)
  values (client_ip, 'analyze');

  return true;
end;
$$ language plpgsql security definer;
