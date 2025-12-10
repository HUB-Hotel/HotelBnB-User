const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error("❌ MONGODB_URI 환경 변수가 설정되지 않았습니다!");
      console.error("환경 변수 확인:");
      console.error("- 로컬 실행: .env 파일에 MONGODB_URI=mongodb://localhost:27017/hotel-project 추가");
      console.error("- Docker 실행: docker-compose.yml의 environment 섹션 확인");
      process.exit(1);
    }

    console.log(`🔄 MongoDB 연결 시도 중... (${mongoURI.replace(/\/\/.*@/, '//***@')})`);
    
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected");
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    
    // 연결 상태 모니터링
    mongoose.connection.on('error', (err) => {
      console.error("❌ MongoDB 연결 에러:", err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn("⚠️ MongoDB 연결이 끊어졌습니다.");
    });
    
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    console.error("전체 에러:", err);
    process.exit(1);
  }
};

module.exports = connectDB;