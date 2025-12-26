'use client'

import { useRef, useState, useEffect } from 'react'
import { validateImageFile } from '@/lib/utils/upload'
import styles from './ImageUpload.module.css'

export interface ImageUploadProps {
  label?: string
  currentImageUrl?: string | null
  onImageChange?: (file: File | null) => void
  onImageRemove?: () => void
  onError?: (error: string) => void
  maxSizeMB?: number
  disabled?: boolean
}

export default function ImageUpload({
  label = '프로필 이미지',
  currentImageUrl,
  onImageChange,
  onImageRemove,
  onError,
  maxSizeMB = 5,
  disabled = false,
}: ImageUploadProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(
    currentImageUrl || null
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isRemoved, setIsRemoved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isRemoved) {
      setPreviewImage(currentImageUrl || null)
    }
  }, [currentImageUrl, isRemoved])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지 파일 유효성 검사
    const validation = validateImageFile(file, maxSizeMB)
    if (!validation.valid) {
      const errorMessage = validation.error || '이미지 파일이 올바르지 않습니다.'
      onError?.(errorMessage)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setSelectedFile(file)
    setIsRemoved(false)
    onImageChange?.(file)

    // 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageRemove = () => {
    setSelectedFile(null)
    setPreviewImage(null)
    setIsRemoved(true)
    onImageChange?.(null)
    onImageRemove?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={styles.imageUpload}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.imageContainer}>
        {previewImage ? (
          <div className={styles.imagePreview}>
            <img src={previewImage} alt="미리보기" />
            <div className={styles.imageActions}>
              <label
                htmlFor="image-upload"
                className={styles.changeButton}
                style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
              >
                변경
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                  disabled={disabled}
                />
              </label>
              <button
                type="button"
                onClick={handleImageRemove}
                className={styles.removeButton}
                disabled={disabled}
              >
                삭제
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="image-upload"
            className={styles.uploadLabel}
            style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
          >
            <span>이미지 선택</span>
            <input
              ref={fileInputRef}
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
              disabled={disabled}
            />
          </label>
        )}
      </div>
    </div>
  )
}

