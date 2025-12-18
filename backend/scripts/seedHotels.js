const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../src/config/db');

// 하드코딩된 호텔 데이터 (SearchResults.jsx에서 복사)
const allHotelsData = [
  // 서울 호텔들
  {
    id: 1,
    name: '해튼호텔',
    price: 240000,
    address: '강남구 테헤란로 152, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 5,
    reviewScore: 4.2,
    reviewCount: 371,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: '마제스틱 말라카 호텔',
    price: 120000,
    address: '중구 명동길 26, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 5,
    reviewScore: 4.2,
    reviewCount: 54,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: '카나델 리오 호텔',
    price: 130000,
    address: '종로구 세종대로 175, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 5,
    reviewScore: 4.2,
    reviewCount: 54,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: '베이뷰 호텔',
    price: 104000,
    address: '마포구 월드컵북로 396, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 5,
    reviewScore: 4.2,
    reviewCount: 54,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 9,
    name: '서울 그랜드 호텔',
    price: 200000,
    address: '강남구 강남대로 396, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 4,
    reviewScore: 4.6,
    reviewCount: 289,
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 10,
    name: '서울 스카이 호텔',
    price: 160000,
    address: '송파구 올림픽로 300, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 4,
    reviewScore: 4.4,
    reviewCount: 167,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 11,
    name: '서울 리버뷰 호텔',
    price: 140000,
    address: '용산구 한강대로 257, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 3,
    reviewScore: 4.0,
    reviewCount: 98,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 12,
    name: '서울 센트럴 호텔',
    price: 95000,
    address: '중구 을지로 281, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 3,
    reviewScore: 3.8,
    reviewCount: 76,
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
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
    reviewScore: 4.5,
    reviewCount: 128,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6,
    name: '부산 베이뷰 리조트',
    price: 150000,
    address: '해운대구 달맞이길 72, 부산',
    destination: '부산, 대한민국',
    type: 'resort',
    starRating: 4,
    reviewScore: 4.3,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 13,
    name: '부산 오션뷰 호텔',
    price: 220000,
    address: '해운대구 해운대해변로 264, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 5,
    reviewScore: 4.7,
    reviewCount: 203,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 14,
    name: '부산 마린 호텔',
    price: 135000,
    address: '중구 중앙대로 26, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 4,
    reviewScore: 4.2,
    reviewCount: 112,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 15,
    name: '부산 비치 호텔',
    price: 110000,
    address: '해운대구 우동 1394, 부산',
    destination: '부산, 대한민국',
    type: 'motel',
    starRating: 3,
    reviewScore: 3.9,
    reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 16,
    name: '부산 센트럴 호텔',
    price: 90000,
    address: '동구 중앙대로 206, 부산',
    destination: '부산, 대한민국',
    type: 'motel',
    starRating: 2,
    reviewScore: 3.5,
    reviewCount: 45,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
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
    reviewScore: 4.7,
    reviewCount: 245,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 8,
    name: '도쿄 스카이 호텔',
    price: 280000,
    address: 'Shinjuku City, Shinjuku, Tokyo',
    destination: '도쿄, 일본',
    type: 'hotel',
    starRating: 4,
    reviewScore: 4.4,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 17,
    name: '도쿄 타워 호텔',
    price: 320000,
    address: 'Minato City, Shiba, Tokyo',
    destination: '도쿄, 일본',
    type: 'hotel',
    starRating: 5,
    reviewScore: 4.6,
    reviewCount: 198,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 18,
    name: '도쿄 가든 호텔',
    price: 250000,
    address: 'Chiyoda City, Marunouchi, Tokyo',
    destination: '도쿄, 일본',
    type: 'hotel',
    starRating: 4,
    reviewScore: 4.3,
    reviewCount: 134,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 19,
    name: '도쿄 리버 호텔',
    price: 200000,
    address: 'Sumida City, Oshiage, Tokyo',
    destination: '도쿄, 일본',
    type: 'motel',
    starRating: 3,
    reviewScore: 4.0,
    reviewCount: 87,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 20,
    name: '도쿄 스테이션 호텔',
    price: 180000,
    address: 'Chiyoda City, Marunouchi, Tokyo',
    destination: '도쿄, 일본',
    type: 'motel',
    starRating: 3,
    reviewScore: 3.8,
    reviewCount: 65,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
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
    reviewScore: 3.6,
    reviewCount: 42,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 22,
    name: '서울 리조트 파크',
    price: 300000,
    address: '강남구 테헤란로 456, 서울',
    destination: '서울, 대한민국',
    type: 'resort',
    starRating: 5,
    reviewScore: 4.8,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 23,
    name: '부산 모텔 스위트',
    price: 70000,
    address: '해운대구 우동 567, 부산',
    destination: '부산, 대한민국',
    type: 'motel',
    starRating: 2,
    reviewScore: 3.4,
    reviewCount: 38,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 24,
    name: '부산 파라다이스 리조트',
    price: 280000,
    address: '해운대구 해운대해변로 789, 부산',
    destination: '부산, 대한민국',
    type: 'resort',
    starRating: 5,
    reviewScore: 4.9,
    reviewCount: 456,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 25,
    name: '도쿄 모텔 센트럴',
    price: 120000,
    address: 'Shibuya City, Shibuya, Tokyo',
    destination: '도쿄, 일본',
    type: 'motel',
    starRating: 2,
    reviewScore: 3.5,
    reviewCount: 52,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 26,
    name: '도쿄 리조트 가든',
    price: 400000,
    address: 'Minato City, Shiba, Tokyo',
    destination: '도쿄, 일본',
    type: 'resort',
    starRating: 5,
    reviewScore: 4.9,
    reviewCount: 389,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 27,
    name: '서울 럭셔리 호텔',
    price: 280000,
    address: '강남구 압구정로 321, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 5,
    reviewScore: 4.7,
    reviewCount: 267,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 28,
    name: '부산 시티 호텔',
    price: 125000,
    address: '중구 중앙대로 456, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 3,
    reviewScore: 4.1,
    reviewCount: 94,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 29,
    name: '도쿄 비즈니스 호텔',
    price: 190000,
    address: 'Chiyoda City, Marunouchi, Tokyo',
    destination: '도쿄, 일본',
    type: 'hotel',
    starRating: 4,
    reviewScore: 4.3,
    reviewCount: 143,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 30,
    name: '서울 에코 리조트',
    price: 260000,
    address: '강남구 논현로 654, 서울',
    destination: '서울, 대한민국',
    type: 'resort',
    starRating: 4,
    reviewScore: 4.5,
    reviewCount: 201,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
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
    reviewScore: 2.3,
    reviewCount: 23,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 32,
    name: '부산 저가 호텔',
    price: 70000,
    address: '동구 중앙대로 100, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 2,
    reviewScore: 2.5,
    reviewCount: 31,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 33,
    name: '도쿄 저예산 호텔',
    price: 100000,
    address: 'Taito City, Asakusa, Tokyo',
    destination: '도쿄, 일본',
    type: 'hotel',
    starRating: 2,
    reviewScore: 2.7,
    reviewCount: 28,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 34,
    name: '서울 싸구려 모텔',
    price: 50000,
    address: '마포구 홍대입구로 50, 서울',
    destination: '서울, 대한민국',
    type: 'motel',
    starRating: 2,
    reviewScore: 2.1,
    reviewCount: 19,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 35,
    name: '부산 시티 모텔',
    price: 55000,
    address: '서구 구덕로 200, 부산',
    destination: '부산, 대한민국',
    type: 'motel',
    starRating: 2,
    reviewScore: 2.4,
    reviewCount: 25,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
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
    reviewScore: 3.2,
    reviewCount: 48,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 37,
    name: '부산 미드 호텔',
    price: 95000,
    address: '남구 용소로 150, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 3,
    reviewScore: 3.4,
    reviewCount: 52,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 38,
    name: '도쿄 스탠다드 호텔',
    price: 150000,
    address: 'Toshima City, Ikebukuro, Tokyo',
    destination: '도쿄, 일본',
    type: 'hotel',
    starRating: 3,
    reviewScore: 3.3,
    reviewCount: 41,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 39,
    name: '서울 컴포트 모텔',
    price: 65000,
    address: '강서구 화곡로 300, 서울',
    destination: '서울, 대한민국',
    type: 'motel',
    starRating: 3,
    reviewScore: 3.1,
    reviewCount: 35,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 40,
    name: '부산 코지 호텔',
    price: 88000,
    address: '북구 금곡대로 250, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 3,
    reviewScore: 3.5,
    reviewCount: 44,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 41,
    name: '도쿄 비즈니스 모텔',
    price: 110000,
    address: 'Shinjuku City, Okubo, Tokyo',
    destination: '도쿄, 일본',
    type: 'motel',
    starRating: 3,
    reviewScore: 3.6,
    reviewCount: 38,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 42,
    name: '서울 가든 호텔',
    price: 105000,
    address: '서초구 서초대로 400, 서울',
    destination: '서울, 대한민국',
    type: 'hotel',
    starRating: 3,
    reviewScore: 3.7,
    reviewCount: 56,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 43,
    name: '부산 리버 호텔',
    price: 98000,
    address: '사하구 낙동대로 500, 부산',
    destination: '부산, 대한민국',
    type: 'hotel',
    starRating: 3,
    reviewScore: 3.8,
    reviewCount: 51,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
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
    reviewScore: 4.3,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 45,
    name: '오사카 스카이 호텔',
    price: 180000,
    address: 'Kita Ward, Umeda, Osaka',
    destination: '오사카, 일본',
    type: 'hotel',
    starRating: 4,
    reviewScore: 4.2,
    reviewCount: 134,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 46,
    name: '오사카 리조트',
    price: 300000,
    address: 'Minato Ward, Tempozan, Osaka',
    destination: '오사카, 일본',
    type: 'resort',
    starRating: 5,
    reviewScore: 4.6,
    reviewCount: 223,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 47,
    name: '오사카 비즈니스 호텔',
    price: 150000,
    address: 'Naniwa Ward, Nipponbashi, Osaka',
    destination: '오사카, 일본',
    type: 'hotel',
    starRating: 3,
    reviewScore: 3.9,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 48,
    name: '오사카 모텔',
    price: 100000,
    address: 'Nishi Ward, Honmachi, Osaka',
    destination: '오사카, 일본',
    type: 'motel',
    starRating: 2,
    reviewScore: 3.2,
    reviewCount: 45,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
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
    reviewScore: 4.7,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 50,
    name: '파리 에펠탑 호텔',
    price: 350000,
    address: '7th arrondissement, Eiffel Tower, Paris',
    destination: '파리, 프랑스',
    type: 'hotel',
    starRating: 5,
    reviewScore: 4.8,
    reviewCount: 456,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 51,
    name: '파리 샹젤리제 호텔',
    price: 280000,
    address: '8th arrondissement, Champs-Élysées, Paris',
    destination: '파리, 프랑스',
    type: 'hotel',
    starRating: 4,
    reviewScore: 4.4,
    reviewCount: 198,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 52,
    name: '파리 몽마르트 호텔',
    price: 220000,
    address: '18th arrondissement, Montmartre, Paris',
    destination: '파리, 프랑스',
    type: 'hotel',
    starRating: 4,
    reviewScore: 4.3,
    reviewCount: 167,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 53,
    name: '파리 리조트',
    price: 400000,
    address: '16th arrondissement, Trocadéro, Paris',
    destination: '파리, 프랑스',
    type: 'resort',
    starRating: 5,
    reviewScore: 4.9,
    reviewCount: 389,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 54,
    name: '파리 모텔',
    price: 150000,
    address: '11th arrondissement, Bastille, Paris',
    destination: '파리, 프랑스',
    type: 'motel',
    starRating: 3,
    reviewScore: 3.7,
    reviewCount: 78,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
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
    reviewScore: 4.6,
    reviewCount: 278,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 56,
    name: '런던 빅벤 호텔',
    price: 320000,
    address: 'City of Westminster, Big Ben, London',
    destination: '런던, 영국',
    type: 'hotel',
    starRating: 5,
    reviewScore: 4.7,
    reviewCount: 334,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 57,
    name: '런던 타워 호텔',
    price: 280000,
    address: 'Tower Hamlets, Tower Bridge, London',
    destination: '런던, 영국',
    type: 'hotel',
    starRating: 4,
    reviewScore: 4.5,
    reviewCount: 245,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 58,
    name: '런던 리조트',
    price: 380000,
    address: 'Kensington and Chelsea, Hyde Park, London',
    destination: '런던, 영국',
    type: 'resort',
    starRating: 5,
    reviewScore: 4.8,
    reviewCount: 412,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 59,
    name: '런던 모텔',
    price: 180000,
    address: 'Camden, King\'s Cross, London',
    destination: '런던, 영국',
    type: 'motel',
    starRating: 3,
    reviewScore: 3.8,
    reviewCount: 92,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
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
    reviewScore: 4.7,
    reviewCount: 445,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 61,
    name: '뉴욕 스카이 호텔',
    price: 400000,
    address: 'Manhattan, Central Park, New York',
    destination: '뉴욕, 미국',
    type: 'hotel',
    starRating: 5,
    reviewScore: 4.8,
    reviewCount: 523,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 62,
    name: '뉴욕 리버뷰 호텔',
    price: 320000,
    address: 'Manhattan, Brooklyn Bridge, New York',
    destination: '뉴욕, 미국',
    type: 'hotel',
    starRating: 4,
    reviewScore: 4.5,
    reviewCount: 289,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 63,
    name: '뉴욕 리조트',
    price: 450000,
    address: 'Manhattan, Upper East Side, New York',
    destination: '뉴욕, 미국',
    type: 'resort',
    starRating: 5,
    reviewScore: 4.9,
    reviewCount: 467,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 64,
    name: '뉴욕 모텔',
    price: 200000,
    address: 'Queens, Long Island City, New York',
    destination: '뉴욕, 미국',
    type: 'motel',
    starRating: 3,
    reviewScore: 3.9,
    reviewCount: 112,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
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
    reviewScore: 4.6,
    reviewCount: 267,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 66,
    name: '멜버른 베이뷰 호텔',
    price: 280000,
    address: 'St Kilda, Port Phillip Bay, Melbourne',
    destination: '멜버른, 호주',
    type: 'hotel',
    starRating: 5,
    reviewScore: 4.7,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 67,
    name: '멜버른 리조트',
    price: 320000,
    address: 'Yarra Valley, Dandenong Ranges, Melbourne',
    destination: '멜버른, 호주',
    type: 'resort',
    starRating: 5,
    reviewScore: 4.8,
    reviewCount: 356,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 68,
    name: '멜버른 비즈니스 호텔',
    price: 200000,
    address: 'Southbank, Melbourne',
    destination: '멜버른, 호주',
    type: 'hotel',
    starRating: 4,
    reviewScore: 4.3,
    reviewCount: 178,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 69,
    name: '멜버른 모텔',
    price: 150000,
    address: 'Fitzroy, Melbourne',
    destination: '멜버른, 호주',
    type: 'motel',
    starRating: 3,
    reviewScore: 3.8,
    reviewCount: 87,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
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
    reviewScore: 4.4,
    reviewCount: 189,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 71,
    name: '콜롬비아 리조트',
    price: 280000,
    address: 'Cartagena, Caribbean Coast, Colombia',
    destination: '콜롬비아, 콜롬비아',
    type: 'resort',
    starRating: 5,
    reviewScore: 4.7,
    reviewCount: 298,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 72,
    name: '콜롬비아 비치 호텔',
    price: 220000,
    address: 'Santa Marta, Caribbean Coast, Colombia',
    destination: '콜롬비아, 콜롬비아',
    type: 'hotel',
    starRating: 4,
    reviewScore: 4.5,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 73,
    name: '콜롬비아 모텔',
    price: 120000,
    address: 'Medellín, Antioquia, Colombia',
    destination: '콜롬비아, 콜롬비아',
    type: 'motel',
    starRating: 3,
    reviewScore: 3.9,
    reviewCount: 98,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  },
];

