const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../src/config/db');
const User = require('../src/auth/model');
const Review = require('../src/review/model');
const Booking = require('../src/booking/model');
const Room = require('../src/room/model');

// 리뷰 수를 100 이하의 랜덤 숫자로 생성하는 함수
const generateRandomReviewCount = () => {
  return Math.floor(Math.random() * 100) + 1; // 1~100
};

// 한국어 리뷰 템플릿
const reviewTemplates = {
  5: [
    '정말 깔끔하고 편안한 숙소였습니다! 다음에도 또 이용하고 싶어요.',
    '완벽한 숙박 경험이었습니다. 직원분들도 친절하시고 시설도 최고예요!',
    '위치도 좋고 시설도 깔끔해서 만족스러웠습니다. 강력 추천합니다!',
    '가격 대비 정말 좋은 숙소였어요. 다음에 또 오고 싶습니다.',
    '침대가 너무 편안하고 방도 넓어서 좋았습니다. 완벽한 선택이었어요!',
    '청결도가 뛰어나고 조용해서 푹 쉴 수 있었습니다. 최고예요!',
    '서비스가 정말 훌륭했고 시설도 최신식이라 만족도가 높았습니다.',
    '친절한 직원분들과 깔끔한 시설 덕분에 즐거운 여행이 되었어요.',
    '위치가 중심가라 접근성이 좋고 주변 맛집도 많아서 좋았습니다.',
    '가족 여행에 최적의 숙소였습니다. 아이들도 좋아했어요!'
  ],
  4: [
    '전반적으로 만족스러운 숙소였습니다. 다음에도 이용할 의향이 있어요.',
    '깔끔하고 편안했어요. 다만 조금 더 넓었으면 좋겠다는 생각이 들었습니다.',
    '가격 대비 괜찮은 숙소였습니다. 위치도 나쁘지 않았어요.',
    '시설은 좋은데 소음이 조금 있었던 게 아쉬웠습니다.',
    '직원분들이 친절하시고 청결도는 좋았습니다. 추천해요!',
    '침대가 편안하고 방도 깔끔했어요. 전반적으로 만족합니다.',
    '위치가 좋아서 관광하기 편리했습니다. 시설도 나쁘지 않았어요.',
    '가격 대비 괜찮은 선택이었습니다. 다음에도 고려해볼 만해요.',
    '깔끔하고 조용해서 잘 쉬었습니다. 다만 주차 공간이 좀 아쉬웠어요.',
    '전반적으로 좋은 숙소였습니다. 시설과 서비스 모두 만족스러웠어요.'
  ],
  3: [
    '전반적으로 평범했습니다. 특별히 좋거나 나쁘지 않았어요.',
    '가격 대비 그럭저럭 괜찮은 숙소였습니다. 크게 만족하지는 않았어요.',
    '시설은 나쁘지 않았는데 직원 서비스가 조금 아쉬웠습니다.',
    '위치는 좋은데 방이 생각보다 작았어요. 전반적으로 보통이었습니다.',
    '청결도는 괜찮았는데 소음이 있어서 조금 불편했습니다.',
    '예상했던 것보다는 조금 아쉬웠지만 나쁘지는 않았어요.',
    '가격 대비 평범한 수준이었습니다. 특별한 점은 없었어요.',
    '시설은 괜찮았는데 체크인 시간이 조금 늦어져서 아쉬웠습니다.',
    '전반적으로 무난한 숙소였습니다. 크게 추천하거나 비추천하지는 않아요.',
    '보통 수준의 숙소였어요. 가격 대비 그럭저럭 만족했습니다.'
  ],
  2: [
    '시설이 좀 오래되어서 아쉬웠습니다. 청결도도 개선이 필요해 보였어요.',
    '가격 대비 시설이 조금 아쉬웠습니다. 다음에는 다른 곳을 고려해볼게요.',
    '소음이 많아서 푹 쉬기 어려웠어요. 위치는 괜찮았지만 시설이 아쉬웠습니다.',
    '직원 서비스가 좀 아쉬웠고 시설도 예상보다 낮았어요.',
    '청결도가 좀 아쉬웠고 방도 생각보다 작았습니다.',
    '전반적으로 만족스럽지 않았어요. 가격 대비 시설이 아쉬웠습니다.',
    '체크인 과정이 복잡했고 시설도 예상보다 낮았어요.',
    '위치는 괜찮았는데 시설과 서비스가 아쉬웠습니다.',
    '가격 대비 시설이 좀 아쉬웠어요. 다음에는 다른 곳을 찾아볼게요.',
    '전반적으로 아쉬운 점이 많았습니다. 개선이 필요해 보였어요.'
  ],
  1: [
    '시설이 너무 오래되어서 불편했습니다. 청결도도 많이 아쉬웠어요.',
    '가격 대비 시설이 너무 낮았습니다. 다음에는 절대 이용하지 않을 것 같아요.',
    '소음이 심해서 전혀 쉬지 못했습니다. 직원 서비스도 아쉬웠어요.',
    '청결도가 매우 아쉬웠고 시설도 예상보다 훨씬 낮았습니다.',
    '전반적으로 매우 불만족스러웠습니다. 추천하지 않아요.',
    '체크인부터 문제가 많았고 시설도 너무 아쉬웠습니다.',
    '가격 대비 시설이 너무 낮았어요. 다음에는 다른 곳을 찾겠습니다.',
    '직원 서비스가 매우 아쉬웠고 시설도 개선이 많이 필요해 보였어요.',
    '위치는 괜찮았지만 시설과 서비스가 모두 아쉬웠습니다.',
    '전반적으로 매우 실망스러운 숙박 경험이었어요.'
  ]
};

