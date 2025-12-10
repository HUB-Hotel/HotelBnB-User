import api from './client';

/**
 * 찜하기 관련 API
 */

// 찜한 숙소 목록 조회
export const getFavorites = async () => {
  const { data } = await api.get('/bookmarks');
  return data;
};

// 찜하기 추가
export const addFavorite = async (lodgingId) => {
  const { data } = await api.post('/bookmarks', { lodgingId });
  return data;
};

// 찜하기 삭제
export const removeFavorite = async (lodgingId) => {
  const { data } = await api.delete(`/bookmarks/${lodgingId}`);
  return data;
};

