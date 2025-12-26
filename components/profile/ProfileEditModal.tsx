'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import ImageUpload from '@/components/ui/ImageUpload'
import { uploadImage } from '@/lib/utils/upload'
import styles from './ProfileEditModal.module.css'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  currentNickname: string
  currentBio?: string | null
  currentAvatarUrl?: string
  username?: string
  onSave: (data: { nickname: string; bio?: string | null; profileImageUrl?: string | null }) => Promise<void>
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  currentNickname,
  currentBio,
  currentAvatarUrl,
  onSave,
}: ProfileEditModalProps) {
  const [nickname, setNickname] = useState(currentNickname)
  const [bio, setBio] = useState(currentBio || '')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [isImageRemoved, setIsImageRemoved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (isOpen) {
      setNickname(currentNickname)
      setBio(currentBio || '')
      setProfileImage(null)
      setIsImageRemoved(false)
      setError('')
    }
  }, [isOpen, currentNickname, currentBio, currentAvatarUrl])

  const handleImageChange = (file: File | null) => {
    setProfileImage(file)
    setIsImageRemoved(false)
    setError('')
  }

  const handleImageRemove = () => {
    setProfileImage(null)
    setIsImageRemoved(true)
    setError('')
  }

  const handleImageError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 닉네임 유효성 검사
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }

    if (nickname.length < 2 || nickname.length > 20) {
      setError('닉네임은 2-20자로 입력해주세요.')
      return
    }

    // 소개글 유효성 검사 (선택 사항이지만 입력 시 최대 길이 체크)
    if (bio && bio.length > 150) {
      setError('소개글은 최대 150자까지 입력 가능합니다.')
      return
    }

    setIsLoading(true)

    try {
      let profileImageUrl: string | undefined = undefined

      // 새 이미지가 있으면 업로드
      if (profileImage) {
        try {
          // 파일명 생성 (타임스탬프 기반)
          const fileExt = profileImage.name.split('.').pop()
          const timestamp = Date.now()
          const fileName = `profile_${timestamp}.${fileExt}`
          
          profileImageUrl = await uploadImage(
            profileImage,
            'profiles',
            fileName
          )
        } catch (uploadError: any) {
          console.error('이미지 업로드 에러:', uploadError)
          setError(uploadError.message || '이미지 업로드에 실패했습니다.')
          setIsLoading(false)
          return
        }
      } else if (isImageRemoved) {
        // 이미지 삭제 시 null로 설정
        profileImageUrl = undefined
      } else if (currentAvatarUrl && !profileImage) {
        // 기존 이미지 유지
        profileImageUrl = currentAvatarUrl
      }

      // 프로필 업데이트
      // 이미지 삭제 시 명시적으로 null 전달, 그 외에는 업로드된 URL 또는 undefined
      await onSave({
        nickname: nickname.trim(),
        bio: bio.trim() || null,
        profileImageUrl: isImageRemoved ? null : profileImageUrl,
      })

      // 성공 시 모달 닫기
      onClose()
    } catch (err: any) {
      console.error('프로필 업데이트 에러:', err)
      setError(err.message || '프로필 업데이트에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>프로필 편집</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 프로필 이미지 */}
          <ImageUpload
            label="프로필 이미지"
            currentImageUrl={isImageRemoved ? null : currentAvatarUrl}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
            onError={handleImageError}
            disabled={isLoading}
          />

          {/* 닉네임 */}
          <div className={styles.field}>
            <label htmlFor="nickname" className={styles.label}>
              닉네임
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="2-20자로 입력해주세요"
              className={styles.input}
              disabled={isLoading}
              maxLength={20}
            />
          </div>

          {/* 소개글 */}
          <div className={styles.field}>
            <label htmlFor="bio" className={styles.label}>
              소개글
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="나를 소개하는 글을 입력해주세요 (최대 150자)"
              className={styles.textarea}
              disabled={isLoading}
              maxLength={150}
              rows={4}
            />
            <div className={styles.charCount}>
              {bio.length}/150
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && <div className={styles.error}>{error}</div>}

          {/* 버튼 */}
          <div className={styles.buttons}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

