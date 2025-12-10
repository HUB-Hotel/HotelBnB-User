import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './style/TravelCards.scss';

const travelCards = [
  {
    city: '멜버른',
    destination: '멜버른, 호주',
    description: 'Amazing journey',
    price: '₩130,000',
    image:
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    city: '파리',
    destination: '파리, 프랑스',
    description: 'A Paris adventure',
    price: '₩150,000',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  },
  {
    city: '런던',
    destination: '런던, 영국',
    description: 'London eye adventure',
    price: '₩130,000',
    image:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  },
  {
    city: '콜롬비아',
    destination: '콜롬비아, 콜롬비아',
    description: 'Amazing streets',
    price: '₩150,000',
    image:
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    city: '도쿄',
    destination: '도쿄, 일본',
    description: 'City lights',
    price: '₩180,000',
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
  },
  {
    city: '뉴욕',
    destination: '뉴욕, 미국',
    description: 'Skyline view',
    price: '₩210,000',
    image:
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
  },
];

const TravelCards = () => {
  const navigate = useNavigate();
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;

  const total = travelCards.length;

  const handleCountryClick = (destination) => {
    const params = new URLSearchParams();
    params.set('destination', destination);
    navigate(`/search?${params.toString()}`);
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <section className="section">
      <div className="section-header">
        <div>
          <span className="section-badge">나라 추천</span>
          <h2 className="section-title">인기있는 여행지를 확인해보세요</h2>
        </div>
      </div>

      <div className="travel-carousel">
        <button
          type="button"
          className="travel-arrow left"
          onClick={() =>
            total > visibleCount &&
            setStartIndex((prev) => (prev - 1 + total) % total)
          }
          aria-label="이전 나라 보기"
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
            {travelCards.map((card) => (
              <div
                key={card.city}
                className="destination-card"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(5, 18, 13, 0.2), rgba(8, 30, 22, 0.75)), url(${card.image})`,
                }}
              >
                <div className="destination-meta">
                  <h3>{card.city}</h3>
                  <p>{card.description}</p>
                  <span className="price">{card.price}</span>
                  <button
                    className="btn action-button"
                    onClick={() => handleCountryClick(card.destination)}
                  >
                    나라보러가기 <FiArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="travel-arrow right"
          onClick={() =>
            total > visibleCount &&
            setStartIndex((prev) => (prev + 1) % total)
          }
          aria-label="다음 나라 보기"
          disabled={total <= visibleCount}
        >
          <FiChevronRight />
        </button>
      </div>
    </section>
  );
};

export default TravelCards;