// BusinessUser 스키마 (임시)
const businessUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: String,
  passwordHash: String,
  role: { type: String, default: 'business' },
  isActive: { type: Boolean, default: true },
  provider: { type: String, default: 'local' },
  businessNumber: String,
  failedLoginAttempts: { type: Number, default: 0 },
  businessName: String,
}, { timestamps: true });

const BusinessUser = mongoose.model('BusinessUser', businessUserSchema, 'businessusers');
const Lodging = require('../src/lodging/model');

// 랜덤 한국 이름 생성
const koreanNames = [
  '김철수', '이영희', '박민수', '정수진', '최영호', '강미영', '윤태영', '장혜진',
  '임동욱', '한지은', '오세훈', '신유진', '조성민', '배수진', '홍길동', '문지훈',
  '송미라', '유재석', '전지현', '이병헌', '김태희', '현빈', '손예진', '공유',
  '이민호', '박보영', '송혜교', '이동욱', '김소현', '박신혜', '이종석', '김고은',
  '강동원', '하정우', '조인성', '원빈', '장동건', '차승원', '정우성', '이정재',
  '김하늘', '전도연', '김혜수', '이영애', '수지', '아이유', '태연', '윤아',
  '김수현', '이민기', '공효진', '한지민', '김남주', '이서진', '조정석', '유아인'
];

