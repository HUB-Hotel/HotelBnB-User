const couponService = require("./service");
const { successResponse, errorResponse } = require("../common/response");

// 쿠폰 코드 검증
exports.validateCoupon = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;

    if (!code) {
      return res.status(400).json(errorResponse("쿠폰 코드를 입력해주세요.", 400));
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json(errorResponse("유효한 총 금액을 입력해주세요.", 400));
    }

    const result = await couponService.validateCoupon(code, totalAmount);

    res.status(200).json(successResponse(result, "쿠폰이 적용되었습니다.", 200));
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "쿠폰 검증 중 오류가 발생했습니다.";
    res.status(status).json(errorResponse(message, status));
  }
};

