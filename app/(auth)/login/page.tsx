'use client'

import { useState } from 'react'
import Link from 'next/link'
import FormField from '@/components/ui/FormField'
import SuccessModal from '@/components/ui/SuccessModal'
import { useAuth } from '@/hooks/useAuth'
import styles from './login.module.css'

export default function LoginPage() {
  const { isLoading, error, login, clearError } = useAuth()
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    // 입력값 검증
    if (!username?.trim()) {
      return
    }

    if (!password?.trim()) {
      return
    }

    try {
      await login({
        id: username,
        password: password,
      })
      // 로그인 성공 시 성공 모달 표시
      setIsSuccessModalOpen(true)
    } catch (err) {
      // 에러는 useAuth 훅에서 처리됨
      console.error('로그인 에러:', err)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>로그인</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 아이디 */}
          <FormField
            label="아이디"
            type="text"
            id="username"
            name="username"
            placeholder="아이디를 입력하세요"
            disabled={isLoading}
            required
          />

          {/* 비밀번호 */}
          <FormField
            label="비밀번호"
            type="password"
            id="password"
            name="password"
            placeholder="비밀번호를 입력하세요"
            disabled={isLoading}
            required
          />

          {/* 에러 메시지 */}
          {error && <div className={styles.error}>{error}</div>}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className={`${styles.submitButton} ${
              isLoading ? styles.loading : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className={styles.signupLink}>
          계정이 없으신가요?{' '}
          <Link href="/signup" className={styles.link}>
            회원가입
          </Link>
        </p>
      </div>

      {/* 로그인 성공 모달 */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="로그인 완료"
        message="로그인되었습니다."
        buttonText="확인"
        redirectPath="/"
      />
    </div>
  )
}
