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
      setTimeout(() => {
        // 페이지를 완전히 새로고침하여 Navbar가 확실히 업데이트되도록 함
        if (redirectPath === '/') {
          // 메인 페이지로 이동 후 새로고침
          window.location.href = '/'
        } else {
          window.location.href = redirectPath
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

