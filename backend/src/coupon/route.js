const express = require("express");
const router = express.Router();
const controller = require("./controller");
const { verifyToken } = require("../common/authMiddleware");

// 쿠폰 코드 검증 (로그인 필요)
router.post("/validate", verifyToken, controller.validateCoupon);

module.exports = router;

