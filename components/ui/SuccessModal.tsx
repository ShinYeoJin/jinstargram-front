'use client'

import { useRouter } from 'next/navigation'
import Modal from './Modal'
import styles from './SuccessModal.module.css'

interface SuccessModalProps {
  isOpen: boolean
  onClose?: () => void
  title?: string
  message?: string
  buttonText?: string
  redirectPath?: string
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = '성공',
  message = '작업이 완료되었습니다.',
  buttonText = '확인',
  redirectPath,
}: SuccessModalProps) {
  const router = useRouter()

  const handleButtonClick = () => {
    if (onClose) {
      onClose()
    }
    // 리다이렉트는 모달이 닫힌 후에 실행
    if (redirectPath) {
      // 약간의 지연을 두어 모달 닫기 애니메이션이 완료된 후 리다이렉트
      // Navbar 업데이트를 위한 이벤트도 발생 (여러 번 발생시켜 확실히 업데이트)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'))
        setTimeout(() => {
          window.dispatchEvent(new Event('auth-change'))
        }, 100)
        setTimeout(() => {
          window.dispatchEvent(new Event('auth-change'))
        }, 300)
      }
      setTimeout(() => {
        router.push(redirectPath)
        router.refresh()
        // 리다이렉트 후에도 Navbar 업데이트 확인 (여러 번)
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(new Event('auth-change'))
          }, 200)
          setTimeout(() => {
            window.dispatchEvent(new Event('auth-change'))
          }, 500)
          setTimeout(() => {
            window.dispatchEvent(new Event('auth-change'))
          }, 1000)
          setTimeout(() => {
            window.dispatchEvent(new Event('auth-change'))
          }, 2000)
          setTimeout(() => {
            window.dispatchEvent(new Event('auth-change'))
          }, 3000)
        }
      }, 200)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <div className={styles.successModal}>
        <div className={styles.icon}>✓</div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <button
          className={styles.button}
          onClick={handleButtonClick}
          type="button"
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  )
}

