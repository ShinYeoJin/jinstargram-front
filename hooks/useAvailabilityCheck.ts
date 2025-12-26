/**
 * 아이디/닉네임 중복 체크 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { checkUsernameAvailability, checkNicknameAvailability } from '@/services/validation';
import { DEBOUNCE_DELAY } from '@/lib/constants';

export interface AvailabilityState {
  isAvailable: boolean | null;
  isChecking: boolean;
  message: string;
}

export interface UseAvailabilityCheckOptions {
  value: string;
  touched: boolean;
  minLength: number;
  checkFunction: (value: string) => Promise<boolean>;
  availableMessage: string;
  unavailableMessage: string;
}

export function useAvailabilityCheck({
  value,
  touched,
  minLength,
  checkFunction,
  availableMessage,
  unavailableMessage,
}: UseAvailabilityCheckOptions): AvailabilityState {
  const [state, setState] = useState<AvailabilityState>({
    isAvailable: null,
    isChecking: false,
    message: '',
  });

  useEffect(() => {
    // 터치되지 않았거나 최소 길이 미만이면 체크하지 않음
    if (!touched || value.length < minLength) {
      setState({
        isAvailable: null,
        isChecking: false,
        message: '',
      });
      return;
    }

    // Debounce
    const timeoutId = setTimeout(async () => {
      setState((prev) => ({ ...prev, isChecking: true }));

      try {
        const isAvailable = await checkFunction(value);
        setState({
          isAvailable,
          isChecking: false,
          message: isAvailable ? availableMessage : unavailableMessage,
        });
      } catch (error) {
        console.error('Availability check error:', error);
        setState({
          isAvailable: null,
          isChecking: false,
          message: '',
        });
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [value, touched, minLength, checkFunction, availableMessage, unavailableMessage]);

  return state;
}

/**
 * 아이디 중복 체크 훅
 */
export function useUsernameAvailability(username: string, touched: boolean) {
  return useAvailabilityCheck({
    value: username,
    touched,
    minLength: 4,
    checkFunction: checkUsernameAvailability,
    availableMessage: '사용가능한 아이디입니다.',
    unavailableMessage: '이미 사용중인 아이디입니다.',
  });
}

/**
 * 닉네임 중복 체크 훅
 */
export function useNicknameAvailability(nickname: string, touched: boolean) {
  return useAvailabilityCheck({
    value: nickname,
    touched,
    minLength: 2,
    checkFunction: checkNicknameAvailability,
    availableMessage: '사용가능한 닉네임입니다.',
    unavailableMessage: '이미 사용중인 닉네임입니다.',
  });
}

