/**
 * 이미지 업로드 전용 커스텀 훅
 */

import { useState, useCallback } from 'react';
import { uploadImage, validateImageFile } from '@/lib/utils/upload';

interface UseImageUploadReturn {
  imageFile: File | null;
  uploadError: string;
  isUploading: boolean;
  handleImageChange: (file: File | null) => void;
  handleImageError: (error: string) => void;
  uploadImageFile: (username: string) => Promise<string | undefined>;
  clearError: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = useCallback((file: File | null) => {
    setImageFile(file);
    if (uploadError) {
      setUploadError('');
    }
  }, [uploadError]);

  const handleImageError = useCallback((error: string) => {
    setUploadError(error);
  }, []);

  const uploadImageFile = useCallback(async (username: string): Promise<string | undefined> => {
    if (!imageFile) {
      return undefined;
    }

    const validation = validateImageFile(imageFile);
    if (!validation.valid) {
      setUploadError(validation.error || '이미지 파일이 올바르지 않습니다.');
      return undefined;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(
        imageFile,
        'profiles',
        `${username}_${Date.now()}.${imageFile.name.split('.').pop()}`
      );
      setUploadError('');
      return imageUrl;
    } catch (uploadError: unknown) {
      const errorMessage = uploadError instanceof Error 
        ? uploadError.message 
        : '이미지 업로드에 실패했습니다.';
      setUploadError(errorMessage);
      return undefined;
    } finally {
      setIsUploading(false);
    }
  }, [imageFile]);

  const clearError = useCallback(() => {
    setUploadError('');
  }, []);

  return {
    imageFile,
    uploadError,
    isUploading,
    handleImageChange,
    handleImageError,
    uploadImageFile,
    clearError,
  };
}

