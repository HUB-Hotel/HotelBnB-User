import React, { useMemo, useState } from 'react';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { allHotelsData } from '../pages/SearchResults';
import './style/Highlights.scss';
import { useNavigate } from 'react-router-dom';

// 랜덤으로 숙소 추천 (매번 다른 숙소 표시)
const getRandomHotels = () => {
  const shuffled = [...allHotelsData]
    .filter((hotel) => hotel.image) // 이미지가 있는 호텔만 필터링
    .sort(() => 0.5 - Math.random());
  // 4개씩 보여주면서 화살표로 하나씩 넘길 수 있도록 넉넉히 가져오기
  return shuffled.slice(0, 12);
};

// 기본 이미지 URL
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

const Highlights = () => {
  const recommendedHotels = useMemo(() => getRandomHotels(), []);
  const navigate = useNavigate();
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;

  const total = recommendedHotels.length;

  const handlePrev = () => {
    if (total <= visibleCount) return;
    setStartIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    if (total <= visibleCount) return;
    setStartIndex((prev) => (prev + 1) % total);
  };

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <span className="section-badge">숙소 추천</span>
          <h2 className="section-title">인기 있는 숙소를 확인하고 예약해보세요</h2>
        </div>
      </div>

      <div className="highlights-carousel">
        <button
          type="button"
          className="highlights-arrow left"
          onClick={handlePrev}
          aria-label="이전 숙소 보기"
          disabled={total <= visibleCount}
        >
          <FiChevronLeft />
        </button>

        <div className="card-wrapper">
          <div
            className="card-slider"
            style={{
              transform: `translateX(calc(-${startIndex} * ((100% - 6rem) / ${visibleCount} + 2rem)))`,
            }}
          >
            {recommendedHotels.map((hotel) => {
              const imageUrl = hotel.image || DEFAULT_IMAGE;
              return (
                <div
                  key={hotel.id}
                  className="destination-card"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(5, 18, 13, 0.2), rgba(8, 30, 22, 0.75)), url(${imageUrl})`,
                  }}
                >
                  <div className="destination-meta">
                    <h3>{hotel.name}</h3>
                    <p>{hotel.address}</p>
                    <span className="price">₩{hotel.price.toLocaleString()}</span>
                    <button
                      className="btn action-button"
                      onClick={() => navigate(`/hotel/${hotel.id}`)}
                    >
                      숙소 예약 <FiArrowRight />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="highlights-arrow right"
          onClick={handleNext}
          aria-label="다음 숙소 보기"
          disabled={total <= visibleCount}
        >
          <FiChevronRight />
        </button>
      </div>
    </section>
  );
};

export default Highlights;

