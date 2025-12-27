import { supabase } from '@/lib/supabase/client'

/**
 * Supabase 에러 메시지를 한글로 변환
 */
const translateError = (errorMessage: string): string => {
  const errorLower = errorMessage.toLowerCase()
  
  // RLS 정책 오류
  if (errorLower.includes('row-level security') || errorLower.includes('rlp') || 
      errorLower.includes('new row violates row-level security')) {
    return '이미지 업로드 권한이 없습니다. Supabase Storage의 보안 정책(RLS)을 설정해주세요. Storage > images > Policies에서 Public 정책을 추가해주세요.'
  }
  
  // 인증 오류
  if (errorLower.includes('unauthorized') || errorLower.includes('permission denied') ||
      errorLower.includes('forbidden')) {
    return '이미지 업로드 권한이 없습니다. Supabase Storage의 보안 정책(RLS)을 설정해주세요. Storage > images > Policies에서 Public 정책을 추가해주세요.'
  }
  
  // 버킷 없음
  if (errorLower.includes('bucket') && errorLower.includes('not found')) {
    return '이미지 저장소를 찾을 수 없습니다. Supabase Storage 버킷 설정을 확인해주세요.'
  }
  
  // 파일 크기 초과
  if (errorLower.includes('file size') || errorLower.includes('too large')) {
    return '파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.'
  }
  
  // 네트워크 오류
  if (errorLower.includes('network') || errorLower.includes('fetch')) {
    return '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.'
  }
  
  // 기본 메시지 (400 에러는 대부분 RLS 정책 문제)
  return '이미지 업로드에 실패했습니다. Supabase Storage의 보안 정책(RLS)을 설정해주세요. Storage > images > Policies에서 Public 정책을 추가해주세요.'
}

/**
 * Supabase Storage에 이미지 업로드
 * @param file 업로드할 이미지 파일
 * @param folder 저장할 폴더 경로 (예: 'profiles')
 * @param fileName 파일명 (확장자 포함)
 * @returns 업로드된 이미지의 공개 URL
 */
export const uploadImage = async (
  file: File,
  folder: string = 'profiles',
  fileName?: string
): Promise<string> => {
  // Supabase 환경 변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('이미지 업로드 기능이 설정되지 않았습니다. Supabase 설정을 확인해주세요.')
  }

  try {
    // 파일명 생성 (없으면 타임스탬프 기반)
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const finalFileName = fileName || `${timestamp}.${fileExt}`

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('images') // Supabase Storage 버킷 이름
      .upload(`${folder}/${finalFileName}`, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      // 상세 에러 로깅 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development') {
        console.error('Supabase Storage 업로드 에러:', {
          message: error.message,
          error: error,
        })
      }
      
      // 에러 메시지에서 상태 코드 확인 (StorageError에는 statusCode가 없을 수 있음)
      const errorMessage = error.message || ''
      if (errorMessage.includes('400') || errorMessage.includes('403') || 
          errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
        throw new Error('이미지 업로드 권한이 없습니다. Supabase Storage의 보안 정책(RLS)을 설정해주세요. Storage > images > Policies에서 Public 정책을 추가해주세요.')
      }
      
      // 에러 메시지를 한글로 변환
      const translatedMessage = translateError(error.message)
      throw new Error(translatedMessage)
    }

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(data.path)

    return publicUrl
  } catch (error: any) {
    console.error('이미지 업로드 에러:', error)
    // 이미 한글로 변환된 메시지이거나, 변환 함수를 통해 처리된 메시지
    const message = error.message || '이미지 업로드에 실패했습니다.'
    throw new Error(message)
  }
}

/**
 * 이미지 파일 유효성 검사
 */
export const validateImageFile = (file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } => {
  // 파일 타입 검사
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: '이미지 파일만 업로드 가능합니다.' }
  }

  // 파일 크기 검사
  const maxSize = maxSizeMB * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다.` }
  }

  return { valid: true }
}

