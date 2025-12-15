import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token');

    if (!isLoggedIn || !token) {
      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // 로그인 상태 확인
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const token = localStorage.getItem('token');

  // 로그인하지 않은 경우 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (!isLoggedIn || !token) {
    return null;
  }

  // 로그인한 경우 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;

