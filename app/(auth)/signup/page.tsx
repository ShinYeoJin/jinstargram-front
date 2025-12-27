'use client'

import Link from 'next/link'
import SuccessModal from '@/components/ui/SuccessModal'
import FormField from '@/components/ui/FormField'
import ImageUpload from '@/components/ui/ImageUpload'
import { useSignupForm } from '@/hooks/useSignupForm'
import styles from './signup.module.css'

export default function SignupPage() {
  const {
    form,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    usernameError,
    nicknameError,
    usernameSuccess,
    nicknameSuccess,
    generalError,
    isFormValid,
    isCheckingUsername,
    isCheckingNickname,
    handleImageChange,
    handleImageError,
  } = useSignupForm()

  return (
    <div className={styles.container}>
      <div className={styles.signupBox}>
        <h1 className={styles.title}>회원가입</h1>
        
        <form onSubmit={form.handleSubmit} className={styles.form}>
          {/* 아이디 */}
          <FormField
            label="아이디"
            type="text"
            id="username"
            name="username"
            value={form.values.username}
            onChange={form.handleChange('username')}
            onBlur={form.handleBlur('username')}
            placeholder="4자 이상 입력해주세요"
            error={usernameError}
            success={usernameSuccess}
            touched={form.touched.username}
            disabled={isCheckingUsername}
          />

          {/* 비밀번호 */}
          <FormField
            label="비밀번호"
            type="password"
            id="password"
            name="password"
            value={form.values.password}
            onChange={form.handleChange('password')}
            onBlur={form.handleBlur('password')}
            placeholder="영문, 숫자 포함 8자 이상"
            error={form.errors.password}
            touched={form.touched.password}
          />

          {/* 비밀번호 확인 */}
          <FormField
            label="비밀번호 확인"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={form.values.confirmPassword}
            onChange={form.handleChange('confirmPassword')}
            onBlur={form.handleBlur('confirmPassword')}
            placeholder="비밀번호를 다시 입력하세요"
            error={form.errors.confirmPassword}
            touched={form.touched.confirmPassword}
          />

          {/* 닉네임 */}
          <FormField
            label="닉네임"
            type="text"
            id="nickname"
            name="nickname"
            value={form.values.nickname}
            onChange={form.handleChange('nickname')}
            onBlur={form.handleBlur('nickname')}
            placeholder="2-20자로 입력해주세요"
            error={nicknameError}
            success={nicknameSuccess}
            touched={form.touched.nickname}
            disabled={isCheckingNickname}
          />

          {/* 프로필 이미지 업로드 */}
          <ImageUpload
            label="프로필 이미지"
            onImageChange={handleImageChange}
            onError={handleImageError}
          />

          {/* 일반 에러 메시지 */}
          {generalError && (
            <div className={styles.generalError}>{generalError}</div>
          )}

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            className={`${styles.submitButton} ${
              isFormValid ? styles.active : styles.disabled
            }`}
            disabled={!isFormValid || form.isSubmitting}
          >
            {form.isSubmitting ? '처리 중...' : '회원가입'}
          </button>
        </form>

        <p className={styles.loginLink}>
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className={styles.link}>
            로그인
          </Link>
        </p>
      </div>

      {/* 회원가입 성공 모달 */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="회원가입 완료"
        message="회원가입이 완료되었습니다"
        buttonText="로그인"
        redirectPath="/login"
      />
    </div>
  )
}
