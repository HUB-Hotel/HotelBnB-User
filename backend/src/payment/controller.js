const { PortOneClient } = require('@portone/server-sdk');

const portone = PortOneClient({
  secret: process.env.PORTONE_API_SECRET,
});

const completePayment = async (req, res, next) => {
  try {
    // 프론트에서 넘어온 결제 ID (paymentId)
    const { paymentId, orderId } = req.body; 

    // 포트원에 결제 정보 조회 요청
    const payment = await portone.payment.getPayment({ paymentId });

    res.status(200).json({ 
      success: true, 
      message: '결제 검증 성공',
      data: payment 
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  completePayment,
};