// 랜덤 이메일 도메인
const emailDomains = ['gmail.com', 'naver.com', 'yahoo.co.kr', 'daum.net', 'hanmail.net'];

// 랜덤 사업자 생성 함수
const generateRandomBusiness = async () => {
  const name = koreanNames[Math.floor(Math.random() * koreanNames.length)];
  const randomNum = Math.floor(Math.random() * 100000);
  const email = `business${randomNum}@${emailDomains[Math.floor(Math.random() * emailDomains.length)]}`;
  
  // 전화번호 생성 (010-xxxx-xxxx)
  const phone1 = Math.floor(Math.random() * 9000) + 1000;
  const phone2 = Math.floor(Math.random() * 9000) + 1000;
  const phoneNumber = `010-${phone1}-${phone2}`;
  
  // 사업자번호 생성 (xxx-xx-xxxxx)
  const biz1 = Math.floor(Math.random() * 900) + 100;
  const biz2 = Math.floor(Math.random() * 90) + 10;
  const biz3 = Math.floor(Math.random() * 90000) + 10000;
  const businessNumber = `${biz1}-${biz2}-${biz3}`;
  
  // 비밀번호 해시 (기본 비밀번호: "password123")
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const businessUser = new BusinessUser({
    name,
    email,
    phoneNumber,
    passwordHash,
    role: 'business',
    isActive: true,
    provider: 'local',
    businessNumber,
    failedLoginAttempts: 0,
    businessName: name,
  });
  
  return await businessUser.save();
};

