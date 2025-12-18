import axios from 'axios';

// API 기본 URL (환경 변수에서 가져오거나 기본값 사용)
// 개발 환경에서는 localhost를 사용, 프로덕션에서는 환경 변수 사용
const getBaseURL = () => {
  // 환경 변수가 설정되어 있으면 사용
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    // 환경 변수가 있으면 사용 (프로토콜이 없으면 추가)
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      // /api가 포함되어 있는지 확인
      if (envUrl.endsWith('/api')) {
        return envUrl;
      }
      // /api가 없으면 추가
      return envUrl.endsWith('/') ? `${envUrl}api` : `${envUrl}/api`;
    }
    // 프로토콜이 없으면 https:// 추가하고 /api 확인
    const urlWithProtocol = `https://${envUrl}`;
    return urlWithProtocol.endsWith('/api') ? urlWithProtocol : `${urlWithProtocol}/api`;
  }
  
  // 환경 변수가 없으면 개발 환경용 localhost 사용
  return 'http://localhost:5000/api';
};

const BASE_URL = getBaseURL();

// 디버깅: 개발 환경에서만 API URL 출력
console.log('🔧 API Base URL:', BASE_URL);
console.log('🔧 VITE_API_URL env:', import.meta.env.VITE_API_URL);
console.log('🔧 import.meta.env.MODE:', import.meta.env.MODE);

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
    // 디버깅: 실제 요청 URL 출력
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
    console.log('🔍 API Request:', config.method?.toUpperCase(), fullUrl);
    console.log('🔍 Base URL:', config.baseURL);
    console.log('🔍 Request URL:', config.url);
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
  
  // MongoDB validation 에러 메시지 처리 (백엔드에서 변환되지 않은 경우)
  if (error.message && error.message.includes('validation failed')) {
    if (error.message.includes('name')) {
      return '이름을 입력해주세요.';
    } else if (error.message.includes('email')) {
      return '이메일을 입력해주세요.';
    } else if (error.message.includes('password')) {
      return '비밀번호를 입력해주세요.';
    }
    return '입력한 정보를 확인해주세요.';
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
  
  // 원시 에러 메시지가 사용자에게 보이기 어려운 경우 필터링
  if (error.message && (
    error.message.includes('validation failed') ||
    error.message.includes('Path') ||
    error.message.includes('is required')
  )) {
    return '입력한 정보를 확인해주세요.';
  }
  
  return error.message || fallback;
}

export default api;

