import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiHeart, FiShare2, FiMapPin, FiUsers, FiClock, FiChevronLeft, FiChevronRight, FiWifi, FiCalendar } from 'react-icons/fi';
import { MdPool, MdSpa, MdRestaurant, MdRoomService, MdFitnessCenter, MdLocalBar, MdCoffee, MdBusinessCenter, MdLocalParking, MdAirportShuttle, MdCancel, MdPets, MdSmokingRooms, MdHotTub, MdBeachAccess, MdGolfCourse, MdCasino, MdShoppingCart, MdLocalLaundryService, MdRoom, MdElevator, MdSecurity, MdSupportAgent, MdChildCare } from 'react-icons/md';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getFavorites, addFavorite, removeFavorite } from '../api/favoriteApi';
import { getLodgingReviews, createReview } from '../api/reviewApi';
import { getHotelDetail } from '../api/hotelApi';
import { getErrorMessage } from '../api/client';
import { allHotelsData } from './SearchResults';
import Header from '../components/Header';
import Footer from '../components/Footer';
import 'react-day-picker/dist/style.css';
import 'leaflet/dist/leaflet.css';
import './style/HotelDetail.scss';

// Leaflet 마커 아이콘 설정
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// 객실 데이터 (예시)
const generateRooms = (hotelId) => {
  const baseRooms = [
    {
      id: 1,
      name: 'Superior Room',
      description: '1 double bed or 2 twin beds',
      price: 240000,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      bathtub: true,
      capacity: 2,
      capacityStandard: 2,
      checkIn: '15:00',
      checkOut: '11:00',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: ['Free Wi-Fi', 'Air conditioning', 'TV', 'Mini bar'],
    },
    {
      id: 2,
      name: 'Deluxe Room',
      description: '1 king bed with city view',
      price: 280000,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      bathtub: true,
      capacity: 2,
      capacityStandard: 2,
      checkIn: '15:00',
      checkOut: '11:00',
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: ['Free Wi-Fi', 'Air conditioning', 'TV', 'Mini bar', 'Balcony'],
    },
    {
      id: 3,
      name: 'Suite',
      description: '2 bedrooms with living area',
      price: 350000,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      bathtub: true,
      capacity: 4,
      capacityStandard: 4,
      checkIn: '15:00',
      checkOut: '11:00',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: ['Free Wi-Fi', 'Air conditioning', 'TV', 'Mini bar', 'Living room', 'Kitchenette'],
    },
    {
      id: 4,
      name: 'Executive Suite',
      description: '3 bedrooms with full kitchen',
      price: 450000,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2,
      bathtub: true,
      capacity: 6,
      capacityStandard: 6,
      checkIn: '15:00',
      checkOut: '11:00',
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: ['Free Wi-Fi', 'Air conditioning', 'TV', 'Mini bar', 'Living room', 'Full kitchen'],
    },
  ];

  // 추가 객실 생성 (더 많은 객실을 위해)
  const additionalRooms = [
    {
      id: 5,
      name: 'Family Room',
      description: '2 double beds, perfect for families',
      price: 320000,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1,
      bathtub: true,
      capacity: 4,
      capacityStandard: 4,
      checkIn: '15:00',
      checkOut: '11:00',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: ['Free Wi-Fi', 'Air conditioning', 'TV', 'Mini bar', 'Family-friendly'],
    },
    {
      id: 6,
      name: 'Presidential Suite',
      description: 'Luxury suite with panoramic views',
      price: 550000,
      bedrooms: 3,
      beds: 3,
      bathrooms: 3,
      bathtub: true,
      capacity: 6,
      capacityStandard: 6,
      checkIn: '15:00',
      checkOut: '11:00',
      image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: ['Free Wi-Fi', 'Air conditioning', 'TV', 'Mini bar', 'Living room', 'Full kitchen', 'Private balcony'],
    },
    {
      id: 7,
      name: 'Standard Room',
      description: 'Comfortable room with city view',
      price: 200000,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      bathtub: false,
      capacity: 2,
      capacityStandard: 2,
      checkIn: '15:00',
      checkOut: '11:00',
      image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: ['Free Wi-Fi', 'Air conditioning', 'TV'],
    },
    {
      id: 8,
      name: 'Ocean View Room',
      description: 'Room with stunning ocean view',
      price: 380000,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      bathtub: true,
      capacity: 2,
      capacityStandard: 2,
      checkIn: '15:00',
      checkOut: '11:00',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: ['Free Wi-Fi', 'Air conditioning', 'TV', 'Mini bar', 'Ocean view'],
    },
  ];

  return [...baseRooms, ...additionalRooms];
};

