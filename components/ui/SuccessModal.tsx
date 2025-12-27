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
    // 리다이렉트 실행
    if (redirectPath) {
      // 약간의 지연을 두어 모달 닫기 애니메이션이 완료된 후 리다이렉트
      setTimeout(() => {
        router.push(redirectPath)
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

