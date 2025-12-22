const Coupon = require("./model");

// 쿠폰 코드 검증 및 할인 금액 계산
exports.validateCoupon = async (code, totalAmount) => {
  try {
    // 코드는 대소문자 구분 없이 검색
    const coupon = await Coupon.findOne({ 
      code: { $regex: new RegExp(`^${code.trim()}$`, 'i') },
      isActive: true
    });

    if (!coupon) {
      throw { message: "존재하지 않거나 사용할 수 없는 쿠폰입니다.", status: 404 };
    }

    // 날짜 검증 (validUntil 사용)
    // validUntil은 "유효한 날짜까지"를 의미하므로 해당 날짜의 마지막 시간(23:59:59)까지 유효
    if (coupon.validUntil) {
      const now = new Date();
      const validUntilDate = new Date(coupon.validUntil);
      
      // 날짜를 자정으로 설정하고 하루 추가하여 해당 날짜의 23:59:59까지 유효하도록
      validUntilDate.setHours(23, 59, 59, 999);
      
      if (now > validUntilDate) {
        throw { message: "쿠폰 사용 기간이 만료되었습니다.", status: 400 };
      }
    }

    // 사용 횟수 제한 검증
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw { message: "쿠폰 사용 한도에 도달했습니다.", status: 400 };
    }

    // 최소 구매 금액 검증
    if (coupon.minPurchaseAmount && totalAmount < coupon.minPurchaseAmount) {
      throw { 
        message: `최소 구매 금액 ${coupon.minPurchaseAmount.toLocaleString()}원 이상 구매 시 사용 가능합니다.`, 
        status: 400 
      };
    }

    // 할인 금액 계산 (discountPercentage 사용)
    let discountAmount = 0;
    if (coupon.discountPercentage && coupon.discountPercentage > 0) {
      discountAmount = Math.floor(totalAmount * (coupon.discountPercentage / 100));
      // 최대 할인 금액 제한
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    }

    return {
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.title || coupon.name || coupon.code, // title을 name으로 매핑
        description: coupon.description || '',
        discountType: 'percentage',
        discountValue: coupon.discountPercentage || 0
      },
      discountAmount,
      finalAmount: totalAmount - discountAmount
    };
  } catch (err) {
    throw err;
  }
};

// 쿠폰 사용 횟수 증가
exports.incrementCouponUsage = async (couponId) => {
  try {
    await Coupon.findByIdAndUpdate(couponId, {
      $inc: { usedCount: 1 }
    });
  } catch (err) {
    console.error("쿠폰 사용 횟수 증가 실패:", err);
  }
};

