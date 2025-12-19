// backend/scripts/updateMinPrice.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../src/config/db');
const Lodging = require('../src/lodging/model');
const Room = require('../src/room/model');

const updateMinPrice = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB 연결 완료\n');

    const lodgings = await Lodging.find({});
    console.log(`📊 총 호텔 수: ${lodgings.length}개\n`);
    console.log('='.repeat(80));

    let updatedCount = 0;

    for (const lodging of lodgings) {
      // 해당 호텔의 모든 활성 객실 조회
      const rooms = await Room.find({ 
        lodgingId: lodging._id,
        status: 'active'
      });

      if (rooms.length === 0) {
        console.log(`⚠️  ${lodging.lodgingName}: 객실이 없어 건너뜁니다.`);
        continue;
      }

      // 가장 낮은 가격 찾기
      const minRoomPrice = Math.min(...rooms.map(r => r.price));
      const oldMinPrice = lodging.minPrice || 0;

      if (minRoomPrice !== oldMinPrice) {
        lodging.minPrice = minRoomPrice;
        await lodging.save();
        updatedCount++;
        
        console.log(`✅ ${lodging.lodgingName}`);
        console.log(`   이전 minPrice: ₩${oldMinPrice.toLocaleString()}`);
        console.log(`   새로운 minPrice: ₩${minRoomPrice.toLocaleString()}`);
        console.log(`   객실 타입 수: ${rooms.length}개\n`);
      } else {
        console.log(`ℹ️  ${lodging.lodgingName}: minPrice가 이미 올바릅니다 (₩${minRoomPrice.toLocaleString()})\n`);
      }
    }

    console.log('='.repeat(80));
    console.log(`✅ 완료! ${updatedCount}개 호텔의 minPrice가 업데이트되었습니다.\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
};

updateMinPrice();