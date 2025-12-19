// backend/scripts/checkOrphanBookings.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../src/config/db');
const Booking = require('../src/booking/model');
const Room = require('../src/room/model');

const checkOrphanBookings = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB 연결 완료\n');

    // 모든 활성 예약 조회
    const allBookings = await Booking.find({
      status: { $ne: 'cancelled' }
    });

    console.log(`📊 총 활성 예약: ${allBookings.length}개\n`);
    console.log('='.repeat(80));

    // 모든 객실 ID 조회
    const allRooms = await Room.find({});
    const roomIds = new Set(allRooms.map(r => r._id.toString()));

    console.log(`📦 현재 존재하는 객실 수: ${allRooms.length}개\n`);

    // 고아 예약 찾기 (존재하지 않는 roomId를 참조하는 예약)
    const orphanBookings = [];
    const validBookings = [];

    for (const booking of allBookings) {
      const roomIdStr = booking.roomId.toString();
      if (!roomIds.has(roomIdStr)) {
        orphanBookings.push(booking);
      } else {
        validBookings.push(booking);
      }
    }

    console.log('='.repeat(80));
    console.log(`\n📊 분석 결과:\n`);
    console.log(`   ✅ 유효한 예약: ${validBookings.length}개`);
    console.log(`   ⚠️  고아 예약 (삭제된 객실 참조): ${orphanBookings.length}개\n`);

    if (orphanBookings.length > 0) {
      console.log('='.repeat(80));
      console.log(`\n⚠️  고아 예약 상세 정보 (처음 10개만 표시):\n`);
      
      orphanBookings.slice(0, 10).forEach((booking, index) => {
        console.log(`${index + 1}. 예약 ID: ${booking._id}`);
        console.log(`   - 호텔 ID: ${booking.lodgingId}`);
        console.log(`   - 삭제된 객실 ID: ${booking.roomId}`);
        console.log(`   - 체크인: ${booking.checkIn}`);
        console.log(`   - 체크아웃: ${booking.checkOut}`);
        console.log(`   - 가격: ₩${booking.price.toLocaleString()}`);
        console.log(`   - 상태: ${booking.status}`);
        console.log(`   - 사용자: ${booking.userName} (${booking.userPhone})`);
        console.log('');
      });

      if (orphanBookings.length > 10) {
        console.log(`   ... 외 ${orphanBookings.length - 10}개 더 있음\n`);
      }

      console.log('='.repeat(80));
      console.log(`\n💡 처리 방안:\n`);
      console.log(`   1. 모든 고아 예약을 취소 처리 (cancelled)`);
      console.log(`   2. 고아 예약을 새로운 객실 타입으로 매핑 (예: Superior Room)`);
      console.log(`   3. 예약 데이터는 유지하고 프론트엔드에서 null 처리\n`);
    } else {
      console.log('✅ 모든 예약이 유효한 객실을 참조하고 있습니다.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
};

checkOrphanBookings();