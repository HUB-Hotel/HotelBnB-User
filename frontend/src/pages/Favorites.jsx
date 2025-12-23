import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import HotelCard from '../components/HotelCard';
import Footer from '../components/Footer';
import { getFavorites } from '../api/favoriteApi';
import { getErrorMessage } from '../api/client';
import './style/Favorites.scss';

const Favorites = () => {
  const navigate = useNavigate();
  const [favoriteHotels, setFavoriteHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 로그인 상태 확인
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token');

    if (!isLoggedIn || !token) {
      navigate('/login', { replace: true });
      return;
    }
  }, [navigate]);

  // API에서 찜한 숙소 목록 가져오기
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const response = await getFavorites();
        // Backend 응답: { data: [...], message: "...", resultCode: 200 }
        const favoritesData = response.data || response.data?.data || response || [];
        
        // 백엔드에서 populate된 lodging 정보 사용
        const lodgings = Array.isArray(favoritesData) 
          ? favoritesData.map(item => item.lodging || item)
          : [];
        
        // reviewText 생성 함수
        const getReviewText = (rating) => {
          if (rating >= 4.5) return 'Excellent';
          if (rating >= 4) return 'Very Good';
          if (rating >= 3) return 'Good';
          return 'Fair';
        };
        
        // Lodging 데이터를 Hotel 형식으로 변환
        const hotels = lodgings
          .filter(lodging => lodging && lodging.lodgingName) // null 제거
          .map((lodging) => {
            const city = lodging.address?.split(' ')[0] || '';
            
            return {
              id: lodging._id.toString(),
              name: lodging.lodgingName,
              price: lodging.minPrice || 0,
              address: lodging.address,
              destination: `${city}, ${lodging.country}`,
              type: lodging.category || 'hotel',
              starRating: lodging.starRating || 3,
              reviewScore: lodging.rating || 0,
              reviewCount: lodging.reviewCount || 0,
              reviewText: getReviewText(lodging.rating || 0),
              image: lodging.images?.[0] || '',
              imageCount: lodging.images?.length || 0,
              amenitiesCount: 10,
              country: lodging.country,
            };
          });
        
        setFavoriteHotels(hotels);
      } catch (err) {
        console.error('Failed to load favorites', err);
        setError(getErrorMessage(err, '찜한 숙소를 불러오는데 실패했습니다.'));
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  return (
    <div className="favorites-page">
      <Header />
      <div className="favorites-container">
        <div className="favorites-header">
          <h1 className="favorites-title">찜한 숙소</h1>
          <p className="favorites-count">{favoriteHotels.length}개의 숙소</p>
        </div>
        {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
        ) : favoriteHotels.length > 0 ? (
          <div className="favorites-list">
            {favoriteHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <div className="no-favorites">
            <p>찜한 숙소가 없습니다.</p>
            <p>숙소를 찜하면 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;

