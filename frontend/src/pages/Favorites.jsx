import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import HotelCard from '../components/HotelCard';
import Footer from '../components/Footer';
import { getFavorites } from '../api/favoriteApi';
import { getErrorMessage } from '../api/client';
import { allHotelsData } from './SearchResults';
import './style/Favorites.scss';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // API에서 찜한 숙소 목록 가져오기
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const response = await getFavorites();
        // Backend 응답: { data: [...], message: "...", resultCode: 200 }
        const favoritesData = response.data || response.data?.data || response || [];
        
        // lodgingId 배열로 변환
        const favoriteIds = Array.isArray(favoritesData) 
          ? favoritesData.map(item => item.lodgingId || item.lodging?._id || item._id)
          : [];
        
        setFavorites(favoriteIds);
      } catch (err) {
        console.error('Failed to load favorites', err);
        setError(getErrorMessage(err, '찜한 숙소를 불러오는데 실패했습니다.'));
        // localStorage에서 fallback
        const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(stored);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // 찜한 숙소 필터링
  const favoriteHotels = useMemo(() => {
    return allHotelsData.filter((hotel) => favorites.includes(hotel.id));
  }, [favorites]);

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

