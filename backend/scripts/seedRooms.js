// backend/scripts/seedRooms.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../src/config/db');
const Lodging = require('../src/lodging/model');
const Room = require('../src/room/model');
const Booking = require('../src/booking/model');

// 프론트엔드 하드코딩 데이터를 기반으로 한 객실 타입 정의
const roomTypes = [
  {
    roomName: 'Superior Room',
    description: '1 double bed or 2 twin beds',
    price: 240000,
    roomSize: '25㎡',
    capacityMin: 2,
    capacityMax: 2,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    roomImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    countRoom: 50,
    status: 'active',
  },
  {
    roomName: 'Deluxe Room',
    description: '1 king bed with city view',
    price: 280000,
    roomSize: '30㎡',
    capacityMin: 2,
    capacityMax: 2,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
    countRoom: 50,
    status: 'active',
  },
  {
    roomName: 'Suite',
    description: '2 bedrooms with living area',
    price: 350000,
    roomSize: '50㎡',
    capacityMin: 4,
    capacityMax: 4,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    countRoom: 50,
    status: 'active',
  },
  {
    roomName: 'Executive Suite',
    description: '3 bedrooms with full kitchen',
    price: 450000,
    roomSize: '80㎡',
    capacityMin: 6,
    capacityMax: 6,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    roomImage: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
    countRoom: 50,
    status: 'active',
  },
];

const seedRooms = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB 연결 완료\n');

    // 모든 호텔 조회
    const lodgings = await Lodging.find({}).sort({ lodgingName: 1 });
    console.log(`📊 총 ${lodgings.length}개의 호텔을 확인합니다.\n`);

    // 예약 데이터 확인
    const existingBookingsCount = await Booking.countDocuments({
      status: { $ne: 'cancelled' }
    });

    if (existingBookingsCount > 0) {
      console.log(`⚠️  경고: 현재 ${existingBookingsCount}개의 활성 예약이 있습니다.`);
      console.log(`⚠️  기존 객실을 삭제하면 예약 데이터와 연결이 끊어질 수 있습니다.\n`);
    }

    let totalDeleted = 0;
    let totalCreated = 0;

    console.log('='.repeat(80));

    for (const lodging of lodgings) {
      console.log(`\n🏨 호텔: ${lodging.lodgingName}`);
      console.log(`   ID: ${lodging._id}`);

      // 1. 기존 객실 조회 및 삭제
      const existingRooms = await Room.find({ lodgingId: lodging._id });
      const deletedCount = existingRooms.length;

      if (deletedCount > 0) {
        // 해당 호텔의 객실을 참조하는 예약 확인
        const roomIds = existingRooms.map(r => r._id);
        const bookingsWithRooms = await Booking.countDocuments({
          roomId: { $in: roomIds },
          status: { $ne: 'cancelled' }
        });

        if (bookingsWithRooms > 0) {
          console.log(`   ⚠️  경고: 이 호텔의 객실을 참조하는 ${bookingsWithRooms}개의 활성 예약이 있습니다.`);
          console.log(`   ⚠️  객실 삭제 시 예약 데이터에 영향을 줄 수 있습니다.`);
        }

        await Room.deleteMany({ lodgingId: lodging._id });
        console.log(`   🗑️  기존 객실 ${deletedCount}개 삭제 완료`);
        totalDeleted += deletedCount;
      } else {
        console.log(`   ℹ️  기존 객실 없음`);
      }

      // 2. 새로운 객실 타입 생성
      const newRooms = [];
      for (const roomType of roomTypes) {
        const newRoom = {
          lodgingId: lodging._id,
          ...roomType,
        };
        newRooms.push(newRoom);
      }

      const insertedRooms = await Room.insertMany(newRooms);
      console.log(`   ✅ 새로운 객실 ${insertedRooms.length}개 생성 완료`);
      totalCreated += insertedRooms.length;

      // 생성된 객실 타입 출력
      insertedRooms.forEach((room, index) => {
        console.log(`      ${index + 1}. ${room.roomName} - ₩${room.price.toLocaleString()}/night (재고: ${room.countRoom}개)`);
      });

      console.log('   ' + '-'.repeat(76));
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ 작업 완료!\n');
    console.log(`📊 통계:`);
    console.log(`   - 처리된 호텔: ${lodgings.length}개`);
    console.log(`   - 삭제된 기존 객실: ${totalDeleted}개`);
    console.log(`   - 생성된 새 객실: ${totalCreated}개`);
    console.log(`   - 호텔당 객실 타입: ${roomTypes.length}개`);
    console.log(`   - 타입당 재고: ${roomTypes[0].countRoom}개\n`);

    if (existingBookingsCount > 0) {
      console.log(`⚠️  참고: ${existingBookingsCount}개의 기존 예약이 있습니다.`);
      console.log(`⚠️  삭제된 객실을 참조하는 예약은 수동으로 확인이 필요할 수 있습니다.\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
};

seedRooms();