// 랜덤 리뷰 내용 생성
const generateReviewContent = (rating) => {
  const templates = reviewTemplates[rating] || reviewTemplates[3];
  return templates[Math.floor(Math.random() * templates.length)];
};

// 랜덤 평점 생성 (5점 30%, 4점 40%, 3점 20%, 2점 7%, 1점 3%)
const generateRandomRating = () => {
  const rand = Math.random();
  if (rand < 0.3) return 5;
  if (rand < 0.7) return 4;
  if (rand < 0.9) return 3;
  if (rand < 0.97) return 2;
  return 1;
};

// 리뷰용 User 생성 함수
const generateReviewUser = async (index) => {
  const name = koreanNames[Math.floor(Math.random() * koreanNames.length)];
  const randomNum = Math.floor(Math.random() * 1000000) + index;
  const email = `reviewer${randomNum}@${emailDomains[Math.floor(Math.random() * emailDomains.length)]}`;
  
  // 전화번호 생성
  const phone1 = Math.floor(Math.random() * 9000) + 1000;
  const phone2 = Math.floor(Math.random() * 9000) + 1000;
  const phoneNumber = `010-${phone1}-${phone2}`;
  
  // 비밀번호 해시
  const passwordHash = await bcrypt.hash('password123', 10);
  
  try {
    const user = new User({
      name,
      email,
      phoneNumber,
      passwordHash,
      role: 'user',
      isActive: true,
      provider: 'local'
    });
    
    return await user.save();
  } catch (error) {
    // 이미 존재하는 이메일인 경우 기존 사용자 찾기
    if (error.code === 11000) {
      return await User.findOne({ email });
    }
    throw error;
  }
};

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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    reviewCount: generateRandomReviewCount(),
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
    rating: 0, // 리뷰 생성 후 재계산
    reviewCount: hotel.reviewCount || 0,
    minPrice: hotel.price,
    maxGuests: 2 + Math.floor(Math.random() * 4), // 2~5명
    checkInTime: '15:00',
    checkOutTime: '11:00',
  };
};

// 각 숙소마다 Room 생성
const createRoomForLodging = async (lodgingId, lodgingPrice) => {
  const room = new Room({
    lodgingId: lodgingId,
    roomName: '스탠다드 룸',
    roomSize: '25㎡',
    capacityMin: 2,
    capacityMax: 4,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    roomImage: '',
    price: lodgingPrice,
    countRoom: 10,
    ownerDiscount: 0,
    platformDiscount: 0,
    status: 'active'
  });
  
  return await room.save();
};

