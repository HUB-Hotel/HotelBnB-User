import React, { useState, useEffect } from 'react';
import './style/SearchFilters.scss';

const SearchFilters = ({ onFilterChange }) => {
  const [priceRange, setPriceRange] = useState([50000, 1200000]);
  const [selectedRating, setSelectedRating] = useState(null);

  // 필터 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        priceRange,
        selectedRating,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange, selectedRating]);

  const handleRatingChange = (rating) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
    // 즉시 부모 컴포넌트에 알림
    if (onFilterChange) {
      onFilterChange({
        priceRange,
        selectedRating: newRating,
      });
    }
  };

  const handleResetAll = () => {
    const resetPriceRange = [50000, 1200000];
    const resetRating = null;

    setPriceRange(resetPriceRange);
    setSelectedRating(resetRating);

    // 즉시 부모 컴포넌트에 알림
    if (onFilterChange) {
      onFilterChange({
        priceRange: resetPriceRange,
        selectedRating: resetRating,
      });
    }
  };

  return (
    <div className="search-filters">
      <div className="filters-header">
        <h3 className="filters-title">필터</h3>
        <button className="reset-all-button" onClick={handleResetAll}>
          전체 해제
        </button>
      </div>

      <div className="filter-section">
        <h4 className="filter-label">가격</h4>
        <div className="price-range">
          <div className="price-inputs">
            <span className="price-value">₩{priceRange[0].toLocaleString()}</span>
            <span className="price-separator">-</span>
            <span className="price-value">₩{priceRange[1].toLocaleString()}</span>
          </div>
          <div className="price-slider-wrapper">
            <input
              type="range"
              min="0"
              max="2000000"
              step="10000"
              value={priceRange[1]}
              onChange={(e) => {
                const newPriceRange = [priceRange[0], parseInt(e.target.value)];
                setPriceRange(newPriceRange);
                // 즉시 부모 컴포넌트에 알림
                if (onFilterChange) {
                  onFilterChange({
                    priceRange: newPriceRange,
                    selectedRating,
                  });
                }
              }}
              className="price-slider"
            />
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h4 className="filter-label">별점</h4>
        <div className="rating-buttons">
          {[0, 1, 2, 3, 4].map((rating) => (
            <button
              key={rating}
              className={`rating-button ${selectedRating === rating ? 'active' : ''}`}
              onClick={() => handleRatingChange(rating)}
            >
              {rating}+
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;

