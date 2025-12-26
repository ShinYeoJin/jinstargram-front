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
    if (redirectPath) {
      router.push(redirectPath)
    }
    if (onClose) {
      onClose()
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

