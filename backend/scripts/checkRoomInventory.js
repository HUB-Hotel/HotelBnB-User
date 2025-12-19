// backend/scripts/checkRoomInventory.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../src/config/db');
const Lodging = require('../src/lodging/model');
const Room = require('../src/room/model');
const Booking = require('../src/booking/model');

const checkRoomInventory = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB 연결 완료\n');

    // 모든 호텔 조회
    const lodgings = await Lodging.find({}).sort({ lodgingName: 1 });
    console.log(`📊 총 ${lodgings.length}개의 호텔을 확인합니다.\n`);
    console.log('='.repeat(80));

    for (const lodging of lodgings) {
      console.log(`\n🏨 호텔: ${lodging.lodgingName}`);
      console.log(`   ID: ${lodging._id}`);
      console.log(`   주소: ${lodging.address}`);

      // 해당 호텔의 모든 객실 조회
      const rooms = await Room.find({ lodgingId: lodging._id });

      if (rooms.length === 0) {
        console.log(`   ⚠️  객실이 등록되어 있지 않습니다.`);
        continue;
      }

      // 객실 타입별 통계
      let totalRooms = 0;
      const roomTypes = {};

      for (const room of rooms) {
        const roomCount = room.countRoom || 0;
        totalRooms += roomCount;

        if (!roomTypes[room.roomName]) {
          roomTypes[room.roomName] = {
            count: 0,
            price: room.price,
            status: room.status,
            capacityMax: room.capacityMax,
          };
        }
        roomTypes[room.roomName].count += roomCount;
      }

      console.log(`   📦 총 객실 수: ${totalRooms}개`);
      console.log(`   🚪 객실 타입 수: ${rooms.length}개\n`);

      // 객실 타입별 상세 정보
      for (const [roomName, info] of Object.entries(roomTypes)) {
        console.log(`   ┌─ ${roomName}`);
        console.log(`   │  재고: ${info.count}개`);
        console.log(`   │  가격: ₩${info.price.toLocaleString()}/night`);
        console.log(`   │  최대 인원: ${info.capacityMax}명`);
        console.log(`   │  상태: ${info.status}`);
        
        // 예약된 객실 수 확인 (선택사항)
        const activeBookings = await Booking.countDocuments({
          roomId: { $in: rooms.filter(r => r.roomName === roomName).map(r => r._id) },
          status: { $ne: 'cancelled' }
        });
        
        if (activeBookings > 0) {
          const available = info.count - activeBookings;
          console.log(`   │  예약됨: ${activeBookings}개`);
          console.log(`   │  잔여: ${available}개`);
        } else {
          console.log(`   │  예약됨: 0개`);
          console.log(`   │  잔여: ${info.count}개`);
        }
        console.log(`   └─`);
      }

      console.log('   ' + '-'.repeat(76));
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ 조회 완료!\n');

    // 전체 통계
    const allRooms = await Room.find({});
    const totalAllRooms = allRooms.reduce((sum, room) => sum + (room.countRoom || 0), 0);
    console.log(`📊 전체 통계:`);
    console.log(`   - 총 호텔 수: ${lodgings.length}개`);
    console.log(`   - 총 객실 타입 수: ${allRooms.length}개`);
    console.log(`   - 총 객실 재고: ${totalAllRooms}개\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
};

checkRoomInventory();