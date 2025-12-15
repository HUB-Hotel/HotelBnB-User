// frontend/src/pages/SocialLoginHandler.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMe } from '../api/authApi';

const SocialLoginHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('처리 중...');

  useEffect(() => {
    const handleSocialLogin = async () => {
      const token = searchParams.get('token');

      if (!token) {
        console.error("❌ 토큰 없음");
        setStatus('로그인 실패: 토큰이 없습니다.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      try {
        console.log("✅ 소셜 로그인 성공! 새 토큰:", token);

        // 1. 토큰 저장
        localStorage.setItem('token', token);
        localStorage.setItem('isLoggedIn', 'true');

        // 2. 사용자 정보 가져오기
        setStatus('사용자 정보를 가져오는 중...');
        const userResponse = await getMe();
        const user = userResponse?.data || userResponse;
        
        if (user) {
          localStorage.setItem('userInfo', JSON.stringify(user));
          console.log("✅ 사용자 정보 저장 완료:", user);
        }

        // 3. 상태 갱신 이벤트
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('loginStatusChanged'));

        // 4. 메인으로 이동
        setStatus('로그인 성공! 메인 페이지로 이동합니다...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } catch (error) {
        console.error("❌ 사용자 정보 가져오기 실패:", error);
        setStatus('로그인 실패: 사용자 정보를 가져올 수 없습니다.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    handleSocialLogin();
  }, [navigate, searchParams]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <h2>{status}</h2>
    </div>
  );
};

export default SocialLoginHandler;