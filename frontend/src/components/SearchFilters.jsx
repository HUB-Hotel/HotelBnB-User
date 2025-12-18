import React, { useState, useEffect, useCallback, useRef } from 'react';
import './style/SearchFilters.scss';

const SearchFilters = ({ onFilterChange, activeTab, onTabChange, sortBy, onSortChange, tabCounts }) => {
  const [priceRange, setPriceRange] = useState([50000, 1200000]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedReviewCount, setSelectedReviewCount] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);
  const tabDropdownRef = useRef(null);

  // 필터 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        priceRange,
        selectedRating,
        selectedReviewCount,
        selectedCountries,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange, selectedRating, selectedReviewCount, selectedCountries]);

  const handleRatingChange = useCallback((rating) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
    // 즉시 부모 컴포넌트에 알림
    if (onFilterChange) {
      onFilterChange({
        priceRange,
        selectedRating: newRating,
        selectedReviewCount,
        selectedCountries,
      });
    }
  }, [selectedRating, priceRange, selectedReviewCount, selectedCountries, onFilterChange]);

  const handleReviewCountChange = useCallback((count) => {
    const newCount = selectedReviewCount === count ? null : count;
    setSelectedReviewCount(newCount);
    // 즉시 부모 컴포넌트에 알림
    if (onFilterChange) {
      onFilterChange({
        priceRange,
        selectedRating,
        selectedReviewCount: newCount,
        selectedCountries,
      });
    }
  }, [selectedReviewCount, priceRange, selectedRating, selectedCountries, onFilterChange]);

  const handleCountryChange = useCallback((country) => {
    const newCountries = selectedCountries.includes(country)
      ? selectedCountries.filter(c => c !== country)
      : [...selectedCountries, country];
    setSelectedCountries(newCountries);
    // 즉시 부모 컴포넌트에 알림
    if (onFilterChange) {
      onFilterChange({
        priceRange,
        selectedRating,
        selectedReviewCount,
        selectedCountries: newCountries,
      });
    }
  }, [selectedCountries, priceRange, selectedRating, selectedReviewCount, onFilterChange]);

  const handlePriceChange = useCallback((newMaxPrice) => {
    const newPriceRange = [priceRange[0], newMaxPrice];
    setPriceRange(newPriceRange);
    // 즉시 부모 컴포넌트에 알림
    if (onFilterChange) {
      onFilterChange({
        priceRange: newPriceRange,
        selectedRating,
        selectedReviewCount,
        selectedCountries,
      });
    }
  }, [priceRange, selectedRating, selectedReviewCount, selectedCountries, onFilterChange]);

  const handleResetAll = useCallback(() => {
    const resetPriceRange = [50000, 1200000];
    const resetRating = null;
    const resetReviewCount = null;
    const resetCountries = [];

    setPriceRange(resetPriceRange);
    setSelectedRating(resetRating);
    setSelectedReviewCount(resetReviewCount);
    setSelectedCountries(resetCountries);

    // 즉시 부모 컴포넌트에 알림
    if (onFilterChange) {
      onFilterChange({
        priceRange: resetPriceRange,
        selectedRating: resetRating,
        selectedReviewCount: resetReviewCount,
        selectedCountries: resetCountries,
      });
    }
  }, [onFilterChange]);

  // 필터가 적용되었는지 확인
  const hasActiveFilters = priceRange[1] < 2000000 || selectedRating !== null || selectedReviewCount !== null || selectedCountries.length > 0;

  const tabs = [
    { id: 'All', label: '전체', count: tabCounts?.all || 0 },
    { id: 'Hotels', label: '호텔', count: tabCounts?.hotels || 0 },
    { id: 'Motels', label: '모텔', count: tabCounts?.motels || 0 },
    { id: 'Resorts', label: '리조트', count: tabCounts?.resorts || 0 },
  ];

  const sortOptions = [
    { value: 'Recommended', label: '추천순' },
    { value: 'Price Low', label: '가격: 낮은 순' },
    { value: 'Price High', label: '가격: 높은 순' },
    { value: 'Rating', label: '평점순' },
  ];

  // 국가 목록
  const countries = [
    { value: '대한민국', label: '대한민국' },
    { value: '일본', label: '일본' },
    { value: '프랑스', label: '프랑스' },
    { value: '영국', label: '영국' },
    { value: '미국', label: '미국' },
    { value: '호주', label: '호주' },
    { value: '콜롬비아', label: '콜롬비아' },
  ];

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false);
      }
      if (tabDropdownRef.current && !tabDropdownRef.current.contains(event.target)) {
        setIsTabDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen || isTabDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortDropdownOpen, isTabDropdownOpen]);

  const handleSortSelect = (value) => {
    if (onSortChange) {
      onSortChange(value);
    }
    setIsSortDropdownOpen(false);
  };

  const handleTabSelect = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    setIsTabDropdownOpen(false);
  };

  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || '추천순';
  const currentTabLabel = tabs.find(tab => tab.id === activeTab)?.label || '전체';

  return (
    <div className="search-filters">
      <div className="filters-header">
        <h3 className="filters-title">필터</h3>
        {hasActiveFilters && (
          <button className="reset-all-button" onClick={handleResetAll}>
            전체 해제
          </button>
        )}
      </div>

      {/* 숙소 유형 필터 */}
      <div className="filter-section">
        <h4 className="filter-label">숙소 유형</h4>
        <div className="sort-dropdown-wrapper" ref={tabDropdownRef}>
          <button
            type="button"
            className="sort-select-button"
            onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
            aria-expanded={isTabDropdownOpen}
            aria-haspopup="listbox"
          >
            <span>{currentTabLabel} ({tabs.find(tab => tab.id === activeTab)?.count || 0}개)</span>
            <svg
              className={`sort-arrow ${isTabDropdownOpen ? 'open' : ''}`}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 9L1 4h10z" fill="currentColor" />
            </svg>
          </button>
          {isTabDropdownOpen && (
            <div className="sort-dropdown-menu">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`sort-option ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabSelect(tab.id)}
                >
                  {tab.label} ({tab.count}개)
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 정렬 옵션 */}
      <div className="filter-section">
        <h4 className="filter-label">정렬</h4>
        <div className="sort-dropdown-wrapper" ref={sortDropdownRef}>
          <button
            type="button"
            className="sort-select-button"
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            aria-expanded={isSortDropdownOpen}
            aria-haspopup="listbox"
          >
            <span>{currentSortLabel}</span>
            <svg
              className={`sort-arrow ${isSortDropdownOpen ? 'open' : ''}`}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 9L1 4h10z" fill="currentColor" />
            </svg>
          </button>
          {isSortDropdownOpen && (
            <div className="sort-dropdown-menu">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                  onClick={() => handleSortSelect(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 가격 범위 필터 */}
      <div className="filter-section">
        <h4 className="filter-label">가격 범위</h4>
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
              onChange={(e) => handlePriceChange(parseInt(e.target.value))}
              className="price-slider"
              aria-label="최대 가격 선택"
            />
          </div>
          <div className="price-hint">
            최대 ₩{priceRange[1].toLocaleString()}까지 표시됩니다
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h4 className="filter-label">최소 별점</h4>
        <div className="rating-buttons">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              className={`rating-button ${selectedRating === rating ? 'active' : ''}`}
              onClick={() => handleRatingChange(rating)}
              aria-label={`${rating}점 이상`}
            >
              {rating}+
            </button>
          ))}
        </div>
        {selectedRating !== null && (
          <div className="rating-hint">
            {selectedRating}점 이상의 숙소만 표시됩니다
          </div>
        )}
      </div>

      {/* 리뷰 수 필터 */}
      <div className="filter-section">
        <h4 className="filter-label">최소 리뷰 수</h4>
        <div className="review-count-buttons">
          {[
            { value: 10, label: '10개 이상' },
            { value: 50, label: '50개 이상' },
            { value: 100, label: '100개 이상' },
          ].map((option) => (
            <button
              key={option.value}
              className={`review-count-button ${selectedReviewCount === option.value ? 'active' : ''}`}
              onClick={() => handleReviewCountChange(option.value)}
              aria-label={`리뷰 ${option.label}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {selectedReviewCount !== null && (
          <div className="review-count-hint">
            리뷰 {selectedReviewCount}개 이상의 숙소만 표시됩니다
          </div>
        )}
      </div>

      {/* 국가 필터 */}
      <div className="filter-section">
        <h4 className="filter-label">국가</h4>
        <div className="checkbox-list">
          {countries.map((country) => (
            <label key={country.value} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedCountries.includes(country.value)}
                onChange={() => handleCountryChange(country.value)}
                aria-label={country.label}
              />
              <span>{country.label}</span>
            </label>
          ))}
        </div>
        {selectedCountries.length > 0 && (
          <div className="rating-hint">
            선택한 {selectedCountries.length}개 국가의 숙소만 표시됩니다
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;

