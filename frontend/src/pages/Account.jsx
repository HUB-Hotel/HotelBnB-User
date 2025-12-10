import React, { useState, useEffect } from 'react';
import { FiUpload, FiEdit2, FiX, FiUser, FiCreditCard, FiPlus, FiTrash2 } from 'react-icons/fi';
import { getUserInfo, updateUserInfo, changePassword } from '../api/userApi';
import { getErrorMessage } from '../api/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './style/Account.scss';

const defaultCoverImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
];

const defaultProfileOptions = [
  { color: '#2f6a57', icon: FiUser },
  { color: '#5b7a6b', icon: FiUser },
  { color: '#d4e8df', icon: FiUser },
  { color: '#ffe5d9', icon: FiUser }, // 파스텔 피치
  { color: '#ffd6e8', icon: FiUser }, // 파스텔 핑크
  { color: '#d6e5fa', icon: FiUser }, // 파스텔 블루
  { color: '#fff4d6', icon: FiUser }, // 파스텔 옐로우
  { color: '#e8d5ff', icon: FiUser }, // 파스텔 퍼플
  { color: '#d5f4e6', icon: FiUser }, // 파스텔 민트
  { color: '#ffe0cc', icon: FiUser }, // 파스텔 오렌지
  { color: '#f0e6ff', icon: FiUser }, // 파스텔 라벤더
  { color: '#e0f2f1', icon: FiUser }, // 파스텔 틸
];

