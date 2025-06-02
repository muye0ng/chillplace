// Supabase 클라이언트 초기화 파일입니다.
// 환경변수에서 URL과 KEY를 불러와서 클라이언트를 생성합니다.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 