// 호텔 타입을 카테고리로 변환
const convertType = (type) => {
  const typeMap = {
    'hotel': '호텔',
    'motel': '모텔',
    'resort': '리조트',
  };
  return typeMap[type] || '호텔';
};

// destination에서 country 추출
const extractCountry = (destination) => {
  if (!destination) return '대한민국';
  const parts = destination.split(',');
  return parts.length > 1 ? parts[1].trim() : '대한민국';
};

// 주소에서 간단한 좌표 생성 (실제로는 Geocoding API 사용 권장)
const generateCoordinates = (address, destination) => {
  // 간단한 랜덤 좌표 생성 (실제로는 주소 기반 Geocoding 필요)
  let lat, lng;
  
  if (address.includes('서울') || destination.includes('서울')) {
    lat = 37.5 + Math.random() * 0.2;
    lng = 126.9 + Math.random() * 0.2;
  } else if (address.includes('부산') || destination.includes('부산')) {
    lat = 35.1 + Math.random() * 0.1;
    lng = 129.0 + Math.random() * 0.1;
  } else if (address.includes('도쿄') || address.includes('Tokyo') || destination.includes('도쿄')) {
    lat = 35.6 + Math.random() * 0.1;
    lng = 139.7 + Math.random() * 0.1;
  } else if (address.includes('오사카') || address.includes('Osaka') || destination.includes('오사카')) {
    lat = 34.6 + Math.random() * 0.1;
    lng = 135.5 + Math.random() * 0.1;
  } else if (address.includes('파리') || address.includes('Paris') || destination.includes('파리')) {
    lat = 48.8 + Math.random() * 0.1;
    lng = 2.3 + Math.random() * 0.1;
  } else if (address.includes('런던') || address.includes('London') || destination.includes('런던')) {
    lat = 51.5 + Math.random() * 0.1;
    lng = -0.1 + Math.random() * 0.1;
  } else if (address.includes('뉴욕') || address.includes('New York') || destination.includes('뉴욕')) {
    lat = 40.7 + Math.random() * 0.1;
    lng = -74.0 + Math.random() * 0.1;
  } else if (address.includes('멜버른') || address.includes('Melbourne') || destination.includes('멜버른')) {
    lat = -37.8 + Math.random() * 0.1;
    lng = 144.9 + Math.random() * 0.1;
  } else if (address.includes('콜롬비아') || address.includes('Colombia') || destination.includes('콜롬비아')) {
    lat = 4.6 + Math.random() * 0.1;
    lng = -74.0 + Math.random() * 0.1;
  } else {
    // 기본값 (서울)
    lat = 37.5 + Math.random() * 0.2;
    lng = 126.9 + Math.random() * 0.2;
  }
  
  return { lat: parseFloat(lat.toFixed(4)), lng: parseFloat(lng.toFixed(4)) };
};