const Account = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [userInfo, setUserInfo] = useState({
    displayName: '',
    email: '',
    phone: '',
  });
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [coverImage, setCoverImage] = useState(defaultCoverImages[0]);
  const [profileOption, setProfileOption] = useState(defaultProfileOptions[0]);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expDate: '',
    cvc: '',
    cardName: '',
    country: '대한민국',
    saveInfo: true,
  });

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const response = await getUserInfo();
        // Backend 응답: { data: {...}, message: "...", resultCode: 200 }
        const userData = response.data || response.data?.data || response;
        setUserInfo({
          displayName: userData.displayName || userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
        // localStorage에도 저장 (다른 컴포넌트에서 사용)
        localStorage.setItem('userInfo', JSON.stringify(userData));
      } catch (err) {
        console.error('Failed to load user info', err);
        setError(getErrorMessage(err, '사용자 정보를 불러오는데 실패했습니다.'));
        // localStorage에서 fallback
        const stored = localStorage.getItem('userInfo');
        if (stored) {
          try {
            const fallbackData = JSON.parse(stored);
            setUserInfo({
              displayName: fallbackData.displayName || fallbackData.name || '',
              email: fallbackData.email || '',
              phone: fallbackData.phone || '',
            });
          } catch (e) {
            console.error('Failed to parse stored user info', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleChange = (field, value) => {
    const updatedInfo = {
      ...userInfo,
      [field]: value,
    };
    setUserInfo(updatedInfo);
  };

  const handleEditClick = (field) => {
    setEditingField(field);
    setTempValue(userInfo[field] || '');
  };

  const handleSave = async (field) => {
    try {
      setError('');
      let updateData = {};
      
      if (field === 'password') {
        // 비밀번호 변경
        await changePassword({ newPassword: tempValue });
        alert('비밀번호가 변경되었습니다.');
      } else {
        // 다른 필드 업데이트
        updateData[field === 'name' ? 'displayName' : field] = tempValue;
        const response = await updateUserInfo(updateData);
        
        // 업데이트된 정보로 상태 갱신
        const updatedData = response.data || response.data?.data || response;
        setUserInfo({
          ...userInfo,
          displayName: updatedData.displayName || userInfo.displayName,
          email: updatedData.email || userInfo.email,
          phone: updatedData.phone || userInfo.phone,
        });
        
        // localStorage 업데이트
        localStorage.setItem('userInfo', JSON.stringify(updatedData));
        
        // 이름이 변경되면 Header에 알림
        if (field === 'name') {
          window.dispatchEvent(new Event('userInfoChanged'));
        }
      }
      
      setEditingField(null);
      setTempValue('');
    } catch (err) {
      setError(getErrorMessage(err, '정보 수정에 실패했습니다.'));
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  // localStorage에서 결제수단 불러오기
  useEffect(() => {
    const stored = localStorage.getItem('paymentMethods');
    if (stored) {
      try {
        setPaymentMethods(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load payment methods', error);
      }
    }
  }, []);

  // 결제수단 변경 시 localStorage에 저장
  useEffect(() => {
    if (paymentMethods.length > 0) {
      localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
    }
  }, [paymentMethods]);

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

  const handleAddCardSubmit = (event) => {
    event.preventDefault();
    if (!newCard.cardNumber.trim() || !newCard.cardName.trim() || !newCard.expDate.trim() || !newCard.cvc.trim()) {
      alert('카드 정보를 모두 입력해주세요.');
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

    setPaymentMethods((prev) => [...prev, newMethod]);
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

  const handleDeleteCard = (cardId) => {
    if (window.confirm('이 카드를 삭제하시겠습니까?')) {
      setPaymentMethods((prev) => prev.filter((method) => method.id !== cardId));
    }
  };

  return (
    <div className="account-page">
      <Header />
      <div className="account-container">
        {/* Profile Banner */}
        <div className="profile-banner">
          <div
            className="banner-gradient"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${coverImage})`,
            }}
          >
          </div>
          <div className="profile-picture-wrapper">
            <div className="profile-picture" style={{ background: profileOption.color }}>
              {React.createElement(profileOption.icon, { className: 'profile-icon' })}
              <button className="edit-picture-btn" onClick={() => setShowProfileModal(true)}>
                <FiEdit2 />
              </button>
            </div>
            <div className="profile-info">
              <h1>{userInfo.displayName || userInfo.name || '사용자'}</h1>
              <p>{userInfo.email || '-'}</p>
            </div>
          </div>
        </div>

        {/* Cover Image Selection Modal */}
        {showCoverModal && (
          <div className="modal-overlay" onClick={() => setShowCoverModal(false)}>
            <div className="image-select-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>배경 이미지 선택</h3>
                <button className="close-btn" onClick={() => setShowCoverModal(false)}>
                  <FiX />
                </button>
              </div>
              <div className="image-grid">
                {defaultCoverImages.map((image, index) => (
                  <div
                    key={index}
                    className={`image-option ${coverImage === image ? 'selected' : ''}`}
                    onClick={() => {
                      setCoverImage(image);
                      setShowCoverModal(false);
                    }}
                  >
                    <img src={image} alt={`Cover ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Image Selection Modal */}
        {showProfileModal && (
          <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
            <div className="image-select-modal profile-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>프로필 이미지 선택</h3>
                <button className="close-btn" onClick={() => setShowProfileModal(false)}>
                  <FiX />
                </button>
              </div>
              <div className="image-grid profile-grid">
                {defaultProfileOptions.map((option, index) => {
                  const IconComponent = option.icon;
                  return (
                    <div
                      key={index}
                      className={`image-option ${profileOption.color === option.color ? 'selected' : ''}`}
                      onClick={() => {
                        setProfileOption(option);
                        setShowProfileModal(false);
                      }}
                      style={{ background: option.color }}
                    >
                      <IconComponent className="profile-icon" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="account-tabs">
          <button
            className={`tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            계정
          </button>
          <button
            className={`tab ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            결제수단
          </button>
        </div>

        {/* Account Details Section */}
        {activeTab === 'account' && (
          <div className="account-content">
            <section className="account-details">
              <h2>계정</h2>
              {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
              {loading && <div style={{ marginBottom: '1rem' }}>로딩 중...</div>}
              <div className="info-item">
                <div className="info-label">이름</div>
                {editingField === 'name' ? (
                  <input
                    type="text"
                    className="info-input"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                  />
                ) : (
                  <div className="info-value">{userInfo.displayName || userInfo.name || '-'}</div>
                )}
                {editingField === 'name' ? (
                  <div className="button-group">
                    <button className="save-btn" onClick={() => handleSave('name')}>
                      저장
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      취소
                    </button>
                  </div>
                ) : (
                  <button className="change-btn" onClick={() => handleEditClick('name')}>
                    수정
                  </button>
                )}
              </div>
              <div className="info-item">
                <div className="info-label">이메일</div>
                {editingField === 'email' ? (
                  <input
                    type="email"
                    className="info-input"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                  />
                ) : (
                  <div className="info-value">{userInfo.email}</div>
                )}
                {editingField === 'email' ? (
                  <div className="button-group">
                    <button className="save-btn" onClick={() => handleSave('email')}>
                      저장
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      취소
                    </button>
                  </div>
                ) : (
                  <button className="change-btn" onClick={() => handleEditClick('email')}>
                    수정
                  </button>
                )}
              </div>
              <div className="info-item">
                <div className="info-label">비밀번호</div>
                {editingField === 'password' ? (
                  <input
                    type="password"
                    className="info-input"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                  />
                ) : (
                  <div className="info-value">{userInfo.password}</div>
                )}
                {editingField === 'password' ? (
                  <div className="button-group">
                    <button className="save-btn" onClick={() => handleSave('password')}>
                      저장
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      취소
                    </button>
                  </div>
                ) : (
                  <button className="change-btn" onClick={() => handleEditClick('password')}>
                    수정
                  </button>
                )}
              </div>
              <div className="info-item">
                <div className="info-label">전화번호</div>
                {editingField === 'phone' ? (
                  <input
                    type="tel"
                    className="info-input"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                  />
                ) : (
                  <div className="info-value">{userInfo.phone}</div>
                )}
                {editingField === 'phone' ? (
                  <div className="button-group">
                    <button className="save-btn" onClick={() => handleSave('phone')}>
                      저장
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      취소
                    </button>
                  </div>
                ) : (
                  <button className="change-btn" onClick={() => handleEditClick('phone')}>
                    수정
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="account-content">
            <section className="account-details">
              <h2>결제수단</h2>
              <div className="payment-methods-list">
                {paymentMethods.length === 0 ? (
                  <p className="no-cards-message">등록된 카드가 없습니다.</p>
                ) : (
                  paymentMethods.map((method) => (
                    <div key={method.id} className="payment-method-item">
                      <div className="method-info">
                        <FiCreditCard className="method-icon" />
                        <div className="method-details">
                          <span className="method-label">{method.label}</span>
                          <span className="method-brand">{method.brand}</span>
                        </div>
                      </div>
                      <button
                        className="delete-card-btn"
                        onClick={() => handleDeleteCard(method.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))
                )}
                <button
                  className="add-card-btn"
                  onClick={() => setIsAddCardModalOpen(true)}
                >
                  <FiPlus />
                  <span>카드 추가</span>
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Add Card Modal */}
      {isAddCardModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCardModalOpen(false)}>
          <div className="image-select-modal add-card-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>카드 추가</h3>
              <button className="close-btn" onClick={() => setIsAddCardModalOpen(false)}>
                <FiX />
              </button>
            </div>
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
                    maxLength={3}
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

      <Footer />
    </div>
  );
};

export default Account;

