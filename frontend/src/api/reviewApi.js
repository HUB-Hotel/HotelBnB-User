import api from './client';

/**
 * 리뷰 관련 API
 * 백엔드 라우트: /api/reviews
 */

// 1. 숙소 리뷰 목록 조회 (공개)
export const getLodgingReviews = async (lodgingId) => {
  // GET /api/reviews/:lodgingId
  const { data } = await api.get(`/reviews/${lodgingId}`);
  return data;
};

// 2. 내 리뷰 목록 조회
export const getMyReviews = async () => {
  // GET /api/reviews/me
  const { data } = await api.get('/reviews/me');
  return data;
};

// 3. 리뷰 작성
export const createReview = async (reviewData) => {
  // POST /api/reviews
  // reviewData: { bookingId, rating, content }
  const { data } = await api.post('/reviews', reviewData);
  return data;
};

