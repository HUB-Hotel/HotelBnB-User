import axios from 'axios';

// API 기본 URL (환경 변수에서 가져오거나 기본값 사용)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error?.response?.status;

    // 401, 403 에러 시 로그아웃 처리
    if (code === 401 || code === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('isLoggedIn');
      window.dispatchEvent(new Event('loginStatusChanged'));
    }

    return Promise.reject(error);
  }
);

// 에러 메시지 추출 헬퍼 함수
export function getErrorMessage(error, fallback = '요청 처리 중 오류가 발생했습니다.') {
  // Backend 응답 형식: { message: "...", resultCode: 400 }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // 네트워크 에러
  if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
    return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
  }
  
  // 상태 코드별 기본 메시지
  const status = error.response?.status;
  if (status === 400) {
    return '입력한 정보를 확인해주세요.';
  } else if (status === 401) {
    return '로그인이 필요합니다.';
  } else if (status === 403) {
    return '접근 권한이 없습니다.';
  } else if (status === 404) {
    return '요청한 정보를 찾을 수 없습니다.';
  } else if (status === 500) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
  
  return error.message || fallback;
}

export default api;