// 호텔 데이터를 Lodging 형식으로 변환
const convertHotelToLodging = (hotel, businessId) => {
  const coords = generateCoordinates(hotel.address, hotel.destination);
  
  return {
    lodgingName: hotel.name,
    address: hotel.address,
    starRating: hotel.starRating,
    description: `${hotel.name}에서 편안하고 안락한 숙박을 경험하세요. 최고의 서비스와 편의시설을 제공합니다.`,
    images: hotel.image ? [hotel.image] : [],
    country: extractCountry(hotel.destination),
    category: convertType(hotel.type),
    hashtag: [],
    businessId: businessId,
    amenityId: null,
    lat: coords.lat,
    lng: coords.lng,
    rating: hotel.reviewScore || 0,
    reviewCount: hotel.reviewCount || 0,
    minPrice: hotel.price,
    maxGuests: 2 + Math.floor(Math.random() * 4), // 2~5명
    checkInTime: '15:00',
    checkOutTime: '11:00',
  };
};

// 메인 실행 함수
const seedHotels = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB 연결 완료');
    
    // 기존 데이터 확인
    const existingLodgings = await Lodging.countDocuments();
    const existingBusinessUsers = await BusinessUser.countDocuments();
    
    if (existingLodgings > 0 || existingBusinessUsers > 0) {
      console.log(`⚠️  기존 데이터가 있습니다:`);
      console.log(`   - 숙소: ${existingLodgings}개`);
      console.log(`   - 사업자: ${existingBusinessUsers}개`);
      console.log('   스크립트를 계속 실행합니다...\n');
    }
    
    const businessIds = [];
    const lodgings = [];
    
    console.log(`🔄 ${allHotelsData.length}개의 호텔 데이터 처리 중...\n`);
    
    // 각 호텔마다 랜덤 사업자 생성
    for (let i = 0; i < allHotelsData.length; i++) {
      const hotel = allHotelsData[i];
      
      // 랜덤 사업자 생성
      const businessUser = await generateRandomBusiness();
      businessIds.push(businessUser._id);
      
      // 호텔 데이터 변환
      const lodgingData = convertHotelToLodging(hotel, businessUser._id);
      lodgings.push(lodgingData);
      
      console.log(`✅ [${i + 1}/${allHotelsData.length}] ${hotel.name} - 사업자: ${businessUser.name} (${businessUser.email})`);
    }
    
    // Lodging 데이터 일괄 삽입
    console.log('\n🔄 숙소 데이터 삽입 중...');
    const insertedLodgings = await Lodging.insertMany(lodgings);
    
    console.log(`\n✅ 완료!`);
    console.log(`📊 생성된 사업자: ${businessIds.length}개`);
    console.log(`📊 생성된 숙소: ${insertedLodgings.length}개`);
    console.log(`\n💡 모든 사업자의 기본 비밀번호: password123`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// 스크립트 실행
seedHotels();

