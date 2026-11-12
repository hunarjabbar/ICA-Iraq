-- ICA international public intake: versioned migration deployed 2026-11-12.
-- Intentionally grants only EXECUTE on a narrowly scoped, validated,
-- rate-limited public RPC; no public SELECT or DML privileges on intake records.
create table if not exists public.ica_portal_submission_rate (
 fingerprint text primary key,
 window_started_at timestamptz not null default now(),
 attempts integer not null default 0 check(attempts between 0 and 100000),
 updated_at timestamptz not null default now()
);
alter table public.ica_portal_submission_rate enable row level security;
revoke all on public.ica_portal_submission_rate from public,anon,authenticated;

CREATE OR REPLACE FUNCTION public.ica_public_submit_v1(p_action text, p_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
 v_email text;
 v_name text;
 v_topic text;
 v_message text;
 v_lang text;
 v_headers jsonb := '{}'::jsonb;
 v_peer text;
 v_fingerprint text;
 v_attempts integer;
 v_now timestamptz := now();
begin
 if coalesce(p_action,'') not in ('contact','subscribe') then
  return jsonb_build_object('ok',false,'code','unsupported_action');
 end if;
 if p_data is null or jsonb_typeof(p_data)<>'object' or octet_length(p_data::text)>6000 then
  return jsonb_build_object('ok',false,'code','invalid_input');
 end if;
 if length(coalesce(p_data->>'website',''))>0 then
  return jsonb_build_object('ok',true,'message','Request accepted');
 end if;
 v_email:=lower(btrim(coalesce(p_data->>'email','')));
 if length(v_email)<5 or length(v_email)>240 or v_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
  return jsonb_build_object('ok',false,'code','invalid_email');
 end if;
 v_lang:=coalesce(nullif(btrim(p_data->>'lang'),''),'en');
 if v_lang not in ('en','ar','ckb','zh') then v_lang:='en'; end if;
 if p_action='contact' then
  v_name:=btrim(coalesce(p_data->>'name',''));
  v_topic:=btrim(coalesce(p_data->>'topic',''));
  v_message:=btrim(coalesce(p_data->>'message',''));
  if length(v_name) not between 2 and 120 or length(v_topic) not between 3 and 80 or length(v_message) not between 12 and 4000 then
   return jsonb_build_object('ok',false,'code','invalid_fields');
  end if;
 end if;
 begin
  v_headers:=coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}'::jsonb);
 exception when others then v_headers:='{}'::jsonb;
 end;
 v_peer:=left(btrim(split_part(coalesce(
   nullif(v_headers->>'cf-connecting-ip',''),
   nullif(v_headers->>'x-forwarded-for',''),
   nullif(v_headers->>'x-real-ip',''),
   'unknown'
 ),',',1)),100);
 v_fingerprint:=md5(v_peer || ':' || left(coalesce(v_headers->>'user-agent','unknown'),100) || ':' || p_action);
 insert into public.ica_portal_submission_rate as r (fingerprint,window_started_at,attempts,updated_at)
 values (v_fingerprint,v_now,1,v_now)
 on conflict(fingerprint) do update set
  attempts=case when r.window_started_at < v_now-interval '1 hour' then 1 else r.attempts+1 end,
  window_started_at=case when r.window_started_at < v_now-interval '1 hour' then v_now else r.window_started_at end,
  updated_at=v_now
 returning attempts into v_attempts;
 if v_attempts > (case when p_action='contact' then 5 else 4 end) then
  return jsonb_build_object('ok',false,'code','rate_limited');
 end if;
 if p_action='subscribe' then
  insert into public.ica_portal_subscribers(email,lang) values (v_email,v_lang)
  on conflict(email) do nothing;
  return jsonb_build_object('ok',true,'message','Subscription recorded');
 end if;
 insert into public.ica_portal_messages(name,email,topic,message,status)
 values(v_name,v_email,v_topic,v_message,'new');
 return jsonb_build_object('ok',true,'message','Your message has been received');
exception when check_violation or string_data_right_truncation then
 return jsonb_build_object('ok',false,'code','invalid_fields');
end;
$function$;

revoke execute on function public.ica_public_submit_v1(text,jsonb) from public;
grant execute on function public.ica_public_submit_v1(text,jsonb) to anon,authenticated;
comment on function public.ica_public_submit_v1(text,jsonb) is
'Public validated ICA contact/subscription INSERT only; no data reads/updates/deletes. Hourly request fingerprint throttling.';