// 리뷰 데이터 (예시)
const generateReviews = (hotelId) => {
  const reviewTemplates = [
    {
      userName: '김철수',
      rating: 5.0,
      ratingText: '최고',
      review: '호텔이 정말 깨끗하고 직원분들이 친절하셨어요. 위치도 좋고 시설도 훌륭했습니다.',
    },
    {
      userName: '이영희',
      rating: 4.5,
      ratingText: '훌륭함',
      review: '객실이 넓고 조용해서 휴식하기 좋았어요. 조식도 맛있었습니다.',
    },
    {
      userName: '박민수',
      rating: 5.0,
      ratingText: '최고',
      review: '가성비 최고입니다. 다음에도 여기로 올게요!',
    },
    {
      userName: '최지영',
      rating: 4.0,
      ratingText: '좋음',
      review: '시설이 깔끔하고 편안했습니다. 다만 조금 비싼 느낌이에요.',
    },
    {
      userName: '정대현',
      rating: 5.0,
      ratingText: '최고',
      review: '완벽한 숙박이었습니다. 특히 뷰가 정말 좋았어요!',
    },
    {
      userName: '한소희',
      rating: 4.5,
      ratingText: '훌륭함',
      review: '서비스가 훌륭하고 위치도 좋아서 만족스러웠습니다.',
    },
    {
      userName: '윤태준',
      rating: 4.0,
      ratingText: '좋음',
      review: '깨끗하고 편안한 분위기였습니다. 다시 방문하고 싶어요.',
    },
    {
      userName: '강미라',
      rating: 5.0,
      ratingText: '최고',
      review: '가족 여행에 최적의 호텔이었습니다. 아이들도 좋아했어요.',
    },
    {
      userName: '송현우',
      rating: 4.5,
      ratingText: '훌륭함',
      review: '비즈니스 여행에 딱 좋은 호텔입니다. 다음에도 이용할 예정입니다.',
    },
  ];

  return reviewTemplates.map((template, idx) => ({
    id: idx + 1,
    ...template,
    userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(template.userName)}&background=random`,
    date: `2024-${11 - Math.floor(idx / 3)}-${15 - (idx % 15)}`,
  }));
};

// 해시태그 형식의 특징
const hotelFeatures = [
  { id: 1, tag: '#공원근처', rating: 4.2, reviews: 371 },
  { id: 2, tag: '#야경명소', rating: 4.2, reviews: 371 },
  { id: 3, tag: '#공연장근처', rating: 4.2, reviews: 371 },
  { id: 4, tag: '#깨끗한호텔', rating: 4.2, reviews: 371 },
];

const HotelDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [hotelLoading, setHotelLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [roomImageIndices, setRoomImageIndices] = useState({});
  const [selectedRoomImages, setSelectedRoomImages] = useState(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [visibleRoomsCount, setVisibleRoomsCount] = useState(4);
  const reviewsPerPage = 3;
  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  // 날짜 및 게스트 선택 상태
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 1),
  });
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [guestOption, setGuestOption] = useState({ rooms: 1, guests: 2 });
  const [isGuestOpen, setGuestOpen] = useState(false);

  const checkInFieldRef = useRef(null);
  const checkOutFieldRef = useRef(null);
  const calendarRef = useRef(null);
  const guestRef = useRef(null);
  const roomsSectionRef = useRef(null);
  const [mapPosition, setMapPosition] = useState([37.5665, 126.9780]); // 기본값: 서울
  const [mapKey, setMapKey] = useState(0); // 지도 강제 리렌더링용

  // DB에서 호텔 정보 불러오기
  useEffect(() => {
    const loadHotel = async () => {
      if (!id) return;
      
      setHotelLoading(true);
      try {
        const response = await getHotelDetail(id);
        const hotelData = response.data || response.data?.data || response;
        
        if (hotelData) {
          // URL 파라미터에서 가격 읽기 (Search 화면에서 전달된 가격)
          const urlPrice = searchParams.get('price');
          const displayPrice = urlPrice ? parseInt(urlPrice) : (hotelData.minPrice || 0);
          
          // DB 데이터를 프론트엔드 형식에 맞게 변환
          const formattedHotel = {
            id: hotelData._id || hotelData.id || parseInt(id),
            name: hotelData.lodgingName || hotelData.name || '',
            price: displayPrice, // URL 파라미터의 가격 우선 사용, 없으면 minPrice
            address: hotelData.address || '',
            destination: hotelData.location || hotelData.destination || '',
            type: hotelData.type || 'hotel',
            starRating: hotelData.starRating || 5,
            amenitiesCount: hotelData.amenities?.length || 0,
            reviewScore: hotelData.averageRating || 0, // DB에서 계산된 평균 평점
            reviewText: 'Very Good', // 나중에 평점에 따라 계산
            reviewCount: hotelData.reviewCount || 0,
            image: hotelData.images?.[0] || hotelData.image || '',
            imageCount: hotelData.images?.length || 0,
            freebies: hotelData.freebies || { breakfast: false, parking: false, wifi: false, shuttle: false, cancellation: false },
            amenities: hotelData.amenities || { frontDesk: true, aircon: true, fitness: false, pool: false },
          };
          setHotel(formattedHotel);
        } else {
          // DB에 없으면 하드코딩된 데이터에서 찾기 (fallback)
          const fallbackHotel = allHotelsData.find((h) => h.id === parseInt(id));
          setHotel(fallbackHotel || null);
        }
      } catch (err) {
        console.error('Failed to load hotel', err);
        // 에러 발생 시 하드코딩된 데이터에서 찾기 (fallback)
        const fallbackHotel = allHotelsData.find((h) => h.id === parseInt(id));
        setHotel(fallbackHotel || null);
      } finally {
        setHotelLoading(false);
      }
    };

    loadHotel();
  }, [id]);

  const allRooms = useMemo(() => generateRooms(parseInt(id)), [id]);

  // 게스트 수에 따라 객실 필터링
  const filteredRooms = useMemo(() => {
    const totalGuests = guestOption.guests;
    return allRooms.filter(room => room.capacity >= totalGuests);
  }, [allRooms, guestOption.guests]);

  const visibleRooms = useMemo(() => filteredRooms.slice(0, visibleRoomsCount), [filteredRooms, visibleRoomsCount]);
  const mockReviews = useMemo(() => generateReviews(parseInt(id)), [id]);
  const actualReviewCount = reviews.length || mockReviews.length;

  // 실제 리뷰 데이터에서 평균 평점 계산
  const actualAverageRating = useMemo(() => {
    if (reviews.length === 0) {
      // 리뷰가 없으면 mockReviews의 평균 또는 hotel.reviewScore 사용
      if (mockReviews.length > 0) {
        const sum = mockReviews.reduce((acc, review) => acc + (review.rating || 0), 0);
        return sum / mockReviews.length;
      }
      return hotel?.reviewScore || 0;
    }
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return sum / reviews.length;
  }, [reviews, mockReviews, hotel?.reviewScore]);

  // 평점 텍스트 변환 함수
  const getRatingText = (rating) => {
    if (rating >= 4.5) return '최고';
    if (rating >= 4) return '훌륭함';
    if (rating >= 3.5) return '좋음';
    if (rating >= 3) return '보통';
    return '나쁨';
  };

  const handleLoadMoreRooms = () => {
    setVisibleRoomsCount((prev) => Math.min(prev + 4, filteredRooms.length));
  };

  // 페이지 진입 시 스크롤 최상단으로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]); // id가 변경될 때마다 (다른 호텔로 이동할 때)

  // DB에서 리뷰 데이터 불러오기
  useEffect(() => {
    const loadReviews = async () => {
      if (!hotel?.id) return;
      
      try {
        const response = await getLodgingReviews(hotel.id.toString());
        const reviewsData = response.data || response.data?.data || response || [];
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (err) {
        console.error('Failed to load reviews', err);
        // 에러 발생 시 빈 배열로 설정 (mockReviews 사용)
        setReviews([]);
      }
    };

    if (hotel && !hotelLoading) {
      loadReviews();
    }
  }, [hotel?.id, hotelLoading]);

  // 게스트 수가 변경되면 visibleRoomsCount 리셋
  useEffect(() => {
    setVisibleRoomsCount(4);
  }, [guestOption.guests]);

  // 편의시설 목록
  const allAmenities = useMemo(() => {
    const amenities = [];

    if (hotel?.amenities.pool) {
      amenities.push({ icon: MdPool, name: '야외 수영장' });
      amenities.push({ icon: MdPool, name: '실내 수영장' });
    }
    amenities.push({ icon: MdSpa, name: '스파 및 웰니스 센터' });
    amenities.push({ icon: MdRestaurant, name: '레스토랑' });
    amenities.push({ icon: MdRoomService, name: '룸 서비스' });
    if (hotel?.amenities.fitness) {
      amenities.push({ icon: MdFitnessCenter, name: '피트니스 센터' });
    }
    amenities.push({ icon: MdLocalBar, name: '바/라운지' });
    if (hotel?.freebies.wifi) {
      amenities.push({ icon: FiWifi, name: '무료 Wi-Fi' });
    }
    amenities.push({ icon: MdCoffee, name: '티/커피 머신' });

    // 추가 편의시설
    amenities.push({ icon: MdBusinessCenter, name: '비즈니스 센터' });
    amenities.push({ icon: MdLocalParking, name: '주차장' });
    amenities.push({ icon: MdAirportShuttle, name: '공항 셔틀' });
    amenities.push({ icon: MdCancel, name: '무료 취소' });
    amenities.push({ icon: MdPets, name: '반려동물 허용' });
    amenities.push({ icon: MdSmokingRooms, name: '흡연실' });
    amenities.push({ icon: MdHotTub, name: '자쿠지' });
    amenities.push({ icon: MdBeachAccess, name: '비치 액세스' });
    amenities.push({ icon: MdGolfCourse, name: '골프 코스' });
    amenities.push({ icon: MdCasino, name: '카지노' });
    amenities.push({ icon: MdShoppingCart, name: '쇼핑몰' });
    amenities.push({ icon: MdLocalLaundryService, name: '세탁 서비스' });
    amenities.push({ icon: MdRoom, name: '연결 객실' });
    amenities.push({ icon: MdElevator, name: '엘리베이터' });
    amenities.push({ icon: MdSecurity, name: '보안 서비스' });
    amenities.push({ icon: MdSupportAgent, name: '컨시어지 서비스' });
    amenities.push({ icon: MdChildCare, name: '어린이 돌봄 서비스' });

    return amenities;
  }, [hotel]);

  const visibleAmenities = useMemo(() => {
    return showAllAmenities ? allAmenities : allAmenities.slice(0, 9);
  }, [allAmenities, showAllAmenities]);

  // 기본 이미지 URL
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

  // 이미지 갤러리 (더 많은 이미지 추가)
  const galleryImages = [
    hotel?.image || DEFAULT_IMAGE,
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719508251-c38c1ae06fbb?auto=format&fit=crop&w=800&q=80',
  ];

  const paginatedReviews = useMemo(() => {
    const reviewsToShow = reviews.length > 0 ? reviews : mockReviews;
    const start = (currentReviewPage - 1) * reviewsPerPage;
    return reviewsToShow.slice(start, start + reviewsPerPage);
  }, [reviews, mockReviews, currentReviewPage]);

  const totalReviewPages = Math.ceil((reviews.length > 0 ? reviews.length : mockReviews.length) / reviewsPerPage);

  const checkIn = dateRange?.from;
  const checkOut = dateRange?.to;

  const formatDateLabel = (date, fallback) =>
    date ? format(date, 'MM.dd (EEE)', { locale: ko }) : fallback;

  const formattedCheckIn = formatDateLabel(checkIn, '날짜 선택');
  const formattedCheckOut = formatDateLabel(checkOut, '날짜 선택');

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideCalendar =
        calendarRef.current?.contains(event.target) ||
        checkInFieldRef.current?.contains(event.target) ||
        checkOutFieldRef.current?.contains(event.target);

      if (isCalendarOpen && !isInsideCalendar) {
        setCalendarOpen(false);
      }

      if (guestRef.current && !guestRef.current.contains(event.target)) {
        setGuestOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isCalendarOpen]);

  useEffect(() => {
    if (checkIn && checkOut && checkOut <= checkIn) {
      setDateRange({ from: checkIn, to: addDays(checkIn, 1) });
    }
  }, [checkIn, checkOut]);

  const handleCalendarChange = (range) => {
    setDateRange(range || { from: undefined, to: undefined });
  };

  const handleCalendarOpen = (event) => {
    event.stopPropagation();
    setCalendarOpen(true);
    setGuestOpen(false);
  };

  const handleApplyDates = () => {
    if (checkIn && !checkOut) {
      setDateRange({ from: checkIn, to: addDays(checkIn, 1) });
    }
    setCalendarOpen(false);
  };

  const handleResetDates = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const handleApplyGuests = () => {
    setGuestOpen(false);
  };

  const handleBookButtonClick = () => {
    roomsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRoomBooking = (roomId, e) => {
    e.stopPropagation();
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'));
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'));
    params.set('rooms', guestOption.rooms.toString());
    params.set('guests', guestOption.guests.toString());

    navigate(`/hotel/${id}/booking/${roomId}?${params.toString()}`);
  };

  // 찜하기 기능 - API에서 찜한 목록 확인
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!hotel?.id) return;
      
      try {
        const response = await getFavorites();
        const favoritesData = response.data || response.data?.data || response || [];
        const favoriteIds = Array.isArray(favoritesData)
          ? favoritesData.map(item => item.lodgingId || item.lodging?._id || item._id || item)
          : [];
        
        // hotel.id를 문자열로 변환하여 비교
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
  }, [hotel?.id]);

  // 주소를 좌표로 변환 (OpenStreetMap Nominatim API 사용)
  useEffect(() => {
    if (!hotel?.address) return;

    const geocodeAddress = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(hotel.address)}&limit=1`,
          {
            headers: {
              'User-Agent': 'HotelBnB-User/1.0'
            }
          }
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setMapPosition([lat, lon]);
          setMapKey(prev => prev + 1); // 지도 강제 리렌더링
          console.log('주소 검색 성공, 좌표:', [lat, lon]);
        } else {
          console.warn('주소를 찾을 수 없습니다. 기본 좌표 사용:', hotel.address);
          setMapPosition([37.5665, 126.9780]); // 기본값: 서울
        }
      } catch (error) {
        console.error('주소 검색 중 오류:', error);
        setMapPosition([37.5665, 126.9780]); // 기본값: 서울
      }
    };

    geocodeAddress();
  }, [hotel?.address]);

  // 지도 중심 업데이트 컴포넌트
  const MapUpdater = ({ position }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(position, 13);
    }, [map, position]);
    return null;
  };

  const handleHeartClick = async () => {
    if (!hotel?.id) return;
    
    try {
      if (isFavorited) {
        // 찜하기 삭제
        await removeFavorite(hotel.id.toString());
        setIsFavorited(false);
      } else {
        // 찜하기 추가
        await addFavorite(hotel.id.toString());
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
      alert(getErrorMessage(err, '찜하기 기능을 사용할 수 없습니다.'));
    }
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
  };

  const closeRoomModal = () => {
    setSelectedRoom(null);
  };

  const handleRoomImageNext = (roomId, e) => {
    e.stopPropagation();
    const room = allRooms.find((r) => r.id === roomId);
    if (!room || !room.images) return;

    const currentIndex = roomImageIndices[roomId] || 0;
    const nextIndex = (currentIndex + 1) % room.images.length;
    setRoomImageIndices({ ...roomImageIndices, [roomId]: nextIndex });
  };

  const handleRoomImagePrev = (roomId, e) => {
    e.stopPropagation();
    const room = allRooms.find((r) => r.id === roomId);
    if (!room || !room.images) return;

    const currentIndex = roomImageIndices[roomId] || 0;
    const prevIndex = currentIndex === 0 ? room.images.length - 1 : currentIndex - 1;
    setRoomImageIndices({ ...roomImageIndices, [roomId]: prevIndex });
  };

  const handleRoomImageMore = (room, e) => {
    e.stopPropagation();
    setSelectedRoomImages(room);
  };

  const closeRoomImagesModal = () => {
    setSelectedRoomImages(null);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < Math.floor(rating) ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (!hotel) {
    return (
      <div className="hotel-detail-page">
        <Header />
        <div className="not-found">
          <p>호텔을 찾을 수 없습니다.</p>
          <button onClick={() => navigate('/search')} className="btn primary">
            검색 결과로 돌아가기
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="hotel-detail-page">
      <Header />
      <div className="hotel-detail-content">

        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          {(() => {
            const parts = hotel.destination.split(',').map(s => s.trim());
            const city = parts[0];
            const country = parts[1] || '';
            return (
              <>
                {country && <span>{country}</span>}
                {country && <span className="separator">&gt;</span>}
                <span>{city}</span>
                <span className="separator">&gt;</span>
                <span className="hotel-name-breadcrumb">{hotel.name}</span>
              </>
            );
          })()}
        </div>

        {/* Header Section */}
        <div className="hotel-header">
          <div className="hotel-header-left">
            <div className="hotel-title-section">
              <h1 className="hotel-name">{hotel.name}</h1>
              <div className="hotel-stars">{renderStars(hotel.starRating)}</div>
            </div>
            <div className="hotel-rating-section">
              <span className="rating-score">{actualAverageRating.toFixed(1)}</span>
              <span className="rating-text">{getRatingText(actualAverageRating)}</span>
              <span className="rating-count">{actualReviewCount}개 리뷰</span>
            </div>
            <p className="hotel-address">
              <FiMapPin /> {hotel.address}
            </p>
          </div>
          <div className="hotel-header-right">
            <div className="header-actions">
              <button className="icon-button" onClick={handleHeartClick}>
                <FiHeart className={isFavorited ? 'favorited' : ''} />
              </button>
              <button className="icon-button">
                <FiShare2 />
              </button>
            </div>
            <div className="price-section">
              <span className="price">₩{hotel.price.toLocaleString()}/night</span>
              <button className="btn primary book-button" onClick={handleBookButtonClick}>예약하기</button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            <img
              src={galleryImages[0]}
              alt={hotel.name}
              onError={(e) => {
                e.target.src = DEFAULT_IMAGE;
              }}
            />
          </div>
          <div className="thumbnail-grid">
            {galleryImages.slice(1, 5).map((img, idx) => (
              <div key={idx} className="thumbnail">
                <img
                  src={img}
                  alt={`${hotel.name} ${idx + 2}`}
                  onError={(e) => {
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
              </div>
            ))}
            <div className="thumbnail view-all" onClick={() => setIsGalleryOpen(true)}>
              <span>더보기</span>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <section className="overview-section">
          <h2 className="section-title">개요</h2>
          <p className="overview-text">
            {hotel.name}은(는) {hotel.destination}에 위치한 {hotel.starRating}성급 호텔입니다.
            편안한 숙박과 훌륭한 서비스를 제공하며, 비즈니스 여행객과 레저 여행객 모두에게 적합합니다.
            현대적인 시설과 친절한 직원들이 여러분의 만족스러운 체류를 보장합니다.
          </p>
        </section>

        {/* Available Rooms Section */}
        <section className="rooms-section" ref={roomsSectionRef}>
          <h2 className="section-title">잔여 객실</h2>

          {/* 날짜 및 게스트 선택 박스 */}
          <div className="room-booking-selector">
            <div className="date-range-wrapper" ref={checkInFieldRef}>
              <div className="date-range-container">
                <div className="field">
                  <FiCalendar />
                  <div className="field-content">
                    <span>체크인</span>
                    <button className="date-toggle" type="button" onClick={handleCalendarOpen}>
                      {formattedCheckIn}
                    </button>
                  </div>
                </div>
                <div className="field" ref={checkOutFieldRef}>
                  <FiCalendar />
                  <div className="field-content">
                    <span>체크아웃</span>
                    <button className="date-toggle" type="button" onClick={handleCalendarOpen}>
                      {formattedCheckOut}
                    </button>
                  </div>
                </div>
              </div>
              {isCalendarOpen ? (
                <div
                  className="calendar-dropdown"
                  ref={calendarRef}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={handleCalendarChange}
                    numberOfMonths={2}
                    locale={ko}
                    disabled={{ before: new Date() }}
                    className="rdp"
                  />
                  <div className="calendar-actions">
                    <button className="btn reset" type="button" onClick={handleResetDates}>
                      초기화
                    </button>
                    <button className="btn primary apply" type="button" onClick={handleApplyDates}>
                      완료
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="field" ref={guestRef}>
              <FiUsers />
              <div className="field-content">
                <span>객실 및 투숙객</span>
                <button
                  className="guest-button"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setGuestOpen((prev) => !prev);
                    setCalendarOpen(false);
                  }}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                >
                  객실 {guestOption.rooms}개, 투숙객 {guestOption.guests}명
                </button>
              </div>
              {isGuestOpen ? (
                <div
                  className="guest-dropdown"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="guest-row">
                    <span className="guest-label">객실</span>
                    <div className="counter-controls">
                      <button
                        className="counter-button"
                        type="button"
                        onClick={() =>
                          setGuestOption((prev) => ({
                            ...prev,
                            rooms: Math.max(1, prev.rooms - 1),
                          }))
                        }
                      >
                        -
                      </button>
                      <span>{guestOption.rooms}</span>
                      <button
                        className="counter-button"
                        type="button"
                        onClick={() =>
                          setGuestOption((prev) => ({
                            ...prev,
                            rooms: prev.rooms + 1,
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="guest-row">
                    <span className="guest-label">투숙객</span>
                    <div className="counter-controls">
                      <button
                        className="counter-button"
                        type="button"
                        onClick={() =>
                          setGuestOption((prev) => ({
                            ...prev,
                            guests: Math.max(1, prev.guests - 1),
                          }))
                        }
                      >
                        -
                      </button>
                      <span>{guestOption.guests}</span>
                      <button
                        className="counter-button"
                        type="button"
                        onClick={() =>
                          setGuestOption((prev) => ({
                            ...prev,
                            guests: prev.guests + 1,
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button className="btn primary apply" type="button" onClick={handleApplyGuests}>
                    완료
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rooms-grid">
            {visibleRooms.map((room) => (
              <div key={room.id} className="room-card" onClick={() => handleRoomClick(room)}>
                <div className="room-image-wrapper">
                  {room.images && room.images.length > 1 ? (
                    <>
                      <div className="room-image">
                        <img
                          src={room.images[roomImageIndices[room.id] || 0] || DEFAULT_IMAGE}
                          alt={room.name}
                          onError={(e) => {
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                      </div>
                      <button
                        className="room-image-nav room-image-prev"
                        onClick={(e) => handleRoomImagePrev(room.id, e)}
                      >
                        <FiChevronLeft />
                      </button>
                      <button
                        className="room-image-nav room-image-next"
                        onClick={(e) => handleRoomImageNext(room.id, e)}
                      >
                        <FiChevronRight />
                      </button>
                      <button
                        className="room-image-more"
                        onClick={(e) => handleRoomImageMore(room, e)}
                      >
                        더보기
                      </button>
                      <div className="room-image-indicator">
                        {(roomImageIndices[room.id] || 0) + 1} / {room.images.length}
                      </div>
                    </>
                  ) : (
                    <div className="room-image">
                      <img
                        src={room.image || DEFAULT_IMAGE}
                        alt={room.name}
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="room-info">
                  <h3 className="room-name">{room.name}</h3>
                  <p className="room-description">{room.description}</p>
                  <div className="room-details">
                    <span><FiUsers /> 침실 {room.bedrooms}개</span>
                    <span><FiUsers /> 침대 {room.beds}개</span>
                    <span><FiUsers /> 욕실 {room.bathrooms}개</span>
                  </div>
                  <div className="room-capacity">
                    <span><FiUsers /> 최대 {room.capacity}명 / 기준 {room.capacityStandard}명</span>
                  </div>
                  <div className="room-check-times">
                    <span><FiClock /> 체크인: {room.checkIn}</span>
                    <span><FiClock /> 체크아웃: {room.checkOut}</span>
                  </div>
                  <div className="room-price-section">
                    <span className="room-price">₩{room.price.toLocaleString()}/night</span>
                    <button className="btn primary" onClick={(e) => handleRoomBooking(room.id, e)}>예약하기</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {visibleRoomsCount < filteredRooms.length && (
            <div className="rooms-load-more">
              <span className="load-more-text" onClick={handleLoadMoreRooms}>
                더보기
              </span>
            </div>
          )}
        </section>

        {/* Map Section */}
        <section className="map-section">
          <h2 className="section-title">지도보기</h2>
          <div className="map-container">
            <MapContainer
              key={mapKey}
              center={mapPosition}
              zoom={13}
              style={{ height: '400px', width: '100%', zIndex: 0 }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater position={mapPosition} />
              <Marker position={mapPosition}>
                <Popup>
                  <strong>{hotel.name}</strong>
                  <br />
                  {hotel.address}
                </Popup>
              </Marker>
            </MapContainer>
            <a
              href={`https://www.openstreetmap.org/?mlat=${mapPosition[0]}&mlon=${mapPosition[1]}&zoom=15`}
              target="_blank"
              rel="noopener noreferrer"
              className="view-map-link"
            >
              OpenStreetMap에서 보기
            </a>
          </div>
          <p className="map-address">
            <FiMapPin /> {hotel.address}
          </p>
        </section>

        {/* Amenities Section */}
        <section className="amenities-section">
          <h2 className="section-title">편의시설</h2>
          <div className="amenities-grid">
            {visibleAmenities.map((amenity, idx) => {
              const IconComponent = amenity.icon;
              return (
                <div key={idx} className="amenity-item">
                  <IconComponent className="amenity-icon" />
                  <span>{amenity.name}</span>
                </div>
              );
            })}
            {!showAllAmenities && allAmenities.length > 9 && (
              <div
                className="amenity-item more"
                onClick={() => setShowAllAmenities(true)}
              >
                <span>+{allAmenities.length - 9}개 더보기</span>
              </div>
            )}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="reviews-section">
          <h2 className="section-title">리뷰</h2>
          <div className="reviews-header">
            {/* 해시태그 형식의 특징 */}
            <div className="features-tags">
              <div className="main-rating-card">
                <div className="rating-score-large">{actualAverageRating.toFixed(1)}</div>
                <div className="rating-text-large">{getRatingText(actualAverageRating)}</div>
                <div className="rating-count-small">{actualReviewCount}개 리뷰</div>
              </div>
              {hotelFeatures.map((feature) => (
                <div key={feature.id} className="feature-tag">
                  <span className="tag-text">{feature.tag}</span>
                  <div className="tag-rating">
                    <span className="tag-rating-score">{actualAverageRating.toFixed(1)}</span>
                    <span className="tag-rating-text">{getRatingText(actualAverageRating)}</span>
                    <span className="tag-rating-count">{actualReviewCount}개 리뷰</span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="btn secondary"
              onClick={() => {
                if (userBookings.length === 0) {
                  alert('리뷰를 작성하려면 먼저 예약을 완료해야 합니다.');
                  return;
                }
                setIsReviewModalOpen(true);
                if (userBookings.length === 1) {
                  setReviewBookingId(userBookings[0]._id || userBookings[0].id);
                }
              }}
            >
              리뷰 작성하기
            </button>
          </div>
          <div className="reviews-list">
            {paginatedReviews.map((review, idx) => {
              const reviewId = review._id || review.id || idx;
              const userName = review.userId?.name || review.userId?.displayName || review.userName || '익명';
              const userEmail = review.userId?.email || '';
              const avatar = review.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
              const rating = review.rating || 5;
              const content = review.content || review.review || '';
              const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString('ko-KR') : (review.date || '');
              
              return (
                <div key={reviewId} className="review-item">
                  <div className="review-header">
                    <img src={avatar} alt={userName} className="review-avatar" />
                    <div className="review-user-info">
                      <span className="review-user-name">{userName}</span>
                      <div className="review-rating">
                        <span className="review-rating-score">{rating}</span>
                        <span className="review-rating-text">
                          {rating >= 4.5 ? '최고' : rating >= 4 ? '훌륭함' : rating >= 3.5 ? '좋음' : rating >= 3 ? '보통' : '나쁨'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="review-text">{content}</p>
                  <span className="review-date">{date}</span>
                </div>
              );
            })}
          </div>
          {totalReviewPages > 1 && (
            <div className="reviews-pagination">
              <button
                className="pagination-button"
                onClick={() => setCurrentReviewPage((prev) => Math.max(1, prev - 1))}
                disabled={currentReviewPage === 1}
              >
                &lt;
              </button>
              <span className="pagination-info">
                {currentReviewPage} / {totalReviewPages}
              </span>
              <button
                className="pagination-button"
                onClick={() => setCurrentReviewPage((prev) => Math.min(totalReviewPages, prev + 1))}
                disabled={currentReviewPage === totalReviewPages}
              >
                &gt;
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div className="room-modal-overlay" onClick={closeRoomModal}>
          <div className="room-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeRoomModal}>×</button>
            <div className="room-modal-content">
              <div className="room-modal-image">
                <img
                  src={selectedRoom.image || DEFAULT_IMAGE}
                  alt={selectedRoom.name}
                  onError={(e) => {
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
              </div>
              <div className="room-modal-info">
                <h2>{selectedRoom.name}</h2>
                <p className="room-modal-description">{selectedRoom.description}</p>
                <div className="room-modal-details">
                  <div className="detail-item">
                    <FiUsers />
                    <span>침실: {selectedRoom.bedrooms}개</span>
                  </div>
                  <div className="detail-item">
                    <FiUsers />
                    <span>침대: {selectedRoom.beds}개</span>
                  </div>
                  <div className="detail-item">
                    <FiUsers />
                    <span>욕실: {selectedRoom.bathrooms}개</span>
                  </div>
                  <div className="detail-item">
                    <FiClock />
                    <span>체크인: {selectedRoom.checkIn}</span>
                  </div>
                  <div className="detail-item">
                    <FiClock />
                    <span>체크아웃: {selectedRoom.checkOut}</span>
                  </div>
                </div>
                <div className="room-modal-amenities">
                  <h3>객실 편의시설</h3>
                  <div className="amenities-list">
                    {selectedRoom.amenities.map((amenity, idx) => (
                      <span key={idx} className="amenity-badge">{amenity}</span>
                    ))}
                  </div>
                </div>
                <div className="room-modal-price">
                  <span className="price">₩{selectedRoom.price.toLocaleString()}/night</span>
                  <button className="btn primary" onClick={(e) => handleRoomBooking(selectedRoom.id, e)}>예약하기</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {isGalleryOpen && (
        <div className="gallery-modal-overlay" onClick={() => setIsGalleryOpen(false)}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsGalleryOpen(false)}>×</button>
            <div className="gallery-modal-header">
              <h2>{hotel.name} 사진</h2>
            </div>
            <div className="gallery-modal-content">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="gallery-modal-image">
                  <img
                    src={img || DEFAULT_IMAGE}
                    alt={`${hotel.name} ${idx + 1}`}
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Room Images Modal */}
      {selectedRoomImages && (
        <div className="gallery-modal-overlay" onClick={closeRoomImagesModal}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeRoomImagesModal}>×</button>
            <div className="gallery-modal-header">
              <h2>{selectedRoomImages.name} 사진</h2>
            </div>
            <div className="gallery-modal-content">
              {selectedRoomImages.images?.map((img, idx) => (
                <div key={idx} className="gallery-modal-image">
                  <img
                    src={img || DEFAULT_IMAGE}
                    alt={`${selectedRoomImages.name} ${idx + 1}`}
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="modal-overlay" onClick={() => setIsReviewModalOpen(false)}>
          <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
            <h2>리뷰 작성</h2>
            {userBookings.length > 1 && (
              <div className="form-group">
                <label>예약 선택</label>
                <select
                  value={reviewBookingId || ''}
                  onChange={(e) => setReviewBookingId(e.target.value)}
                  className="form-input"
                >
                  <option value="">예약을 선택하세요</option>
                  {userBookings.map((booking) => (
                    <option key={booking._id || booking.id} value={booking._id || booking.id}>
                      {booking.checkIn} ~ {booking.checkOut}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>평점</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-button ${star <= reviewRating ? 'active' : ''}`}
                    onClick={() => setReviewRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>리뷰 내용</label>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                className="form-input"
                rows={5}
                placeholder="숙소에 대한 솔직한 리뷰를 작성해주세요."
              />
            </div>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setIsReviewModalOpen(false)}>
                취소
              </button>
              <button
                className="btn primary"
                onClick={async () => {
                  if (!reviewBookingId) {
                    alert('예약을 선택해주세요.');
                    return;
                  }
                  if (!reviewContent.trim()) {
                    alert('리뷰 내용을 입력해주세요.');
                    return;
                  }
                  try {
                    await createReview({
                      bookingId: reviewBookingId,
                      rating: reviewRating,
                      content: reviewContent,
                    });
                    alert('리뷰가 작성되었습니다.');
                    setIsReviewModalOpen(false);
                    setReviewContent('');
                    setReviewRating(5);
                    // 리뷰 목록 새로고침
                    const response = await getLodgingReviews(hotel.id.toString());
                    const reviewsData = response.data || response.data?.data || response || [];
                    setReviews(Array.isArray(reviewsData) ? reviewsData : []);
                  } catch (err) {
                    alert(getErrorMessage(err, '리뷰 작성에 실패했습니다.'));
                  }
                }}
              >
                작성하기
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default HotelDetail;

