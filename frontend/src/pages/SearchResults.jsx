import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseISO, format, differenceInDays } from 'date-fns';
import Header from '../components/Header';
import SearchHeader from '../components/SearchHeader';
import SearchFilters from '../components/SearchFilters';
import HotelCard from '../components/HotelCard';
import Footer from '../components/Footer';
import { searchHotels } from '../api/hotelApi';
import './style/SearchResults.scss';

// 더 많은 호텔 데이터 (도시별, 날짜별 다양성 추가)
export const allHotelsData = [
  // 서울 호텔들
  {
    id: 1,
    name: '해튼호텔',
    price: 240000,
    address: '강남구 테헤란로 152, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 20,
    reviewScore: 4.2,
    reviewText: 'Very Good',
    reviewCount: 371,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 9,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 2,
    name: '마제스틱 말라카 호텔',
    price: 120000,
    address: '중구 명동길 26, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 15,
    reviewScore: 4.2,
    reviewText: 'Very Good',
    reviewCount: 54,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 12,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  {
    id: 3,
    name: '카나델 리오 호텔',
    price: 130000,
    address: '종로구 세종대로 175, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 18,
    reviewScore: 4.2,
    reviewText: 'Very Good',
    reviewCount: 54,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 8,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 4,
    name: '베이뷰 호텔',
    price: 104000,
    address: '마포구 월드컵북로 396, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 16,
    reviewScore: 4.2,
    reviewText: 'Very Good',
    reviewCount: 54,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 10,
    freebies: { breakfast: false, parking: true, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  {
    id: 9,
    name: '서울 그랜드 호텔',
    price: 200000,
    address: '강남구 강남대로 396, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 22,
    reviewScore: 4.6,
    reviewText: 'Excellent',
    reviewCount: 289,
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
    imageCount: 18,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 10,
    name: '서울 스카이 호텔',
    price: 160000,
    address: '송파구 올림픽로 300, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 19,
    reviewScore: 4.4,
    reviewText: 'Very Good',
    reviewCount: 167,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    imageCount: 13,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 11,
    name: '서울 리버뷰 호텔',
    price: 140000,
    address: '용산구 한강대로 257, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 3,
    amenitiesCount: 14,
    reviewScore: 4.0,
    reviewText: 'Good',
    reviewCount: 98,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 11,
    freebies: { breakfast: false, parking: true, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  {
    id: 12,
    name: '서울 센트럴 호텔',
    price: 95000,
    address: '중구 을지로 281, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 3,
    amenitiesCount: 12,
    reviewScore: 3.8,
    reviewText: 'Good',
    reviewCount: 76,
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
    imageCount: 9,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  // 부산 호텔들
  {
    id: 5,
    name: '부산 그랜드 호텔',
    price: 180000,
    address: '해운대구 해운대해변로 264, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 22,
    reviewScore: 4.5,
    reviewText: 'Excellent',
    reviewCount: 128,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    imageCount: 15,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 6,
    name: '부산 베이뷰 리조트',
    price: 150000,
    address: '해운대구 달맞이길 72, 부산',
    destination: '부산, 대한민국',
    type: 'resort',
    starRating: 4,
    amenitiesCount: 18,
    reviewScore: 4.3,
    reviewText: 'Very Good',
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 11,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 13,
    name: '부산 오션뷰 호텔',
    price: 220000,
    address: '해운대구 해운대해변로 264, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 24,
    reviewScore: 4.7,
    reviewText: 'Excellent',
    reviewCount: 203,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 20,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 14,
    name: '부산 마린 호텔',
    price: 135000,
    address: '중구 중앙대로 26, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 17,
    reviewScore: 4.2,
    reviewText: 'Very Good',
    reviewCount: 112,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 14,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 15,
    name: '부산 비치 호텔',
    price: 110000,
    address: '해운대구 우동 1394, 부산',
    destination: '부산, 대한민국',
    type: 'motel',
    starRating: 3,
    amenitiesCount: 13,
    reviewScore: 3.9,
    reviewText: 'Good',
    reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 10,
    freebies: { breakfast: false, parking: true, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  {
    id: 16,
    name: '부산 센트럴 호텔',
    price: 90000,
    address: '동구 중앙대로 206, 부산',
    destination: '부산, 대한민국',
    type: 'motel',
    starRating: 2,
    amenitiesCount: 10,
    reviewScore: 3.5,
    reviewText: 'Fair',
    reviewCount: 45,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 8,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  // 도쿄 호텔들
  {
    id: 7,
    name: '도쿄 센트럴 호텔',
    price: 350000,
    address: 'Shibuya City, Shibuya, Tokyo',
    destination: '도쿄, 일본',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 25,
    reviewScore: 4.7,
    reviewText: 'Excellent',
    reviewCount: 245,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 20,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 8,
    name: '도쿄 스카이 호텔',
    price: 280000,
    address: 'Shinjuku City, Shinjuku, Tokyo',
    destination: '도쿄, 일본',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 20,
    reviewScore: 4.4,
    reviewText: 'Very Good',
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 14,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 17,
    name: '도쿄 타워 호텔',
    price: 320000,
    address: 'Minato City, Shiba, Tokyo',
    destination: '도쿄, 일본',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 23,
    reviewScore: 4.6,
    reviewText: 'Excellent',
    reviewCount: 198,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 19,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 18,
    name: '도쿄 가든 호텔',
    price: 250000,
    address: 'Chiyoda City, Marunouchi, Tokyo',
    destination: '도쿄, 일본',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 18,
    reviewScore: 4.3,
    reviewText: 'Very Good',
    reviewCount: 134,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 15,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 19,
    name: '도쿄 리버 호텔',
    price: 200000,
    address: 'Sumida City, Oshiage, Tokyo',
    destination: '도쿄, 일본',
    type: 'motel',
    starRating: 3,
    amenitiesCount: 15,
    reviewScore: 4.0,
    reviewText: 'Good',
    reviewCount: 87,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 12,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  {
    id: 20,
    name: '도쿄 스테이션 호텔',
    price: 180000,
    address: 'Chiyoda City, Marunouchi, Tokyo',
    destination: '도쿄, 일본',
    type: 'motel',
    starRating: 3,
    amenitiesCount: 13,
    reviewScore: 3.8,
    reviewText: 'Good',
    reviewCount: 65,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 10,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  // 추가 호텔 데이터
  {
    id: 21,
    name: '서울 프리미엄 모텔',
    price: 80000,
    address: '강남구 역삼동 123, 서울',
    destination: '서울, 대한민국',
    type: 'motel',
    starRating: 2,
    amenitiesCount: 8,
    reviewScore: 3.6,
    reviewText: 'Fair',
    reviewCount: 42,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 6,
    freebies: { breakfast: false, parking: true, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: false, aircon: true, fitness: false, pool: false },
  },
  {
    id: 22,
    name: '서울 리조트 파크',
    price: 300000,
    address: '강남구 테헤란로 456, 서울',
    destination: '서울, 대한민국',
    type: 'resort',
    starRating: 5,
    amenitiesCount: 28,
    reviewScore: 4.8,
    reviewText: 'Excellent',
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 22,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 23,
    name: '부산 모텔 스위트',
    price: 70000,
    address: '해운대구 우동 567, 부산',
    destination: '부산, 대한민국',
    type: 'motel',
    starRating: 2,
    amenitiesCount: 7,
    reviewScore: 3.4,
    reviewText: 'Fair',
    reviewCount: 38,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 5,
    freebies: { breakfast: false, parking: true, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: false, aircon: true, fitness: false, pool: false },
  },
  {
    id: 24,
    name: '부산 파라다이스 리조트',
    price: 280000,
    address: '해운대구 해운대해변로 789, 부산',
    destination: '부산, 대한민국',
    type: 'resort',
    starRating: 5,
    amenitiesCount: 30,
    reviewScore: 4.9,
    reviewText: 'Excellent',
    reviewCount: 456,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 25,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 25,
    name: '도쿄 모텔 센트럴',
    price: 120000,
    address: 'Shibuya City, Shibuya, Tokyo',
    destination: '도쿄, 일본',
    type: 'motel',
    starRating: 2,
    amenitiesCount: 9,
    reviewScore: 3.5,
    reviewText: 'Fair',
    reviewCount: 52,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 7,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: false, aircon: true, fitness: false, pool: false },
  },
  {
    id: 26,
    name: '도쿄 리조트 가든',
    price: 400000,
    address: 'Minato City, Shiba, Tokyo',
    destination: '도쿄, 일본',
    type: 'resort',
    starRating: 5,
    amenitiesCount: 32,
    reviewScore: 4.9,
    reviewText: 'Excellent',
    reviewCount: 389,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 28,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 27,
    name: '서울 럭셔리 호텔',
    price: 280000,
    address: '강남구 압구정로 321, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 26,
    reviewScore: 4.7,
    reviewText: 'Excellent',
    reviewCount: 267,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 21,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 28,
    name: '부산 시티 호텔',
    price: 125000,
    address: '중구 중앙대로 456, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 3,
    amenitiesCount: 16,
    reviewScore: 4.1,
    reviewText: 'Good',
    reviewCount: 94,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 12,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  {
    id: 29,
    name: '도쿄 비즈니스 호텔',
    price: 190000,
    address: 'Chiyoda City, Marunouchi, Tokyo',
    destination: '도쿄, 일본',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 19,
    reviewScore: 4.3,
    reviewText: 'Very Good',
    reviewCount: 143,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 16,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 30,
    name: '서울 에코 리조트',
    price: 260000,
    address: '강남구 논현로 654, 서울',
    destination: '서울, 대한민국',
    type: 'resort',
    starRating: 4,
    amenitiesCount: 24,
    reviewScore: 4.5,
    reviewText: 'Excellent',
    reviewCount: 201,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 19,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  // 평점 2점대 숙소들
  {
    id: 31,
    name: '서울 이코노미 모텔',
    price: 60000,
    address: '중구 을지로 100, 서울',
    destination: '서울, 대한민국',
    type: 'motel',
    starRating: 2,
    amenitiesCount: 6,
    reviewScore: 2.3,
    reviewText: 'Poor',
    reviewCount: 23,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 4,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: false, aircon: true, fitness: false, pool: false },
  },
  {
    id: 32,
    name: '부산 저가 호텔',
    price: 70000,
    address: '동구 중앙대로 100, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 2,
    amenitiesCount: 7,
    reviewScore: 2.5,
    reviewText: 'Fair',
    reviewCount: 31,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 5,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: false, aircon: true, fitness: false, pool: false },
  },
  {
    id: 33,
    name: '도쿄 저예산 호텔',
    price: 100000,
    address: 'Taito City, Asakusa, Tokyo',
    destination: '도쿄, 일본',
    type: 'hotel',
    starRating: 2,
    amenitiesCount: 8,
    reviewScore: 2.7,
    reviewText: 'Fair',
    reviewCount: 28,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 6,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: false, aircon: true, fitness: false, pool: false },
  },
  {
    id: 34,
    name: '서울 싸구려 모텔',
    price: 50000,
    address: '마포구 홍대입구로 50, 서울',
    destination: '서울, 대한민국',
    type: 'motel',
    starRating: 2,
    amenitiesCount: 5,
    reviewScore: 2.1,
    reviewText: 'Poor',
    reviewCount: 19,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 3,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: false, aircon: true, fitness: false, pool: false },
  },
  {
    id: 35,
    name: '부산 시티 모텔',
    price: 55000,
    address: '서구 구덕로 200, 부산',
    destination: '부산, 대한민국',
    type: 'motel',
    starRating: 2,
    amenitiesCount: 6,
    reviewScore: 2.4,
    reviewText: 'Poor',
    reviewCount: 25,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 4,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: false, aircon: true, fitness: false, pool: false },
  },
  // 평점 3점대 숙소들
  {
    id: 36,
    name: '서울 스탠다드 호텔',
    price: 85000,
    address: '종로구 종로 200, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 3,
    amenitiesCount: 11,
    reviewScore: 3.2,
    reviewText: 'Fair',
    reviewCount: 48,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 7,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  {
    id: 37,
    name: '부산 미드 호텔',
    price: 95000,
    address: '남구 용소로 150, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 3,
    amenitiesCount: 12,
    reviewScore: 3.4,
    reviewText: 'Fair',
    reviewCount: 52,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 8,
    freebies: { breakfast: false, parking: true, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  {
    id: 38,
    name: '도쿄 스탠다드 호텔',
    price: 150000,
    address: 'Toshima City, Ikebukuro, Tokyo',
    destination: '도쿄, 일본',
    type: 'hotel',
    starRating: 3,
    amenitiesCount: 13,
    reviewScore: 3.3,
    reviewText: 'Fair',
    reviewCount: 41,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 9,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  {
    id: 39,
    name: '서울 컴포트 모텔',
    price: 65000,
    address: '강서구 화곡로 300, 서울',
    destination: '서울, 대한민국',
    type: 'motel',
    starRating: 3,
    amenitiesCount: 9,
    reviewScore: 3.1,
    reviewText: 'Fair',
    reviewCount: 35,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 6,
    freebies: { breakfast: false, parking: true, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: false, aircon: true, fitness: false, pool: false },
  },
  {
    id: 40,
    name: '부산 코지 호텔',
    price: 88000,
    address: '북구 금곡대로 250, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 3,
    amenitiesCount: 10,
    reviewScore: 3.5,
    reviewText: 'Good',
    reviewCount: 44,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 7,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  {
    id: 41,
    name: '도쿄 비즈니스 모텔',
    price: 110000,
    address: 'Shinjuku City, Okubo, Tokyo',
    destination: '도쿄, 일본',
    type: 'motel',
    starRating: 3,
    amenitiesCount: 11,
    reviewScore: 3.6,
    reviewText: 'Good',
    reviewCount: 38,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 8,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: false, aircon: true, fitness: false, pool: false },
  },
  {
    id: 42,
    name: '서울 가든 호텔',
    price: 105000,
    address: '서초구 서초대로 400, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 3,
    amenitiesCount: 14,
    reviewScore: 3.7,
    reviewText: 'Good',
    reviewCount: 56,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 10,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  {
    id: 43,
    name: '부산 리버 호텔',
    price: 98000,
    address: '사하구 낙동대로 500, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 3,
    amenitiesCount: 13,
    reviewScore: 3.8,
    reviewText: 'Good',
    reviewCount: 51,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 9,
    freebies: { breakfast: false, parking: true, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  // 오사카 호텔들
  {
    id: 44,
    name: '오사카 센트럴 호텔',
    price: 200000,
    address: 'Chuo Ward, Namba, Osaka',
    destination: '오사카, 일본',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 18,
    reviewScore: 4.3,
    reviewText: 'Very Good',
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 15,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 45,
    name: '오사카 스카이 호텔',
    price: 180000,
    address: 'Kita Ward, Umeda, Osaka',
    destination: '오사카, 일본',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 17,
    reviewScore: 4.2,
    reviewText: 'Very Good',
    reviewCount: 134,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 13,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 46,
    name: '오사카 리조트',
    price: 300000,
    address: 'Minato Ward, Tempozan, Osaka',
    destination: '오사카, 일본',
    type: 'resort',
    starRating: 5,
    amenitiesCount: 26,
    reviewScore: 4.6,
    reviewText: 'Excellent',
    reviewCount: 223,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 20,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 47,
    name: '오사카 비즈니스 호텔',
    price: 150000,
    address: 'Naniwa Ward, Nipponbashi, Osaka',
    destination: '오사카, 일본',
    type: 'hotel',
    starRating: 3,
    amenitiesCount: 14,
    reviewScore: 3.9,
    reviewText: 'Good',
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 11,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  {
    id: 48,
    name: '오사카 모텔',
    price: 100000,
    address: 'Nishi Ward, Honmachi, Osaka',
    destination: '오사카, 일본',
    type: 'motel',
    starRating: 2,
    amenitiesCount: 8,
    reviewScore: 3.2,
    reviewText: 'Fair',
    reviewCount: 45,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 6,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: false, aircon: true, fitness: false, pool: false },
  },
  // 파리 호텔들
  {
    id: 49,
    name: '파리 센트럴 호텔',
    price: 320000,
    address: '1st arrondissement, Louvre, Paris',
    destination: '파리, 프랑스',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 24,
    reviewScore: 4.7,
    reviewText: 'Excellent',
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 22,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 50,
    name: '파리 에펠탑 호텔',
    price: 350000,
    address: '7th arrondissement, Eiffel Tower, Paris',
    destination: '파리, 프랑스',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 27,
    reviewScore: 4.8,
    reviewText: 'Excellent',
    reviewCount: 456,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 25,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 51,
    name: '파리 샹젤리제 호텔',
    price: 280000,
    address: '8th arrondissement, Champs-Élysées, Paris',
    destination: '파리, 프랑스',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 20,
    reviewScore: 4.4,
    reviewText: 'Very Good',
    reviewCount: 198,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 17,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 52,
    name: '파리 몽마르트 호텔',
    price: 220000,
    address: '18th arrondissement, Montmartre, Paris',
    destination: '파리, 프랑스',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 18,
    reviewScore: 4.3,
    reviewText: 'Very Good',
    reviewCount: 167,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 14,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  {
    id: 53,
    name: '파리 리조트',
    price: 400000,
    address: '16th arrondissement, Trocadéro, Paris',
    destination: '파리, 프랑스',
    type: 'resort',
    starRating: 5,
    amenitiesCount: 30,
    reviewScore: 4.9,
    reviewText: 'Excellent',
    reviewCount: 389,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 28,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 54,
    name: '파리 모텔',
    price: 150000,
    address: '11th arrondissement, Bastille, Paris',
    destination: '파리, 프랑스',
    type: 'motel',
    starRating: 3,
    amenitiesCount: 12,
    reviewScore: 3.7,
    reviewText: 'Good',
    reviewCount: 78,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 9,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: false, aircon: true, fitness: false, pool: false },
  },
  // 런던 호텔들
  {
    id: 55,
    name: '런던 센트럴 호텔',
    price: 300000,
    address: 'Westminster, London',
    destination: '런던, 영국',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 25,
    reviewScore: 4.6,
    reviewText: 'Excellent',
    reviewCount: 278,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 21,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 56,
    name: '런던 빅벤 호텔',
    price: 320000,
    address: 'City of Westminster, Big Ben, London',
    destination: '런던, 영국',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 26,
    reviewScore: 4.7,
    reviewText: 'Excellent',
    reviewCount: 334,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 23,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 57,
    name: '런던 타워 호텔',
    price: 280000,
    address: 'Tower Hamlets, Tower Bridge, London',
    destination: '런던, 영국',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 21,
    reviewScore: 4.5,
    reviewText: 'Excellent',
    reviewCount: 245,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 18,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 58,
    name: '런던 리조트',
    price: 380000,
    address: 'Kensington and Chelsea, Hyde Park, London',
    destination: '런던, 영국',
    type: 'resort',
    starRating: 5,
    amenitiesCount: 29,
    reviewScore: 4.8,
    reviewText: 'Excellent',
    reviewCount: 412,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 26,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 59,
    name: '런던 모텔',
    price: 180000,
    address: 'Camden, King\'s Cross, London',
    destination: '런던, 영국',
    type: 'motel',
    starRating: 3,
    amenitiesCount: 13,
    reviewScore: 3.8,
    reviewText: 'Good',
    reviewCount: 92,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 10,
    freebies: { breakfast: false, parking: false, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  // 뉴욕 호텔들
  {
    id: 60,
    name: '뉴욕 센트럴 호텔',
    price: 350000,
    address: 'Manhattan, Times Square, New York',
    destination: '뉴욕, 미국',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 26,
    reviewScore: 4.7,
    reviewText: 'Excellent',
    reviewCount: 445,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 24,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 61,
    name: '뉴욕 스카이 호텔',
    price: 400000,
    address: 'Manhattan, Central Park, New York',
    destination: '뉴욕, 미국',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 28,
    reviewScore: 4.8,
    reviewText: 'Excellent',
    reviewCount: 523,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 27,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 62,
    name: '뉴욕 리버뷰 호텔',
    price: 320000,
    address: 'Manhattan, Brooklyn Bridge, New York',
    destination: '뉴욕, 미국',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 22,
    reviewScore: 4.5,
    reviewText: 'Excellent',
    reviewCount: 289,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 19,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 63,
    name: '뉴욕 리조트',
    price: 450000,
    address: 'Manhattan, Upper East Side, New York',
    destination: '뉴욕, 미국',
    type: 'resort',
    starRating: 5,
    amenitiesCount: 31,
    reviewScore: 4.9,
    reviewText: 'Excellent',
    reviewCount: 467,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 29,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 64,
    name: '뉴욕 모텔',
    price: 200000,
    address: 'Queens, Long Island City, New York',
    destination: '뉴욕, 미국',
    type: 'motel',
    starRating: 3,
    amenitiesCount: 14,
    reviewScore: 3.9,
    reviewText: 'Good',
    reviewCount: 112,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 11,
    freebies: { breakfast: false, parking: true, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
  // 멜버른 호텔들
  {
    id: 65,
    name: '멜버른 센트럴 호텔',
    price: 250000,
    address: 'Melbourne CBD, Victoria, Melbourne',
    destination: '멜버른, 호주',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 23,
    reviewScore: 4.6,
    reviewText: 'Excellent',
    reviewCount: 267,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 20,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 66,
    name: '멜버른 베이뷰 호텔',
    price: 280000,
    address: 'St Kilda, Port Phillip Bay, Melbourne',
    destination: '멜버른, 호주',
    type: 'hotel',
    starRating: 5,
    amenitiesCount: 25,
    reviewScore: 4.7,
    reviewText: 'Excellent',
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 22,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 67,
    name: '멜버른 리조트',
    price: 320000,
    address: 'Yarra Valley, Dandenong Ranges, Melbourne',
    destination: '멜버른, 호주',
    type: 'resort',
    starRating: 5,
    amenitiesCount: 28,
    reviewScore: 4.8,
    reviewText: 'Excellent',
    reviewCount: 356,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 25,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 68,
    name: '멜버른 비즈니스 호텔',
    price: 200000,
    address: 'Southbank, Melbourne',
    destination: '멜버른, 호주',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 19,
    reviewScore: 4.3,
    reviewText: 'Very Good',
    reviewCount: 178,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 15,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 69,
    name: '멜버른 모텔',
    price: 150000,
    address: 'Fitzroy, Melbourne',
    destination: '멜버른, 호주',
    type: 'motel',
    starRating: 3,
    amenitiesCount: 12,
    reviewScore: 3.8,
    reviewText: 'Good',
    reviewCount: 87,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 9,
    freebies: { breakfast: false, parking: true, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: false, aircon: true, fitness: false, pool: false },
  },
  // 콜롬비아 호텔들
  {
    id: 70,
    name: '콜롬비아 센트럴 호텔',
    price: 180000,
    address: 'La Candelaria, Bogotá, Colombia',
    destination: '콜롬비아, 콜롬비아',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 20,
    reviewScore: 4.4,
    reviewText: 'Very Good',
    reviewCount: 189,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    imageCount: 16,
    freebies: { breakfast: true, parking: false, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: false },
  },
  {
    id: 71,
    name: '콜롬비아 리조트',
    price: 280000,
    address: 'Cartagena, Caribbean Coast, Colombia',
    destination: '콜롬비아, 콜롬비아',
    type: 'resort',
    starRating: 5,
    amenitiesCount: 27,
    reviewScore: 4.7,
    reviewText: 'Excellent',
    reviewCount: 298,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    imageCount: 24,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: true, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 72,
    name: '콜롬비아 비치 호텔',
    price: 220000,
    address: 'Santa Marta, Caribbean Coast, Colombia',
    destination: '콜롬비아, 콜롬비아',
    type: 'hotel',
    starRating: 4,
    amenitiesCount: 21,
    reviewScore: 4.5,
    reviewText: 'Excellent',
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    imageCount: 18,
    freebies: { breakfast: true, parking: true, wifi: true, shuttle: false, cancellation: true },
    amenities: { frontDesk: true, aircon: true, fitness: true, pool: true },
  },
  {
    id: 73,
    name: '콜롬비아 모텔',
    price: 120000,
    address: 'Medellín, Antioquia, Colombia',
    destination: '콜롬비아, 콜롬비아',
    type: 'motel',
    starRating: 3,
    amenitiesCount: 13,
    reviewScore: 3.9,
    reviewText: 'Good',
    reviewCount: 98,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    imageCount: 10,
    freebies: { breakfast: false, parking: true, wifi: true, shuttle: false, cancellation: false },
    amenities: { frontDesk: true, aircon: true, fitness: false, pool: false },
  },
];

// DB 데이터를 프론트엔드 형식으로 변환하는 함수
const mapLodgingToHotel = (lodging) => {
  // category를 type으로 변환 (한국어 → 영어)
  const categoryToType = {
    '호텔': 'hotel',
    '모텔': 'motel',
    '리조트': 'resort',
    '게스트하우스': 'hotel',
    '에어비앤비': 'hotel'
  };
  
  // address에서 도시 추출
  const extractCity = (address) => {
    if (!address) return '서울';
    const addressLower = address.toLowerCase();
    if (addressLower.includes('서울')) return '서울';
    if (addressLower.includes('부산')) return '부산';
    if (addressLower.includes('도쿄') || addressLower.includes('tokyo')) return '도쿄';
    if (addressLower.includes('오사카') || addressLower.includes('osaka')) return '오사카';
    if (addressLower.includes('파리') || addressLower.includes('paris')) return '파리';
    if (addressLower.includes('런던') || addressLower.includes('london')) return '런던';
    if (addressLower.includes('뉴욕') || addressLower.includes('new york')) return '뉴욕';
    if (addressLower.includes('멜버른') || addressLower.includes('melbourne')) return '멜버른';
    if (addressLower.includes('콜롬비아') || addressLower.includes('colombia')) return '콜롬비아';
    return '서울'; // 기본값
  };
  
  // 평점에 따른 reviewText 생성
  const getReviewText = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Fair';
    return 'Poor';
  };
  
  const city = extractCity(lodging.address);
  const destination = `${city}, ${lodging.country}`;
  
  return {
    id: lodging._id.toString(),
    name: lodging.lodgingName,
    price: lodging.minPrice || 0,
    address: lodging.address,
    destination: destination,
    type: categoryToType[lodging.category] || 'hotel',
    starRating: lodging.starRating || 3,
    reviewScore: lodging.rating || 0,
    reviewCount: lodging.reviewCount || 0,
    reviewText: getReviewText(lodging.rating || 0),
    image: lodging.images?.[0] || '',
    imageCount: lodging.images?.length || 0,
    amenitiesCount: 10, // 기본값
  };
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('Recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    priceRange: [50000, 1200000],
    selectedRating: null,
  });

  // URL 쿼리 파라미터에서 검색 값 읽기
  const destination = searchParams.get('destination') || '서울, 대한민국';
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  // DB에서 호텔 데이터 가져오기
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await searchHotels({
          loc: destination.split(',')[0].trim(), // 도시만 추출
          checkIn,
          checkOut,
        });
        
        // API 응답 구조: { data: [...], message: "...", resultCode: 200, success: true }
        const lodgings = response?.data || [];
        
        // DB 데이터를 프론트엔드 형식으로 변환
        const mappedHotels = lodgings.map(mapLodgingToHotel);
        setHotels(mappedHotels);
      } catch (error) {
        console.error('호텔 데이터 로딩 실패:', error);
        // 에러 발생 시 빈 배열
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotels();
  }, [destination, checkIn, checkOut]);

  // 필터 옵션 변경 핸들러 (useCallback으로 메모이제이션하여 무한 루프 방지)
  const handleFilterChange = useCallback((filters) => {
    setFilterOptions(filters);
  }, []);

  // 검색 조건에 따라 호텔 필터링
  const filteredHotels = useMemo(() => {
    let filtered = [...hotels];

    // 탭별 필터링 (All, Hotels, Motels, Resorts)
    if (activeTab !== 'All') {
      filtered = filtered.filter((hotel) => {
        if (activeTab === 'Hotels') {
          return hotel.type === 'hotel' || !hotel.type;
        } else if (activeTab === 'Motels') {
          return hotel.type === 'motel';
        } else if (activeTab === 'Resorts') {
          return hotel.type === 'resort';
        }
        return true;
      });
    }

    // 도시별 필터링
    if (destination) {
      const destinationCity = destination.toLowerCase().split(',')[0].trim();
      filtered = filtered.filter((hotel) => {
        // 도시 이름이 포함되어 있는지 확인
        const hotelCity = hotel.destination.toLowerCase().split(',')[0].trim();
        return hotelCity.includes(destinationCity) || destinationCity.includes(hotelCity);
      });
    }

    // 날짜별 가격 변동 (시뮬레이션)
    if (checkIn && checkOut) {
      const checkInDate = parseISO(checkIn);
      const checkOutDate = parseISO(checkOut);
      const nights = differenceInDays(checkOutDate, checkInDate);
      
      // 날짜에 따라 가격 조정 (주말, 성수기 등 시뮬레이션)
      filtered = filtered.map((hotel) => {
        let adjustedPrice = hotel.price;
        const dayOfWeek = checkInDate.getDay();
        
        // 주말 가격 증가 (금, 토, 일)
        if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
          adjustedPrice = Math.round(hotel.price * 1.2);
        }
        
        // 장기 체류 할인 (3박 이상)
        if (nights >= 3) {
          adjustedPrice = Math.round(adjustedPrice * 0.9);
        }
        
        return {
          ...hotel,
          price: adjustedPrice,
          nights,
        };
      });
    }

    // 가격 범위 필터링
    filtered = filtered.filter((hotel) => {
      return hotel.price >= filterOptions.priceRange[0] && hotel.price <= filterOptions.priceRange[1];
    });

    // 별점 필터링
    if (filterOptions.selectedRating !== null && filterOptions.selectedRating !== undefined) {
      filtered = filtered.filter((hotel) => hotel.starRating >= filterOptions.selectedRating);
    }

    // 정렬
    switch (sortBy) {
      case 'Price Low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'Price High':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'Rating':
        filtered.sort((a, b) => b.reviewScore - a.reviewScore);
        break;
      default:
        // Recommended: 기본 정렬
        break;
    }

    return filtered;
  }, [hotels, destination, checkIn, checkOut, sortBy, filterOptions, activeTab]);

  // 필터 옵션을 적용한 결과 (타입 필터링 제외) - 탭 개수 계산용
  const filteredHotelsForCounts = useMemo(() => {
    let filtered = [...hotels];

    // 도시별 필터링
    if (destination) {
      const destinationCity = destination.toLowerCase().split(',')[0].trim();
      filtered = filtered.filter((hotel) => {
        const hotelCity = hotel.destination.toLowerCase().split(',')[0].trim();
        return hotelCity.includes(destinationCity) || destinationCity.includes(hotelCity);
      });
    }

    // 날짜별 가격 변동 (시뮬레이션)
    if (checkIn && checkOut) {
      const checkInDate = parseISO(checkIn);
      const checkOutDate = parseISO(checkOut);
      const nights = differenceInDays(checkOutDate, checkInDate);
      
      filtered = filtered.map((hotel) => {
        let adjustedPrice = hotel.price;
        const dayOfWeek = checkInDate.getDay();
        
        if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
          adjustedPrice = Math.round(hotel.price * 1.2);
        }
        
        if (nights >= 3) {
          adjustedPrice = Math.round(adjustedPrice * 0.9);
        }
        
        return {
          ...hotel,
          price: adjustedPrice,
          nights,
        };
      });
    }

    // 가격 범위 필터링
    filtered = filtered.filter((hotel) => {
      return hotel.price >= filterOptions.priceRange[0] && hotel.price <= filterOptions.priceRange[1];
    });

    // 별점 필터링
    if (filterOptions.selectedRating !== null && filterOptions.selectedRating !== undefined) {
      filtered = filtered.filter((hotel) => hotel.starRating >= filterOptions.selectedRating);
    }

    return filtered;
  }, [hotels, destination, checkIn, checkOut, filterOptions]);

  // 탭별 개수 계산 (필터 옵션 적용 후)
  const getTabCounts = useMemo(() => {
    const all = filteredHotelsForCounts.length;
    const hotels = filteredHotelsForCounts.filter((h) => h.type === 'hotel' || !h.type).length;
    const motels = filteredHotelsForCounts.filter((h) => h.type === 'motel').length;
    const resorts = filteredHotelsForCounts.filter((h) => h.type === 'resort').length;
    return { all, hotels, motels, resorts };
  }, [filteredHotelsForCounts]);

  const tabs = [
    { id: 'All', label: 'All', count: getTabCounts.all },
    { id: 'Hotels', label: 'Hotels', count: getTabCounts.hotels },
    { id: 'Motels', label: 'Motels', count: getTabCounts.motels },
    { id: 'Resorts', label: 'Resorts', count: getTabCounts.resorts },
  ];

  const getTotalCount = () => {
    return filteredHotels.length;
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHotels = filteredHotels.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 검색 조건이 변경되면 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [destination, checkIn, checkOut, activeTab, filterOptions]);

  return (
    <div className="search-results-page">
      <Header />
      <SearchHeader />
      <div className="search-results-container">
        <aside className="filters-sidebar">
          <SearchFilters onFilterChange={handleFilterChange} />
        </aside>
        <main className="results-main">
          <div className="results-header">
            <div className="tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  <span className="tab-count">({tab.count}개)</span>
                </button>
              ))}
            </div>
            <div className="results-controls">
              <span className="results-count">
                {getTotalCount()}개 중 {currentHotels.length}개 표시
              </span>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Recommended">추천순</option>
                <option value="Price Low">가격: 낮은 순</option>
                <option value="Price High">가격: 높은 순</option>
                <option value="Rating">평점순</option>
              </select>
            </div>
          </div>
          <div className="hotels-list">
            {loading ? (
              <div className="loading">
                <p>호텔 데이터를 불러오는 중...</p>
              </div>
            ) : filteredHotels.length > 0 ? (
              currentHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))
            ) : (
              <div className="no-results">
                <p>검색 결과가 없습니다.</p>
                <p>다른 검색 조건으로 시도해보세요.</p>
              </div>
            )}
          </div>
          {filteredHotels.length > 0 && totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                aria-label="이전 페이지"
              >
                &lt;
              </button>
              <span className="pagination-info">
                {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                aria-label="다음 페이지"
              >
                &gt;
              </button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;

