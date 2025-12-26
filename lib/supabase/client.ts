import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 환경 변수가 없을 때 빌드 에러 방지를 위한 더미 클라이언트 생성
// 실제 런타임에서는 환경 변수를 확인하여 사용
let supabase: SupabaseClient

if (!supabaseUrl || !supabaseAnonKey) {
  // 빌드 시점에 환경 변수가 없어도 에러가 나지 않도록 더미 클라이언트 생성
  // 실제 런타임에서는 이미지 업로드 시 에러가 발생하지만, 빌드는 성공
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
  if (typeof window !== 'undefined') {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. 이미지 업로드 기능이 작동하지 않습니다.')
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

