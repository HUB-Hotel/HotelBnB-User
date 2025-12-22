require('dotenv').config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const passport = require('./src/config/passport'); 

// ✅ DB 연결 함수
const connectDB = require("./src/config/db");

// ✅ 각 기능별 라우트 불러오기
const authRoutes = require("./src/auth/route");
const lodgingRoutes = require("./src/lodging/route");
const roomRoutes = require("./src/room/route");
const bookingRoutes = require("./src/booking/route");
const reviewRoutes = require("./src/review/route");
const bookmarkRoutes = require("./src/bookmark/route");
const paymentRoutes = require("./src/payment/route");
const couponRoutes = require("./src/coupon/route"); 

const app = express();
// Windows에서 포트 권한 문제가 있을 수 있으므로 더 높은 포트 사용
const PORT = process.env.PORT || 5000;

// 간단한 헬스 체크 엔드포인트 (라우트 등록 전)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// DB 연결
connectDB();

// 미들웨어
app.use(cors({ origin: process.env.FRONT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// API 주소 연결
app.use("/api/auth", authRoutes);
app.use("/api/lodgings", lodgingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/coupons", couponRoutes);

// 에러 핸들링
app.use((req, res, next) => res.status(404).json({ success: false, message: 'Not Found' }));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
});

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Access at http://localhost:${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('다른 프로세스를 종료하거나 다른 포트를 사용하세요.');
    } else if (err.code === 'EACCES') {
        console.error(`❌ Permission denied for port ${PORT}`);
        console.error('관리자 권한으로 실행하거나 다른 포트를 사용하세요.');
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});