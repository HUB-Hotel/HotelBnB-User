const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    // 실제 DB 필드명
    code: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    
    title: {
      type: String,
      required: true,
      trim: true
    },
    
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    
    validUntil: {
      type: Date,
      required: true
    },
    
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    
    // 선택적 필드들
    description: {
      type: String,
      trim: true
    },
    
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    maxDiscountAmount: {
      type: Number,
      default: null
    },
    
    usageLimit: {
      type: Number,
      default: null
    },
    
    usedCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'promotions',
    strict: false // 실제 DB에 있는 추가 필드도 허용
  }
);

// 인덱스 설정
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validUntil: 1 });

module.exports = mongoose.model("Coupon", couponSchema);

