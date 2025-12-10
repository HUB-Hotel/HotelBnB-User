import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import './style/HeroSection.scss';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1600&q=80',
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length),
      6000
    );
    return () => clearInterval(timer);
  }, []);

  const handleSearchClick = () => {
    navigate('/search');
  };

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-background">
          {HERO_IMAGES.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`추천 숙소 이미지 ${index + 1}`}
              className={index === currentSlide ? 'active' : ''}
            />
          ))}
          <div className="hero-overlay" />
          <div className="hero-indicators">
            {HERO_IMAGES.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`배경 이미지 ${index + 1} 보기`}
              />
            ))}
          </div>
        </div>
        <div className="hero-content">
          <span className="badge">Stay better with HotelBnB</span>
          <h1 className="hero-title">호텔부터 BnB까지, 나만의 숙소를 찾아보세요.</h1>
          <p className="hero-description">
            호텔부터 감성 숙소까지, 여행지에서도 집처럼 편안한 공간을 HotelBnB에서 만나보세요.
          </p>
          <button className="hero-search-button" onClick={handleSearchClick}>
            <FiSearch />
            <span>숙소 보러가기</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

