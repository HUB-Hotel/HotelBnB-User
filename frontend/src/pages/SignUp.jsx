import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FaFacebook, FaGoogle, FaApple } from 'react-icons/fa';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { signup, login } from '../api/authApi';
import { getErrorMessage } from '../api/client';
import './style/Login.scss';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  ];

  useEffect(() => {
    // 첫 번째 이미지가 즉시 보이도록 확인
    console.log('Current slide:', currentSlide);
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % slides.length;
        console.log('Slide changed to:', next);
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 입력값 검증
    if (!formData.firstName || !formData.firstName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (!formData.lastName || !formData.lastName.trim()) {
      setError('성을 입력해주세요.');
      return;
    }

    if (!formData.email || !formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (!formData.password || !formData.password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreed) {
      setError('동의하기를 체크해주세요.');
      return;
    }

    try {
      // 실제 회원가입 API 호출
      const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      const response = await signup({
        name,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      // 회원가입 성공 시 (Backend 응답: { data: {...}, message: "...", resultCode: 201 })
      if (response.data) {
        // 회원가입 후 자동 로그인을 위해 로그인 API 호출
        try {
          const loginResponse = await login({ 
            email: formData.email, 
            password: formData.password 
          });
          
          // Backend 응답: { data: { user, token }, message: "...", resultCode: 200 }
          const token = loginResponse.data?.token || loginResponse.data?.data?.token;
          const user = loginResponse.data?.user || loginResponse.data?.data?.user || loginResponse.data?.data;
          
          if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('isLoggedIn', 'true');
            if (user) {
              localStorage.setItem('userInfo', JSON.stringify(user));
            }
            window.dispatchEvent(new Event('loginStatusChanged'));
            navigate('/');
          }
        } catch (loginErr) {
          // 회원가입은 성공했지만 로그인 실패 시 로그인 페이지로 이동
          navigate('/login');
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, '회원가입에 실패했습니다.'));
    }
  };

  // ✅ 소셜 로그인 핸들러
  const handleSocialLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/${provider}`;
  };

  return (
    <div className="auth-page signup-page">
      <div className="auth-container">
        <div className="auth-image-section">
          <div className="image-carousel">
            {slides.map((src, index) => {
              const isActive = index === currentSlide;
              return (
                <img
                  key={`slide-${index}`}
                  src={src}
                  alt={`Resort ${index + 1}`}
                  className={isActive ? 'active' : ''}
                  style={{ 
                    opacity: isActive ? 1 : 0,
                    zIndex: isActive ? 1 : 0,
                    transition: 'opacity 0.8s ease-in-out'
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', src);
                    e.target.style.display = 'none';
                  }}
                />
              );
            })}
            <div className="carousel-indicators">
              {slides.map((_, index) => (
                <button
                  key={`indicator-${index}`}
                  type="button"
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`이미지 ${index + 1} 보기`}
                ></button>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <h1 className="auth-title">회원가입</h1>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">이름</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="이름"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">성</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="성"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">이메일</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="이메일"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">전화번호</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="전화번호"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">비밀번호</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="비밀번호"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">비밀번호 확인</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="비밀번호 확인"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>동의하기</span>
              </label>

              <button type="submit" className="btn-primary">
                계정 생성
              </button>
            </form>

            <div className="auth-footer">
              <span>이미 계정이 있으신가요? </span>
              <Link to="/login" className="signup-link">
                로그인
              </Link>
            </div>

            <div className="divider">
              <span>또는 다음으로 가입하기</span>
            </div>

            <div className="social-login">
              <button 
                type="button" 
                className="social-btn google" 
                onClick={() => handleSocialLogin('google')}
              >
                <FaGoogle />
              </button>

              <button 
                type="button" 
                className="social-btn kakao" 
                onClick={() => handleSocialLogin('kakao')}
              >
                <RiKakaoTalkFill />
              </button>

              <button 
                type="button" 
                className="social-btn facebook" 
                onClick={() => alert("준비 중입니다.")}
              >
                <FaFacebook />
              </button>
              
              <button 
                type="button" 
                className="social-btn apple" 
                onClick={() => alert("준비 중입니다.")}
              >
                <FaApple />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

