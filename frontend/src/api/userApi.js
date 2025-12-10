import api from './client';

/**
 * 사용자 정보 관련 API
 */

// 사용자 정보 조회
export const getUserInfo = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

// 사용자 정보 수정
export const updateUserInfo = async (userInfo) => {
  const { data } = await api.patch('/auth/me', userInfo);
  return data;
};

// 비밀번호 변경
export const changePassword = async ({ newPassword }) => {
  const { data } = await api.patch('/auth/me', {
    password: newPassword,
  });
  return data;
};

