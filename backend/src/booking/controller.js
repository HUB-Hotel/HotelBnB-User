const bookingService = require("./service");
const { successResponse, errorResponse } = require("../common/response");
const { PortOneClient } = require('@portone/server-sdk');

const portone = PortOneClient({
  secret: process.env.PORTONE_API_SECRET,
});

// 예약 생성 (결제 검증 포함)
exports.createBooking = async (req, res) => {
  try {
    const { paymentId, ...bookingData } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!userId) throw new Error("로그인이 필요합니다.");
    if (!paymentId) throw new Error("결제 정보(paymentId)가 없습니다.");

    let paymentKey = paymentId;
    let paymentAmount = Number(bookingData.price);
    
    // 개발 모드: temp_로 시작하는 paymentId는 포트원 검증 우회
    if (paymentId && paymentId.startsWith('temp_') && process.env.NODE_ENV !== 'production') {
      // 개발 모드에서는 검증 없이 진행
    } else {
      // 프로덕션 모드: 실제 포트원 결제 검증
      try {
        const payment = await portone.payment.getPayment({ paymentId });

        if (payment.status !== 'PAID') {
          throw new Error("결제가 완료되지 않았습니다.");
        }

        if (payment.amount.total !== Number(bookingData.price)) {
          throw new Error(`결제 금액 불일치! 요청: ${bookingData.price}, 실제: ${payment.amount.total}`);
        }
        
        paymentKey = paymentId;
        paymentAmount = payment.amount.total;
      } catch (portoneError) {
        throw new Error(`결제 검증 실패: ${portoneError.message}`);
      }
    }

    const newBookingData = {
      ...bookingData,
      paymentKey: paymentKey,
      paymentAmount: paymentAmount,
      status: 'confirmed'
    };

    const data = await bookingService.createBookingService(userId, newBookingData);

    res.status(201).json(successResponse(data, "예약 및 결제가 확정되었습니다!", 201));

  } catch (err) {
    let errorMessage = err.message;
    if (err.message && err.message.includes('ObjectId')) {
      errorMessage = '유효하지 않은 ID 형식입니다. 숫자 ID가 아닌 실제 데이터베이스 ID를 사용해주세요.';
    }
    
    res.status(err.status || 500).json(errorResponse(errorMessage, err.status || 500));
  }
};

// 내 예약 조회
exports.getMyBookings = async (req, res) => {
  try {
    const data = await bookingService.getMyBookingsService(req.user.id);
    res.status(200).json(successResponse(data, "예약 목록 조회 성공", 200));
  } catch (err) {
    res.status(500).json(errorResponse(err.message, 500));
  }
};

// 예약 상세 조회
exports.getBookingDetail = async (req, res) => {
  try {
    const data = await bookingService.getBookingDetailService(req.params.id, req.user.id);
    res.status(200).json(successResponse(data, "예약 상세 조회 성공", 200));
  } catch (err) {
    res.status(err.status || 500).json(errorResponse(err.message, err.status || 500));
  }
};

// 예약 취소
exports.cancelBooking = async (req, res) => {
  try {
    await bookingService.cancelBookingService(req.params.id, req.user.id);
    res.status(200).json(successResponse(null, "예약이 취소되었습니다.", 200));
  } catch (err) {
    res.status(err.status || 500).json(errorResponse(err.message, err.status || 500));
  }
};