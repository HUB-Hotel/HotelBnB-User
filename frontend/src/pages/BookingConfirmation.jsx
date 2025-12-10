import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  FiShare2,
  FiDownload,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import JsBarcode from 'jsbarcode';
import { getBookingDetail, cancelBooking, getBookings } from '../api/bookingApi';
import { getErrorMessage } from '../api/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './style/BookingConfirmation.scss';

const defaultBooking = {
  hotelName: '해튼호텔',
  roomName: 'Superior room - 1 double bed or 2 twin beds',
  address: 'Gümüssuyu Mah. İnönü Cad. No:8, Istanbul 34437',
  city: 'Istanbul',
  country: 'Turkey',
  image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  checkInDateLabel: 'Dec 8 (Thu)',
  checkOutDateLabel: 'Dec 9 (Fri)',
  checkInTime: '12:00pm',
  checkOutTime: '11:30pm',
  arrivalInfo: '결제 완료',
  guestName: 'James Doe',
  guestCount: 2,
  bookingNumber: '20250123',
  barcode: '|| ||| | |||| |||',
  totalPrice: 240000,
  guestEmail: 'james.doe@email.com',
  guestPhone: '+82 10-2345-6789',
  specialRequests: '늦은 체크아웃 요청',
  paymentMethod: 'Visa •••• 9421',
  paymentStatus: '결제 완료',
  roomCharge: 320000,
  serviceFee: 15000,
  taxes: 15000,
  hotelPhone: '+82 2-987-6543',
  hotelEmail: 'contact@hatonhotel.com',
  supportHours: '연중무휴 24시간',
};

const getStoredHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('bookingHistory')) || [];
  } catch (error) {
    console.error('Failed to read booking history', error);
    return [];
  }
};

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(location.state || defaultBooking);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasNoBookings, setHasNoBookings] = useState(false);
  const barcodeRef = useRef(null);

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '-';
    return `₩${Number(value).toLocaleString()}`;
  };

  // 예약 상세 조회 (bookingId가 URL에 있는 경우)
  useEffect(() => {
    const loadBookingDetail = async () => {
      if (bookingId) {
        try {
          setIsLoading(true);
          const response = await getBookingDetail(bookingId);
          const bookingData = response.data || response.data?.data || response;
          if (bookingData) {
            // Backend 응답을 Frontend 형식으로 변환
            const formattedBooking = {
              ...booking,
              bookingId: bookingData._id || bookingData.id,
              bookingNumber: bookingData.bookingNumber || booking.bookingNumber,
              hotelName: bookingData.lodgingId?.lodgingName || bookingData.lodging?.lodgingName || booking.hotelName,
              roomName: bookingData.roomId?.name || bookingData.room?.name || booking.roomName,
              checkInDateLabel: bookingData.checkIn ? new Date(bookingData.checkIn).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' }) : booking.checkInDateLabel,
              checkOutDateLabel: bookingData.checkOut ? new Date(bookingData.checkOut).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' }) : booking.checkOutDateLabel,
              totalPrice: bookingData.price || booking.totalPrice,
              guestName: bookingData.userName || booking.guestName,
              guestEmail: bookingData.guestEmail || booking.guestEmail,
              guestPhone: bookingData.guestPhone || booking.guestPhone,
              status: bookingData.status || 'confirmed',
            };
            setBooking(formattedBooking);
          }
        } catch (err) {
          console.error('Failed to load booking detail', err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadBookingDetail();
  }, [bookingId]);

  useEffect(() => {
    const storedHistory = getStoredHistory();
    if (location.state) {
      // location.state에 bookingId가 없으면 추가
      const stateWithId = {
        ...location.state,
        bookingId: location.state.bookingId || location.state._id || location.state.id,
      };
      
      // bookingId가 있으면 백엔드에서 검증 (자신의 예약인지 확인)
      if (stateWithId.bookingId) {
        const verifyBooking = async () => {
          try {
            const response = await getBookingDetail(stateWithId.bookingId);
            const bookingData = response.data || response.data?.data || response;
            if (bookingData) {
              // 백엔드에서 검증된 데이터로 업데이트
              const verifiedBooking = {
                ...stateWithId,
                bookingId: bookingData._id || bookingData.id,
                status: bookingData.status || stateWithId.status || 'confirmed',
              };
              setBooking(verifiedBooking);
            } else {
              setBooking(stateWithId);
            }
          } catch (err) {
            // 권한 없음(403) 또는 예약 없음(404)인 경우
            console.error('Failed to verify booking ownership', err);
            if (err.response?.status === 403 || err.response?.status === 404) {
              alert('이 예약에 접근할 수 없습니다. 자신의 예약만 조회할 수 있습니다.');
              // 백엔드에서 최신 목록 가져오기
              try {
                const bookingsResponse = await getBookings();
                const bookingsData = bookingsResponse.data || bookingsResponse.data?.data || bookingsResponse || [];
                if (Array.isArray(bookingsData) && bookingsData.length > 0) {
                  const firstBooking = {
                    ...bookingsData[0],
                    bookingId: bookingsData[0]._id || bookingsData[0].id,
                  };
                  setBooking(firstBooking);
                  const cleanedHistory = bookingsData.map(item => ({
                    ...item,
                    bookingId: item._id || item.id,
                  }));
                  setBookingHistory(cleanedHistory);
                  localStorage.setItem('bookingHistory', JSON.stringify(cleanedHistory));
                } else {
                  setBooking(defaultBooking);
                  setBookingHistory([]);
                }
              } catch (bookingsErr) {
                console.error('Failed to load bookings', bookingsErr);
                setBooking(defaultBooking);
                setBookingHistory([]);
              }
            } else {
              // 다른 에러인 경우 그냥 표시 (네트워크 에러 등)
              setBooking(stateWithId);
            }
          }
        };
        verifyBooking();
      } else {
        setBooking(stateWithId);
      }
    } else if (storedHistory.length && !bookingId) {
      // 저장된 히스토리에서 첫 번째 예약 로드
      // 백엔드에서 최신 목록 가져와서 검증 (자신의 예약만 표시)
      const loadVerifiedBooking = async () => {
        try {
          const response = await getBookings();
          const bookingsData = response.data || response.data?.data || response || [];
          if (Array.isArray(bookingsData) && bookingsData.length > 0) {
            // 백엔드에서 가져온 데이터는 이미 현재 사용자의 예약만 포함하므로 안전
            const firstBooking = {
              ...bookingsData[0],
              bookingId: bookingsData[0]._id || bookingsData[0].id,
            };
            setBooking(firstBooking);
            // 히스토리도 백엔드 데이터로 업데이트
            const cleanedHistory = bookingsData.map(item => ({
              ...item,
              bookingId: item._id || item.id,
            }));
            setBookingHistory(cleanedHistory);
            localStorage.setItem('bookingHistory', JSON.stringify(cleanedHistory));
          } else {
            // 백엔드에 예약이 없으면 안내 메시지 표시
            setHasNoBookings(true);
            setBooking(defaultBooking);
            setBookingHistory([]);
            localStorage.setItem('bookingHistory', JSON.stringify([]));
          }
        } catch (err) {
          console.error('Failed to load bookings from backend', err);
          // 에러인 경우 안내 메시지 표시
          setHasNoBookings(true);
          setBooking(defaultBooking);
          setBookingHistory([]);
        }
      };
      loadVerifiedBooking();
    }
    // 히스토리도 bookingId 포함하도록 정리
    const cleanedHistory = storedHistory.map(item => ({
      ...item,
      bookingId: item.bookingId || item._id || item.id,
    }));
    setBookingHistory(cleanedHistory);
  }, [location.state, bookingId]);

  // 바코드 생성
  useEffect(() => {
    if (barcodeRef.current && booking.bookingNumber) {
      try {
        // 기존 바코드 제거
        barcodeRef.current.innerHTML = '';
        // CSS 변수에서 테마 색상 가져오기
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#2f6a57';
        JsBarcode(barcodeRef.current, booking.bookingNumber, {
          format: 'CODE128',
          width: 2,
          height: 40,
          displayValue: false,
          background: 'transparent',
          lineColor: primaryColor,
          margin: 0,
        });
      } catch (error) {
        console.error('바코드 생성 실패:', error);
      }
    }
  }, [booking.bookingNumber]);

  const breadcrumbItems = [
    booking.country || '대한민국',
    booking.city || '서울',
    booking.hotelName || '해튼호텔',
  ];

  const handleDownload = () => {
    window.print();
  };

  const handleBackToSearch = () => {
    navigate('/search');
  };

  const handleSelectBooking = async (item) => {
    // bookingId가 없으면 추가
    const itemWithId = {
      ...item,
      bookingId: item.bookingId || item._id || item.id,
    };
    
    // bookingId가 있으면 백엔드에서 검증
    if (itemWithId.bookingId) {
      try {
        const response = await getBookingDetail(itemWithId.bookingId);
        const bookingData = response.data || response.data?.data || response;
        if (bookingData) {
          // 백엔드에서 검증된 데이터로 업데이트
          const verifiedBooking = {
            ...itemWithId,
            bookingId: bookingData._id || bookingData.id,
            bookingNumber: bookingData.bookingNumber || itemWithId.bookingNumber,
            hotelName: bookingData.lodgingId?.lodgingName || bookingData.lodging?.lodgingName || itemWithId.hotelName,
            roomName: bookingData.roomId?.name || bookingData.room?.name || itemWithId.roomName,
            checkInDateLabel: bookingData.checkIn ? new Date(bookingData.checkIn).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' }) : itemWithId.checkInDateLabel,
            checkOutDateLabel: bookingData.checkOut ? new Date(bookingData.checkOut).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' }) : itemWithId.checkOutDateLabel,
            totalPrice: bookingData.price || itemWithId.totalPrice,
            guestName: bookingData.userName || itemWithId.guestName,
            guestEmail: bookingData.guestEmail || itemWithId.guestEmail,
            guestPhone: bookingData.guestPhone || itemWithId.guestPhone,
            status: bookingData.status || itemWithId.status || 'confirmed',
          };
          setBooking(verifiedBooking);
        } else {
          setBooking(itemWithId);
        }
      } catch (err) {
        // 권한 없음(403) 또는 예약 없음(404)인 경우
        console.error('Failed to verify booking ownership', err);
        if (err.response?.status === 403 || err.response?.status === 404) {
          alert('이 예약에 접근할 수 없습니다. 자신의 예약만 조회할 수 있습니다.');
          // 목록에서 제거
          const filteredHistory = bookingHistory.filter(b => 
            (b.bookingId || b._id || b.id) !== itemWithId.bookingId
          );
          setBookingHistory(filteredHistory);
          localStorage.setItem('bookingHistory', JSON.stringify(filteredHistory));
          
          // 다른 예약이 있으면 첫 번째 예약 선택
          if (filteredHistory.length > 0) {
            handleSelectBooking(filteredHistory[0]);
          } else {
            setBooking(defaultBooking);
          }
          return;
        }
        // 다른 에러인 경우 그냥 표시 (네트워크 에러 등)
        setBooking(itemWithId);
      }
    } else {
      setBooking(itemWithId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatHistoryDate = (isoString) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return '-';
    }
  };

  return (
    <div className="booking-confirmation-page">
      <Header />
      <div className="booking-confirmation-container">
        <div className="breadcrumbs">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item}>
              <span>{item}</span>
              {index < breadcrumbItems.length - 1 && <span className="separator">&gt;</span>}
            </React.Fragment>
          ))}
        </div>

        {hasNoBookings && bookingHistory.length === 0 && (
          <section className="no-bookings-section">
            <div className="no-bookings-content">
              <h2>예약 내역이 없습니다</h2>
              <p>아직 예약한 숙소가 없습니다. 새로운 숙소를 찾아보세요!</p>
              <button className="btn primary" onClick={() => navigate('/search')}>
                숙소 검색하기
              </button>
            </div>
          </section>
        )}

        {bookingHistory.length > 0 && (
          <section className="booking-history-section">
            <div className="section-header">
              <div className="section-copy">
                <h2>예약 내역</h2>
                <p>최신 예약부터 최대 10건까지 확인할 수 있습니다.</p>
              </div>
              <button
                type="button"
                className="toggle-history"
                onClick={() => setIsHistoryOpen((prev) => !prev)}
                aria-expanded={isHistoryOpen}
              >
                {isHistoryOpen ? '접기' : '펼치기'}
              </button>
            </div>
            {isHistoryOpen && (
              <div className="history-list">
                {bookingHistory.map((item) => {
                  const isActive = item.bookingNumber === booking.bookingNumber;
                  return (
                    <article
                      key={`${item.bookingNumber}_${item.createdAt}`}
                      className={`history-card ${isActive ? 'active' : ''}`}
                    >
                      <div className="history-main">
                        <strong>{item.hotelName}</strong>
                        <span>{item.roomName}</span>
                      </div>
                      <div className="history-meta">
                        <span>
                          {item.checkInDateLabel} - {item.checkOutDateLabel}
                        </span>
                        <span>{formatHistoryDate(item.createdAt)}</span>
                      </div>
                      <button type="button" onClick={() => handleSelectBooking(item)}>
                        상세 보기
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {!hasNoBookings && (
          <>
        <div className="confirmation-header">
          <div className="header-info">
            <h1>{booking.hotelName}</h1>
            <p>
              <FiMapPin />
              {booking.address}
            </p>
          </div>
          <div className="header-actions">
            <span className="price">₩{(booking.totalPrice || 0).toLocaleString()}/night</span>
            <div className="action-buttons">
              <button className="icon-button" aria-label="공유하기">
                <FiShare2 />
              </button>
              <button className="btn primary" onClick={handleDownload}>
                <FiDownload />
                Download
              </button>
            </div>
          </div>
        </div>

        <div className="ticket-card">
          <div className="ticket-main">
            <div className="ticket-dates">
              <div className="date-block">
                <span className="label">체크인</span>
                <strong>{booking.checkInDateLabel}</strong>
              </div>
              <div className="date-divider"></div>
              <div className="date-block">
                <span className="label">체크아웃</span>
                <strong>{booking.checkOutDateLabel}</strong>
              </div>
            </div>

            <div className="ticket-body">
              <div className="guest-info">
                <div className="avatar">{booking.guestName?.[0] || 'J'}</div>
                <div className="guest-details">
                  <span className="guest-name">{booking.guestName}</span>
                  <span className="room-name">{booking.roomName}</span>
                </div>
                <div className="stay-meta">
                  <div>
                    <span className="label">체크인 시간</span>
                    <strong>{booking.checkInTime}</strong>
                  </div>
                  <div>
                    <span className="label">체크아웃 시간</span>
                    <strong>{booking.checkOutTime}</strong>
                  </div>
                  <div>
                    <span className="label">결제 상태</span>
                    <strong>{booking.arrivalInfo}</strong>
                  </div>
                </div>
              </div>

              <div className="ticket-footer">
                <div className="ticket-code">
                  <span className="label">예약 코드</span>
                  <div className="code-barcode-wrapper">
                    <strong>{booking.bookingNumber}</strong>
                    <svg ref={barcodeRef} className="barcode" />
                  </div>
                </div>
                {booking.bookingId && booking.status !== 'cancelled' && (
                  <button
                    className="btn secondary cancel-booking-btn"
                    onClick={() => setShowCancelModal(true)}
                  >
                    <FiX /> 예약 취소
                  </button>
                )}
              </div>

              <div className="ticket-extra">
                <article className="info-card compact">
                  <div className="info-card-header">
                    <h2>게스트 정보</h2>
                    <span>{`${parseInt(booking.guestCount, 10) || 1}명`}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>대표 투숙객</dt>
                      <dd>{booking.guestName}</dd>
                    </div>
                    <div>
                      <dt>이메일</dt>
                      <dd>{booking.guestEmail && booking.guestEmail.trim() ? booking.guestEmail : '등록되지 않음'}</dd>
                    </div>
                    <div>
                      <dt>연락처</dt>
                      <dd>{booking.guestPhone && booking.guestPhone.trim() ? booking.guestPhone : '-'}</dd>
                    </div>
                    <div>
                      <dt>특별 요청</dt>
                      <dd>{booking.specialRequests || '없음'}</dd>
                    </div>
                  </dl>
                </article>

                <article className="info-card compact">
                  <div className="info-card-header">
                    <h2>연락처 / 헬프라인</h2>
                    <span>24/7</span>
                  </div>
                  <dl>
                    <div>
                      <dt>호텔 대표번호</dt>
                      <dd>{booking.hotelPhone || '-'}</dd>
                    </div>
                    <div>
                      <dt>이메일</dt>
                      <dd>{booking.hotelEmail || 'info@example.com'}</dd>
                    </div>
                    <div>
                      <dt>운영 시간</dt>
                      <dd>{booking.supportHours || '연중무휴'}</dd>
                    </div>
                    <div>
                      <dt>긴급 지원</dt>
                      <dd>
                        고객센터 앱 채팅 또는 <a href="mailto:help@golobe.com">help@golobe.com</a>
                      </dd>
                    </div>
                  </dl>
                </article>
              </div>
            </div>
          </div>

          <div className="ticket-side">
            {booking.image && (
              <div className="ticket-photo">
                <img src={booking.image} alt={`${booking.hotelName} 이미지`} />
              </div>
            )}
            <div className="logo-placeholder">
              <span className="brand">{booking.hotelName}</span>
              <p>{booking.address}</p>
            </div>
            <div className="ticket-summary">
              <div>
                <FiCalendar />
                <span>
                  {booking.checkInDateLabel} - {booking.checkOutDateLabel}
                </span>
              </div>
              <div>
                <FiClock />
                <span>
                  {booking.checkInTime} · {booking.checkOutTime}
                </span>
              </div>
              <div>
                <FiUsers />
                <span>최대 {parseInt(booking.guestCount, 10) || 2}명</span>
              </div>
            </div>
          </div>
        </div>

        <section className="payment-section">
          <article className="info-card">
            <div className="info-card-header">
              <h2>결제 상세</h2>
              <span>{booking.paymentStatus || booking.arrivalInfo}</span>
            </div>
            <dl>
              <div>
                <dt>객실 요금</dt>
                <dd>{formatCurrency(booking.roomCharge || booking.totalPrice)}</dd>
              </div>
              <div>
                <dt>서비스 & 수수료</dt>
                <dd>{formatCurrency(booking.serviceFee)}</dd>
              </div>
              <div>
                <dt>세금</dt>
                <dd>{formatCurrency(booking.taxes)}</dd>
              </div>
              <div className="total">
                <dt>총 결제 금액</dt>
                <dd>{formatCurrency(booking.totalPrice)}</dd>
              </div>
              <div>
                <dt>결제 수단</dt>
                <dd>{booking.paymentMethod || '현장 결제'}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section className="terms-section">
          <h2>이용 약관</h2>
          <div className="terms-columns">
            <div>
              <h3>결제 안내</h3>
              <ul>
                <li>결제 정보가 정확하지 않은 경우 예약이 취소될 수 있습니다.</li>
                <li>결제 과정에서 이상 거래가 감지되면 추가 인증을 요청드릴 수 있습니다.</li>
                <li>체크인 시 사용한 카드와 신분증을 지참해 주세요.</li>
              </ul>
            </div>
            <div>
              <h3>취소 및 변경</h3>
              <ul>
                <li>호텔 정책에 따라 취소 수수료가 발생할 수 있습니다.</li>
                <li>객실 변경은 고객센터를 통해 요청 가능합니다.</li>
                <li>추가 문의는 help@golobe.com 으로 연락 주세요.</li>
              </ul>
            </div>
          </div>
          <div className="contact-card">
            <h3>문의하기</h3>
            <p>Golobe Group Q.S.C, Doha, State of Qatar</p>
            <p>
              이메일: <a href="mailto:help@golobe.com">help@golobe.com</a>
            </p>
          </div>
        </section>

        {!hasNoBookings && (
          <button className="btn primary back-button" onClick={handleBackToSearch}>
            다른 숙소 둘러보기
          </button>
        )}
          </>
        )}
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>예약 취소</h2>
            <p>정말로 이 예약을 취소하시겠습니까?</p>
            <p className="warning-text">취소된 예약은 복구할 수 없습니다.</p>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowCancelModal(false)}>
                아니오
              </button>
              <button
                className="btn primary"
                onClick={async () => {
                  try {
                    const bookingIdToCancel = booking.bookingId || booking._id || booking.id;
                    if (!bookingIdToCancel) {
                      alert('예약 ID가 없습니다.');
                      return;
                    }
                    await cancelBooking(bookingIdToCancel);
                    alert('예약이 취소되었습니다.');
                    setShowCancelModal(false);
                    
                    // 예약 목록 새로고침 (취소된 예약은 자동으로 제외됨)
                    const response = await getBookings();
                    const bookingsData = response.data || response.data?.data || response || [];
                    const updatedHistory = Array.isArray(bookingsData)
                      ? bookingsData.map(b => {
                          const bookingId = b._id || b.id;
                          return {
                            ...b,
                            bookingId: bookingId, // bookingId 추가
                            _id: bookingId,
                            id: bookingId,
                            hotelName: b.lodgingId?.lodgingName || b.lodging?.lodgingName || b.hotelName || '',
                            roomName: b.roomId?.name || b.room?.name || b.roomName || '',
                            checkInDateLabel: b.checkIn ? new Date(b.checkIn).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' }) : (b.checkInDateLabel || ''),
                            checkOutDateLabel: b.checkOut ? new Date(b.checkOut).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' }) : (b.checkOutDateLabel || ''),
                            status: b.status || 'confirmed',
                            totalPrice: b.price || b.totalPrice || 0,
                            guestName: b.userName || b.guestName || '',
                            guestEmail: b.guestEmail || '',
                            guestPhone: b.guestPhone || '',
                          };
                        })
                      : [];
                    setBookingHistory(updatedHistory);
                    localStorage.setItem('bookingHistory', JSON.stringify(updatedHistory));
                    
                    // 취소된 예약이 목록에서 제거되었으므로, 다른 예약이 있으면 첫 번째 예약 선택
                    // 단, 백엔드에서 검증된 예약만 표시되므로 안전함
                    if (updatedHistory.length > 0) {
                      // 백엔드에서 가져온 데이터는 이미 현재 사용자의 예약만 포함하므로 안전
                      const firstBooking = updatedHistory[0];
                      // 추가 검증: bookingId가 있는 경우 상세 조회로 한 번 더 확인
                      if (firstBooking.bookingId) {
                        try {
                          const detailResponse = await getBookingDetail(firstBooking.bookingId);
                          const detailData = detailResponse.data || detailResponse.data?.data || detailResponse;
                          if (detailData) {
                            const verifiedBooking = {
                              ...firstBooking,
                              bookingId: detailData._id || detailData.id,
                              hotelName: detailData.lodgingId?.lodgingName || detailData.lodging?.lodgingName || firstBooking.hotelName,
                              roomName: detailData.roomId?.name || detailData.room?.name || firstBooking.roomName,
                              status: detailData.status || firstBooking.status,
                            };
                            setBooking(verifiedBooking);
                          } else {
                            setBooking(firstBooking);
                          }
                        } catch (err) {
                          // 권한 없음(403) 또는 예약 없음(404)인 경우 다음 예약 시도
                          console.error('Failed to verify booking ownership', err);
                          if (updatedHistory.length > 1) {
                            setBooking(updatedHistory[1]);
                          } else {
                            setBooking(defaultBooking);
                          }
                        }
                      } else {
                        setBooking(firstBooking);
                      }
                    } else {
                      // 예약이 없으면 안내 메시지 표시
                      setHasNoBookings(true);
                      setBooking(defaultBooking);
                    }
                  } catch (err) {
                    alert(getErrorMessage(err, '예약 취소에 실패했습니다.'));
                  }
                }}
              >
                예, 취소합니다
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BookingConfirmation;

