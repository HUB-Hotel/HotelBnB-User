import api from './client';

// 쿠폰 코드 검증
export const validateCoupon = async (code, totalAmount) => {
  try {
    const response = await api.post('/coupons/validate', {
      code,
      totalAmount
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

