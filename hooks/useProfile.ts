/**
 * 프로필 페이지 전용 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { updateProfile } from '@/services/auth';
import { handleShareProfile } from '@/lib/utils/share';
import type { ProfileResponse } from '@/types/auth';
import { User } from '@/components/profile/UserCard';
import { mockUsers } from '@/lib/data/mockUsers';
import { useAuthContext } from '@/contexts/AuthContext';

interface UseProfileReturn {
  profile: ProfileResponse | null;
  isLoading: boolean;
  error: string | null;
  followingCount: number;
  followerCount: number;
  userList: User[];
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  handleEdit: () => void;
  handleShare: () => Promise<void>;
  handleSaveProfile: (data: {
    nickname: string;
    bio?: string | null;
    profileImageUrl?: string | null;
  }) => Promise<void>;
  handleFollow: (userId: string) => void;
  handleUnfollow: (userId: string) => void;
}

export function useProfile(
  onShareSuccess?: (message: string) => void,
  onShareError?: (message: string) => void
): UseProfileReturn {
  // AuthContext에서 프로필 데이터 사용 (중복 API 호출 방지)
  const { profile: authProfile, checkAuth } = useAuthContext();
  const [profile, setProfile] = useState<ProfileResponse | null>(authProfile);
  const [isLoading, setIsLoading] = useState(!authProfile);
  const [error, setError] = useState<string | null>(null);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [userList, setUserList] = useState<User[]>(mockUsers);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 초기 팔로잉 수 계산
  useEffect(() => {
    const initialFollowingCount = mockUsers.filter(user => user.isFollowing).length;
    setFollowingCount(initialFollowingCount);
  }, []);

  // AuthContext의 프로필 데이터 동기화
  useEffect(() => {
    if (authProfile) {
      setProfile(authProfile);
      setIsLoading(false);
    }
  }, [authProfile]);

  const handleEdit = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleShare = useCallback(async () => {
    if (!profile) return;

    const result = await handleShareProfile(
      profile.username,
      profile.nickname || profile.username
    );

    if (result.success) {
      onShareSuccess?.(result.message);
    } else {
      onShareError?.(result.message);
    }
  }, [profile, onShareSuccess, onShareError]);

  const handleSaveProfile = useCallback(async (data: {
    nickname: string;
    bio?: string | null;
    profileImageUrl?: string | null;
  }) => {
    try {
      const updatedProfile = await updateProfile({
        nickname: data.nickname,
        bio: data.bio,
        profileImageUrl: data.profileImageUrl,
      });

      setProfile(updatedProfile);
      setIsEditModalOpen(false);
      
      // AuthContext의 프로필도 업데이트 (checkAuth 호출)
      await checkAuth();
    } catch (err: unknown) {
      console.error('프로필 업데이트 에러:', err);
      throw err instanceof Error ? err : new Error('프로필 업데이트에 실패했습니다.');
    }
  }, [checkAuth]);

  const handleFollow = useCallback((userId: string) => {
    setUserList((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isFollowing: true } : user
      )
    );
    setFollowingCount((prev) => prev + 1);
  }, []);

  const handleUnfollow = useCallback((userId: string) => {
    setUserList((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isFollowing: false } : user
      )
    );
    setFollowingCount((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    profile,
    isLoading,
    error,
    followingCount,
    followerCount,
    userList,
    isEditModalOpen,
    setIsEditModalOpen,
    handleEdit,
    handleShare,
    handleSaveProfile,
    handleFollow,
    handleUnfollow,
  };
}

