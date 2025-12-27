/**
 * 회원가입 폼 전용 커스텀 훅
 */

import { useState, useCallback } from 'react';
import { useForm } from './useForm';
import { useUsernameAvailability, useNicknameAvailability } from './useAvailabilityCheck';
import { useImageUpload } from './useImageUpload';
import { useSignupValidation } from './useSignupValidation';
import { signup } from '@/services/auth';
import { handleApiError, getErrorMessage } from '@/lib/utils/errorHandler';
import {
  validateUsername,
  validatePassword,
  validateConfirmPassword,
  validateNickname,
} from '@/lib/utils/validation';

interface SignupFormData {
  username: string;
  password: string;
  confirmPassword: string;
  nickname: string;
}

interface SignupFormErrors {
  username: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  general: string;
}

export function useSignupForm() {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  const imageUpload = useImageUpload();
  const { validate, isFormValid: validateForm } = useSignupValidation();

  const form = useForm<SignupFormData>({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
      nickname: '',
    },
    validate,
    onSubmit: async (values) => {
      setGeneralError(''); // 에러 초기화
      
      // 프로필 이미지 업로드 (이미지가 선택된 경우에만)
      let profileImageUrl: string | undefined = undefined;
      if (imageUpload.imageFile) {
        try {
          profileImageUrl = await imageUpload.uploadImageFile(values.username);
          
          // uploadImageFile이 undefined를 반환하면 업로드 실패
          if (profileImageUrl === undefined) {
            // 업로드 실패 시 에러 메시지 확인
            await new Promise(resolve => setTimeout(resolve, 100)); // 비동기 상태 업데이트 대기
            const errorMsg = imageUpload.uploadError || '이미지 업로드에 실패했습니다.';
            setGeneralError(errorMsg);
            return; // 회원가입 중단
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : '이미지 업로드에 실패했습니다.';
          setGeneralError(errorMessage);
          return; // 회원가입 중단
        }
      }
      // 이미지가 선택되지 않은 경우 profileImageUrl은 undefined로 유지 (정상)

      // 회원가입 API 호출
      try {
        await signup({
          id: values.username,
          password: values.password,
          nickname: values.nickname,
          profileImageUrl, // undefined일 수 있음 (이미지 선택 안 한 경우)
        });

        setIsSuccessModalOpen(true);
      } catch (error: unknown) {
        const errorResponse = handleApiError(error);
        const errorMessage = getErrorMessage(errorResponse);

        // 중복 에러 메시지 파싱
        if (errorMessage.includes('이미 사용 중인 아이디')) {
          form.setFieldError('username', '이미 사용중인 아이디입니다.');
        } else if (errorMessage.includes('이미 사용 중인 닉네임')) {
          form.setFieldError('nickname', '이미 사용중인 닉네임입니다.');
        } else {
          setGeneralError(errorMessage);
        }
      }
    },
  });

  // 아이디/닉네임 중복 체크
  const usernameAvailability = useUsernameAvailability(
    form.values.username,
    form.touched.username || false
  );
  const nicknameAvailability = useNicknameAvailability(
    form.values.nickname,
    form.touched.nickname || false
  );

  // 실시간 에러 업데이트 (중복 체크 결과 반영)
  const usernameError = form.errors.username || 
    (usernameAvailability.isAvailable === false ? '이미 사용중인 아이디입니다.' : '');
  const nicknameError = form.errors.nickname || 
    (nicknameAvailability.isAvailable === false ? '이미 사용중인 닉네임입니다.' : '');

  // 성공 메시지
  const usernameSuccess = usernameAvailability.isAvailable === true ? '사용가능한 아이디입니다.' : '';
  const nicknameSuccess = nicknameAvailability.isAvailable === true ? '사용가능한 닉네임입니다.' : '';

  // 폼 유효성 검사
  const isFormValid =
    validateForm(form.values, form.errors) &&
    !usernameError &&
    !nicknameError &&
    !generalError &&
    !imageUpload.uploadError &&
    !usernameAvailability.isChecking &&
    !nicknameAvailability.isChecking;

  return {
    form,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    usernameError,
    nicknameError,
    usernameSuccess,
    nicknameSuccess,
    generalError: generalError || imageUpload.uploadError,
    isFormValid,
    isCheckingUsername: usernameAvailability.isChecking,
    isCheckingNickname: nicknameAvailability.isChecking,
    handleImageChange: imageUpload.handleImageChange,
    handleImageError: imageUpload.handleImageError,
  };
}

