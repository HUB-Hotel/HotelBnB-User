import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiMapPin, FiCalendar, FiUsers, FiCreditCard, FiPlus } from 'react-icons/fi';
import { createBooking } from '../api/bookingApi';
import { getRooms } from '../api/hotelApi';
import { getErrorMessage } from '../api/client';
import { allHotelsData } from './SearchResults';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './style/Booking.scss';

const Booking = () => {
  const { id, roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const rooms = searchParams.get('rooms') || '1';
  const guests = searchParams.get('guests') || '2';
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token');

    if (!isLoggedIn || !token) {
      navigate('/login', { replace: true });
      return;
    }
  }, [navigate]);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [actualRoom, setActualRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expDate: '',
    cvc: '',
    cardName: '',
    country: '대한민국',
    saveInfo: true,
  });
  const isEditing = !isSummaryVisible;

  const hotel = useMemo(() => {
    return allHotelsData.find((h) => h.id === parseInt(id));
  }, [id]);

  // 실제 Room API에서 데이터 가져오기
  useEffect(() => {
    const fetchRoom = async () => {
      if (!id || !roomId) return;
      
      try {
        setLoadingRoom(true);
        const response = await getRooms(id);
        const rooms = response.data || [];
        
        // roomId가 숫자인 경우 인덱스로 찾기, ObjectId인 경우 _id로 찾기
        const roomIndex = parseInt(roomId) - 1;
        let foundRoom = null;
        
        if (roomIndex >= 0 && roomIndex < rooms.length) {
          foundRoom = rooms[roomIndex];
        } else {
          // ObjectId로 찾기 시도
          foundRoom = rooms.find(r => r._id === roomId || r.id === roomId);
        }
        
        if (foundRoom) {
          setActualRoom(foundRoom);
        } else {
          // Fallback: 기본 객실 데이터
          const fallbackRooms = [
            { _id: '1', roomName: 'Superior Room', price: 240000 },
            { _id: '2', roomName: 'Deluxe Room', price: 280000 },
            { _id: '3', roomName: 'Suite', price: 350000 },
            { _id: '4', roomName: 'Executive Suite', price: 450000 },
          ];
          setActualRoom(fallbackRooms[roomIndex] || fallbackRooms[0]);
        }
      } catch (err) {
        console.error('Failed to fetch room:', getErrorMessage(err));
        // Fallback: 기본 객실 데이터
        const fallbackRooms = [
          { _id: '1', roomName: 'Superior Room', price: 240000 },
          { _id: '2', roomName: 'Deluxe Room', price: 280000 },
          { _id: '3', roomName: 'Suite', price: 350000 },
          { _id: '4', roomName: 'Executive Suite', price: 450000 },
        ];
        const roomIndex = parseInt(roomId) - 1;
        setActualRoom(fallbackRooms[roomIndex >= 0 && roomIndex < fallbackRooms.length ? roomIndex : 0]);
      } finally {
        setLoadingRoom(false);
      }
    };
    
    fetchRoom();
  }, [id, roomId]);

  // Fallback용 객실 데이터
  const room = useMemo(() => {
    if (actualRoom) {
      return {
        id: actualRoom._id || actualRoom.id,
        name: actualRoom.roomName || actualRoom.name || '객실',
        description: actualRoom.description || '',
        price: actualRoom.price || 240000,
      };
    }
    
    // 기본값
    const fallbackRooms = [
      { id: 1, name: 'Superior Room', description: '1 더블베드 or 2 트윈 베드', price: 240000 },
      { id: 2, name: 'Deluxe Room', description: '1 king bed with city view', price: 280000 },
      { id: 3, name: 'Suite', description: '2 bedrooms with living area', price: 350000 },
      { id: 4, name: 'Executive Suite', description: '3 bedrooms with full kitchen', price: 450000 },
    ];
    return fallbackRooms.find((r) => r.id === parseInt(roomId)) || fallbackRooms[0];
  }, [actualRoom, roomId]);

  const baseFare = room?.price || 240000;
  const taxes = 0;
  const serviceFee = 0;
  const total = baseFare - discountAmount + taxes + serviceFee;

  const destinationParts = hotel?.destination?.split(',').map((part) => part.trim()) || [];
  const city = destinationParts[0] || '서울';
  const country = destinationParts[1] || '대한민국';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // localStorage에서 사용자 정보 불러오기
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const user = JSON.parse(storedUserInfo);
        setUserInfo(user);
      } catch (error) {
        console.error('Failed to load user info', error);
      }
    }
    
    // localStorage에서 결제수단 불러오기
    const stored = localStorage.getItem('paymentMethods');
    if (stored) {
      try {
        const methods = JSON.parse(stored);
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedCard(methods[0].id);
        }
      } catch (error) {
        console.error('Failed to load payment methods', error);
      }
    }
  }, []);

  useEffect(() => {
    // reset summary if room changes
    setIsSummaryVisible(false);
    setCouponCode('');
    setCouponMessage('');
    setDiscountAmount(0);
    setPhoneNumber('');
  }, [roomId]);
  const handleApplyCoupon = () => {
    const trimmedCode = couponCode.trim();
    if (!trimmedCode) {
      setCouponMessage('쿠폰 코드를 입력해주세요.');
      setDiscountAmount(0);
      return;
    }

    const upperCode = trimmedCode.toUpperCase();
    const isKoreanDiscount = trimmedCode === '할인';

    if (upperCode === 'WELCOME10' || isKoreanDiscount) {
      const newDiscount = Math.floor(baseFare * 0.1);
      setDiscountAmount(newDiscount);
      setCouponMessage('10% 할인 쿠폰이 적용되었습니다.');
    } else {
      setDiscountAmount(0);
      setCouponMessage('사용할 수 없는 쿠폰입니다.');
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return '날짜 선택';
    const date = new Date(dateString);
    return format(date, 'MM.dd (EEE)', { locale: ko });
  };

  const formatTicketDate = (dateString) => {
    if (!dateString) return '날짜 미정';
    const date = new Date(dateString);
    return format(date, "MMM d (EEE)", { locale: ko });
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpDateValue = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) {
      return digits;
    }
    const month = digits.slice(0, 2);
    const year = digits.slice(2);
    return `${month}/${year}`;
  };

  const handleNewCardChange = (field, value) => {
    setNewCard((prev) => {
      let nextValue = value;
      if (field === 'cardNumber') {
        nextValue = formatCardNumber(value);
      } else if (field === 'expDate') {
        nextValue = formatExpDateValue(value);
      }
      return {
        ...prev,
        [field]: nextValue,
      };
    });
  };

  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    setPhoneNumber(digits);
  };

  const handleAddCardSubmit = (event) => {
    event.preventDefault();
    if (!newCard.cardNumber.trim() || !newCard.cardName.trim() || !newCard.expDate.trim() || !newCard.cvc.trim()) {
      setCouponMessage('카드 정보를 모두 입력해주세요.');
      return;
    }

    const sanitizedNumber = newCard.cardNumber.replace(/\s+/g, '');
    const last4 = sanitizedNumber.slice(-4);
    const newId = `card-${Date.now()}`;

    const newMethod = {
      id: newId,
      label: `${newCard.cardName} ****${last4} ${newCard.expDate}`,
      brand: sanitizedNumber.startsWith('4') ? 'VISA' : 'Card',
      cardNumber: sanitizedNumber,
      expDate: newCard.expDate,
      cardName: newCard.cardName,
      country: newCard.country,
    };

    const updatedMethods = [...paymentMethods, newMethod];
    setPaymentMethods(updatedMethods);
    setSelectedCard(newId);
    // localStorage에 저장
    localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
    setIsAddCardModalOpen(false);
    setNewCard({
      cardNumber: '',
      expDate: '',
      cvc: '',
      cardName: '',
      country: '대한민국',
      saveInfo: true,
    });
  };

  const handleDeleteCard = (cardId, e) => {
    e.stopPropagation();
    const updatedMethods = paymentMethods.filter((method) => method.id !== cardId);
    setPaymentMethods(updatedMethods);
    // localStorage에 저장
    localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
    if (selectedCard === cardId) {
      if (updatedMethods.length > 0) {
        setSelectedCard(updatedMethods[0].id);
      } else {
        setSelectedCard('');
      }
    }
  };

  const buildBookingPayload = useCallback(() => {
    const bookingNumber = Date.now().toString().slice(-8);
    // 사용자 이름 가져오기 (displayName 또는 name)
    const userName = userInfo?.displayName || userInfo?.name || '게스트';
    // 사용자 이메일과 전화번호 가져오기 (다양한 필드명 지원)
    const userEmail = userInfo?.email || '';
    // phoneNumber는 입력 필드 값 우선, 없으면 userInfo에서 찾기 (phoneNumber 또는 phone)
    const userPhone = phoneNumber || userInfo?.phoneNumber || userInfo?.phone || '';
    
    console.log('📧 [Booking] 사용자 정보:', { userInfo, phoneNumber, userEmail, userPhone });
    
    return {
      hotelName: hotel?.name || '해튼호텔',
      roomName: room ? `${room.name} - ${room.description}` : '객실 정보',
      address: hotel?.address || '서울특별시 중구 을지로 12',
      city,
      country,
      image: hotel?.image || '',
      checkInDateLabel: formatTicketDate(checkIn),
      checkOutDateLabel: formatTicketDate(checkOut),
      checkInTime: '12:00pm',
      checkOutTime: '11:30pm',
      arrivalInfo: '결제 완료',
      guestName: userName,
      guestEmail: userEmail,
      guestPhone: userPhone,
      guestCount: guests,
      bookingNumber,
      barcode: '|| ||| | |||| |||',
      totalPrice: total,
      bookingId: `${id || '1'}-${roomId || '1'}`,
      createdAt: new Date().toISOString(),
    };
  }, [hotel?.name, hotel?.address, room, city, country, checkIn, checkOut, guests, roomId, total, id, userInfo, phoneNumber]);

  const handleConfirmPayment = async () => {
    if (!checkIn || !checkOut) {
      setError('체크인/체크아웃 날짜를 선택해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Backend에 보낼 예약 데이터 구성
      // actualRoom의 _id를 사용하거나, 없으면 roomId 사용
      const actualRoomId = actualRoom?._id || actualRoom?.id || roomId;
      
      // 사용자 이름 가져오기
      const userName = userInfo?.displayName || userInfo?.name || '게스트';
      
      const bookingData = {
        lodgingId: id,
        roomId: actualRoomId,
        checkIn: checkIn,
        checkOut: checkOut,
        guests: parseInt(guests) || 2,
        rooms: parseInt(rooms) || 1,
        price: total,
        userName: userName,
        userPhone: phoneNumber || '',
        // 결제는 실제 포트원 연동 시 paymentId를 받아서 전달
        // 현재는 임시로 결제 완료 상태로 처리
        paymentId: `temp_${Date.now()}`,
      };

      // API 호출
      const response = await createBooking(bookingData);
      
      // 예약 성공 시 payload 구성
      const payload = buildBookingPayload();
      
      // 디버깅: payload 확인
      console.log('📋 [Booking] 예약 확인 페이지로 전달할 데이터:', payload);
      
      // 응답 데이터로 업데이트
      const bookingResponse = response.data || response.data?.data || response;
      if (bookingResponse) {
        payload.bookingId = bookingResponse._id || bookingResponse.id || payload.bookingId;
        payload.bookingNumber = bookingResponse.bookingNumber || payload.bookingNumber;
      }

      // localStorage에 저장 (히스토리용)
      try {
        const stored = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
        const filtered = stored.filter((item) => item.bookingNumber !== payload.bookingNumber);
        const updated = [payload, ...filtered].slice(0, 10);
        localStorage.setItem('bookingHistory', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to store booking history', error);
      }

      setIsPaymentModalOpen(false);
      navigate('/booking-confirmation', { state: payload });
    } catch (err) {
      console.error('Failed to create booking', err);
      setError(getErrorMessage(err, '예약에 실패했습니다. 다시 시도해주세요.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hotel) {
    return (
      <div className="booking-page">
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
    <div className="booking-page">
      <Header />
      
      <div className="booking-container">
        <div className="booking-main">
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
                  <span>{hotel.name}</span>
                </>
              );
            })()}
          </div>

          {/* Room Title */}
          <div className="room-title-section">
            <h1 className="room-title">{room?.name} - {room?.description}</h1>
            <span className="room-price-header">₩{baseFare.toLocaleString()}/night</span>
          </div>

          {/* Hotel Info Card */}
          <div className="hotel-info-card">
            <h2 className="card-title">{hotel.name}</h2>
            <p className="hotel-address">
              <FiMapPin /> {hotel.address}
            </p>
          </div>

          {/* Date Selection */}
          <div className="date-selection-card">
            <div className="date-item">
              <FiCalendar />
              <div className="date-info">
                <span className="date-label">체크인</span>
                <span className="date-value">{checkIn ? formatDate(checkIn) : '날짜 선택'}</span>
              </div>
            </div>
            <div className="date-item">
              <FiCalendar />
              <div className="date-info">
                <span className="date-label">체크아웃</span>
                <span className="date-value">{checkOut ? formatDate(checkOut) : '날짜 선택'}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="payment-method-section">
            <h2 className="section-title">결제 방법</h2>
            <div className="payment-methods">
              {paymentMethods.map((method) => (
                <label className="payment-method" key={method.id}>
                  <div className="method-main">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedCard === method.id}
                      onChange={(e) => setSelectedCard(e.target.value)}
                      disabled={!isEditing}
                    />
                    <div className="method-content">
                      <FiCreditCard />
                      <span>{method.label}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="method-delete"
                    onClick={(e) => handleDeleteCard(method.id, e)}
                    disabled={!isEditing || method.id === 'card1'}
                  >
                    삭제
                  </button>
                </label>
              ))}
              <div
                className={`add-card-option ${!isEditing ? 'disabled' : ''}`}
                onClick={() => isEditing && setIsAddCardModalOpen(true)}
              >
                <FiPlus />
                <span>새 카드 추가</span>
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="coupon-section">
            <h2 className="section-title">쿠폰 적용</h2>
            <div className="coupon-form">
              <input
                type="text"
                className="coupon-input"
                placeholder="쿠폰 코드를 입력하세요"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!isEditing}
              />
              <button
                className="btn primary coupon-button"
                onClick={handleApplyCoupon}
                disabled={!isEditing}
              >
                적용
              </button>
            </div>
            {couponMessage && (
              <p className={`coupon-message ${discountAmount > 0 ? 'success' : 'error'}`}>
                {couponMessage}
              </p>
            )}
          </div>

          {/* Contact Info */}
          <div className="contact-info-section">
            <h2 className="section-title">예약자 연락처</h2>
            <label className="contact-input-label">
              핸드폰 번호
              <input
                className="contact-input"
                type="tel"
                placeholder="'-' 없이 입력해주세요"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                maxLength={11}
                disabled={!isEditing}
              />
            </label>
            <p className="contact-info-helper">입력하신 번호로 예약 확인 문자가 전송됩니다.</p>
          </div>
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '1rem', padding: '1rem', background: '#fee', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          <div className="next-button-container">
            {isEditing ? (
              <button
                className="btn primary next-button"
                onClick={() => setIsSummaryVisible(true)}
                disabled={phoneNumber.length !== 11}
              >
                다음 단계
              </button>
            ) : (
              <>
                <p className="next-button-helper">예약정보 요약을 확인한 후 결제를 진행하세요.</p>
                <button className="btn secondary prev-button" onClick={() => setIsSummaryVisible(false)}>
                  이전 단계
                </button>
              </>
            )}
          </div>
        </div>

        {/* Booking Summary */}
        <div className={`booking-summary ${isSummaryVisible ? 'active' : 'inactive'}`}>
          <div className="summary-image">
            <img src={hotel.image} alt={hotel.name} />
          </div>
          <div className="summary-content">
            <h2 className="summary-title">예약정보 요약</h2>
            <h3 className="summary-hotel-name">{hotel.name}</h3>
            <p className="summary-room-name">{room?.name} - {room?.description}</p>
            <div className="summary-rating">
              <span className="rating-score">{hotel.reviewScore}</span>
              <span className="rating-text">{hotel.reviewText}</span>
              <span className="rating-count">54개 리뷰</span>
            </div>
            <p className="protection-text">해당 예약은 golobe에서 안전하게 보호됩니다.</p>
            <div className="summary-guest-info">
              <FiUsers />
              <span>객실 {rooms}개 · 투숙객 {guests}명</span>
            </div>
            
            <div className="price-breakdown">
              <div className="price-row">
                <span>기본 요금</span>
                <span>₩{baseFare.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span>할인</span>
                <span>-₩{discountAmount.toLocaleString()}</span>
              </div>
              {taxes > 0 && (
                <div className="price-row">
                  <span>세금</span>
                  <span>₩{taxes.toLocaleString()}</span>
                </div>
              )}
              {serviceFee > 0 && (
                <div className="price-row">
                  <span>서비스 수수료</span>
                  <span>₩{serviceFee.toLocaleString()}</span>
                </div>
              )}
              <div className="price-row total">
                <span>총 금액</span>
                <span>₩{total.toLocaleString()}</span>
              </div>
            </div>
            <div className="summary-actions">
              <button
                className="btn primary pay-button"
                disabled={isEditing}
                onClick={() => setIsPaymentModalOpen(true)}
                data-state={isEditing ? 'disabled' : 'enabled'}
              >
                결제하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {isPaymentModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>결제를 진행하시겠습니까?</h2>
            <p>결제 완료 후 예약이 확정됩니다.</p>
            {error && (
              <div className="error-message" style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem' }}>
                {error}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setIsPaymentModalOpen(false)}>
                취소
              </button>
              <button
                className="btn primary"
                onClick={handleConfirmPayment}
                disabled={isSubmitting}
              >
                {isSubmitting ? '처리 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddCardModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCardModalOpen(false)}>
          <div className="add-card-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsAddCardModalOpen(false)} aria-label="닫기">
              ×
            </button>
            <h2 className="add-card-title">카드 추가</h2>
            <form className="add-card-form" onSubmit={handleAddCardSubmit}>
              <label className="modal-field">
                카드 번호
                <input
                  type="text"
                  value={newCard.cardNumber}
                  onChange={(e) => handleNewCardChange('cardNumber', e.target.value)}
                  placeholder="4321 4321 4321 4321"
                  required
                />
              </label>
              <div className="modal-field inline">
                <label>
                  만료일 (MM/YY)
                  <input
                    type="text"
                    value={newCard.expDate}
                    onChange={(e) => handleNewCardChange('expDate', e.target.value)}
                    placeholder="02/27"
                    required
                  />
                </label>
                <label>
                  CVC
                  <input
                    type="text"
                    value={newCard.cvc}
                    onChange={(e) => handleNewCardChange('cvc', e.target.value)}
                    placeholder="123"
                    required
                  />
                </label>
              </div>
              <label className="modal-field">
                카드 명의자
                <input
                  type="text"
                  value={newCard.cardName}
                  onChange={(e) => handleNewCardChange('cardName', e.target.value)}
                  placeholder="홍길동"
                  required
                />
              </label>
              <label className="modal-field">
                국가 또는 지역
                <select
                  value={newCard.country}
                  onChange={(e) => handleNewCardChange('country', e.target.value)}
                >
                  <option value="대한민국">대한민국</option>
                  <option value="미국">미국</option>
                  <option value="일본">일본</option>
                  <option value="영국">영국</option>
                </select>
              </label>
              <label className="save-info-checkbox">
                <input
                  type="checkbox"
                  checked={newCard.saveInfo}
                  onChange={(e) => handleNewCardChange('saveInfo', e.target.checked)}
                />
                정보 저장하기
              </label>
              <div className="modal-actions">
                <button type="button" className="btn secondary" onClick={() => setIsAddCardModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn primary">
                  카드 추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