// 메인 실행 함수
const seedHotels = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB 연결 완료');
    
    // 기존 데이터 확인
    const existingLodgings = await Lodging.countDocuments();
    const existingBusinessUsers = await BusinessUser.countDocuments();
    const existingRooms = await Room.countDocuments();
    const existingBookings = await Booking.countDocuments();
    const existingReviews = await Review.countDocuments();
    
    if (existingLodgings > 0 || existingBusinessUsers > 0 || existingRooms > 0 || existingBookings > 0 || existingReviews > 0) {
      console.log(`⚠️  기존 데이터가 있습니다:`);
      console.log(`   - 숙소: ${existingLodgings}개`);
      console.log(`   - 사업자: ${existingBusinessUsers}개`);
      console.log(`   - 객실: ${existingRooms}개`);
      console.log(`   - 예약: ${existingBookings}개`);
      console.log(`   - 리뷰: ${existingReviews}개`);
      console.log('\n🗑️  기존 데이터 삭제 중...');
      
      // 기존 데이터 삭제 (User는 실제 사용자일 수 있으므로 삭제하지 않음)
      await Review.deleteMany({});
      await Booking.deleteMany({});
      await Room.deleteMany({});
      await Lodging.deleteMany({});
      await BusinessUser.deleteMany({});
      
      console.log('✅ 기존 데이터 삭제 완료\n');
    } else {
      console.log('📝 기존 데이터가 없습니다. 새로 생성합니다...\n');
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
    
    console.log(`\n✅ 숙소 생성 완료!`);
    console.log(`📊 생성된 사업자: ${businessIds.length}개`);
    console.log(`📊 생성된 숙소: ${insertedLodgings.length}개`);
    
    // 각 숙소마다 Room 생성 및 리뷰 생성
    console.log('\n🔄 객실 및 리뷰 생성 중...');
    let totalReviews = 0;
    let totalBookings = 0;
    
    for (let i = 0; i < insertedLodgings.length; i++) {
      const lodging = insertedLodgings[i];
      const hotel = allHotelsData[i];
      const reviewCount = hotel.reviewCount || 0;
      
      // Room 생성
      const room = await createRoomForLodging(lodging._id, hotel.price);
      
      // 리뷰 생성
      const reviews = [];
      const bookings = [];
      let totalRating = 0;
      
      for (let j = 0; j < reviewCount; j++) {
        // User 생성
        const user = await generateReviewUser(i * 1000 + j);
        
        // Booking 생성 (과거 날짜로 설정)
        const daysAgo = Math.floor(Math.random() * 180) + 1; // 1~180일 전
        const checkInDate = new Date();
        checkInDate.setDate(checkInDate.getDate() - daysAgo - 2);
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 3) + 1); // 1~3박
        
        const booking = new Booking({
          userId: user._id,
          lodgingId: lodging._id,
          roomId: room._id,
          userName: user.name,
          userPhone: user.phoneNumber || '010-0000-0000',
          checkIn: checkInDate,
          checkOut: checkOutDate,
          price: hotel.price,
          status: 'confirmed',
          paymentKey: `temp_${Date.now()}_${j}`,
          paymentAmount: hotel.price,
          isReviewed: true
        });
        
        const savedBooking = await booking.save();
        bookings.push(savedBooking);
        
        // Review 생성
        const rating = generateRandomRating();
        const review = new Review({
          userId: user._id,
          lodgingId: lodging._id,
          bookingId: savedBooking._id,
          rating: rating,
          content: generateReviewContent(rating)
        });
        
        const savedReview = await review.save();
        reviews.push(savedReview);
        totalRating += rating;
        totalReviews++;
      }
      
      // Lodging의 rating과 reviewCount 업데이트
      if (reviewCount > 0) {
        const averageRating = parseFloat((totalRating / reviewCount).toFixed(1));
        await Lodging.findByIdAndUpdate(lodging._id, {
          rating: averageRating,
          reviewCount: reviewCount
        });
      }
      
      totalBookings += bookings.length;
      
      if ((i + 1) % 10 === 0 || i === insertedLodgings.length - 1) {
        console.log(`✅ [${i + 1}/${insertedLodgings.length}] ${hotel.name} - 리뷰 ${reviewCount}개 생성 완료`);
      }
    }
    
    console.log(`\n✅ 완료!`);
    console.log(`📊 생성된 사업자: ${businessIds.length}개`);
    console.log(`📊 생성된 숙소: ${insertedLodgings.length}개`);
    console.log(`📊 생성된 예약: ${totalBookings}개`);
    console.log(`📊 생성된 리뷰: ${totalReviews}개`);
    console.log(`\n💡 모든 사업자/사용자의 기본 비밀번호: password123`);
    
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

