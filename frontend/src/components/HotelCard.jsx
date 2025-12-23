import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { getFavorites, addFavorite, removeFavorite } from '../api/favoriteApi';
import { getErrorMessage } from '../api/client';
import './style/HotelCard.scss';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // API에서 찜한 목록 확인
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const response = await getFavorites();
        const favoritesData = response.data || response.data?.data || response || [];
        const favoriteIds = Array.isArray(favoritesData)
          ? favoritesData.map(item => item.lodgingId || item.lodging?._id || item._id || item)
          : [];
        const hotelIdStr = hotel.id.toString();
        setIsFavorited(favoriteIds.some(id => id.toString() === hotelIdStr));
      } catch (err) {
        console.error('Failed to check favorite status', err);
        // localStorage에서 fallback
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorited(favorites.includes(hotel.id));
      }
    };

    checkFavoriteStatus();
  }, [hotel.id]);

  // 기본 이미지 URL
  const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
  const imageUrl = imageError || !hotel.image ? defaultImage : hotel.image;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleHeartClick = async (e) => {
    e.stopPropagation();
    
    try {
      if (isFavorited) {
        await removeFavorite(hotel.id.toString());
        setIsFavorited(false);
      } else {
        await addFavorite(hotel.id.toString());
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
      alert(getErrorMessage(err, '찜하기 기능을 사용할 수 없습니다.'));
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < rating ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="hotel-card">
      <div className="hotel-image-wrapper">
        {imageLoading && (
          <div className="image-placeholder">
            <span>{hotel.name}</span>
          </div>
        )}
        <img
          src={imageUrl}
          alt={hotel.name}
          className={`hotel-image ${imageLoading ? 'loading' : ''}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        <div className="image-badge">{hotel.imageCount || 0} images</div>
        <button
          className={`heart-button ${isFavorited ? 'favorited' : ''}`}
          onClick={handleHeartClick}
        >
          <FiHeart />
        </button>
      </div>
      <div className="hotel-info">
        <h3 className="hotel-name">{hotel.name}</h3>
        <p className="hotel-price">
          ₩{hotel.price.toLocaleString()}/night excl. tax
        </p>
        <p className="hotel-address">{hotel.address}</p>
        <div className="hotel-rating">
          <div className="stars">{renderStars(hotel.starRating)}</div>
          <span className="rating-text">{hotel.starRating} Star Hotel</span>
        </div>
        <p className="hotel-amenities">{hotel.amenitiesCount}+ Amenities</p>
        <div className="hotel-reviews">
          <span className="review-score">{hotel.reviewScore}</span>
          <span className="review-text">{hotel.reviewText}</span>
          <span className="review-count">{hotel.reviewCount} reviews</span>
        </div>
        <button
          className="btn primary view-button"
          onClick={() => {
            // URL 파라미터로 가격 전달
            navigate(`/hotel/${hotel.id}?price=${hotel.price}`);
            // 페이지 이동 시 스크롤 최상단으로 이동
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
        >
          보러가기
        </button>
      </div>
    </div>
  );
};

export default HotelCard;

