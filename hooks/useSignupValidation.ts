/**
 * 회원가입 폼 유효성 검사 로직
 */

import { useCallback } from 'react';
import {
  validateUsername,
  validatePassword,
  validateConfirmPassword,
  validateNickname,
  getUsernameError,
  getPasswordError,
  getConfirmPasswordError,
  getNicknameError,
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
}

export function useSignupValidation() {
  const validate = useCallback((values: SignupFormData): Partial<SignupFormErrors> => {
    const errors: Partial<SignupFormErrors> = {};

    if (!validateUsername(values.username)) {
      errors.username = getUsernameError(values.username, true);
    }

    if (!validatePassword(values.password)) {
      errors.password = getPasswordError(values.password, true);
    }

    if (!validateConfirmPassword(values.confirmPassword, values.password)) {
      errors.confirmPassword = getConfirmPasswordError(
        values.confirmPassword,
        values.password,
        true
      );
    }

    if (!validateNickname(values.nickname)) {
      errors.nickname = getNicknameError(values.nickname, true);
    }

    return errors;
  }, []);

  const isFormValid = useCallback((values: SignupFormData, errors: Partial<SignupFormErrors>): boolean => {
    return (
      validateUsername(values.username) &&
      validatePassword(values.password) &&
      validateConfirmPassword(values.confirmPassword, values.password) &&
      validateNickname(values.nickname) &&
      !errors.username &&
      !errors.password &&
      !errors.confirmPassword &&
      !errors.nickname
    );
  }, []);

  return {
    validate,
    isFormValid,
  };
}

