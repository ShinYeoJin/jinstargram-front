import { createClient } from '@supabase/supabase-js'

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경 변수가 설정되지 않았습니다. 이미지 업로드 기능이 작동하지 않습니다.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

