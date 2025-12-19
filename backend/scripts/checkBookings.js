// backend/scripts/checkBookings.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../src/config/db');
const Booking = require('../src/booking/model');
const Room = require('../src/room/model');
const Lodging = require('../src/lodging/model');

const checkBookings = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB 연결 완료\n');

    // 전체 예약 통계
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: { $ne: 'cancelled' } });
    
    console.log('='.repeat(80));
    console.log('📊 예약 통계\n');
    console.log(`   - 전체 예약: ${totalBookings}개`);
    console.log(`   - 활성 예약: ${activeBookings}개`);
    console.log(`   - 취소된 예약: ${totalBookings - activeBookings}개\n`);

    // 상태별 통계
    const statusCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('📊 예약 상태별 통계:');
    statusCounts.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count}개`);
    });
    console.log('');

    // 호텔별 예약 수
    const bookingsByHotel = await Booking.aggregate([
      {
        $group: {
          _id: '$lodgingId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log('📊 호텔별 예약 수 (상위 10개):');
    for (const item of bookingsByHotel) {
      const lodging = await Lodging.findById(item._id);
      const name = lodging ? lodging.lodgingName : '알 수 없음';
      console.log(`   - ${name}: ${item.count}개`);
    }
    console.log('');

    // 객실 타입별 예약 수
    const bookingsByRoom = await Booking.aggregate([
      {
        $group: {
          _id: '$roomId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log('📊 객실 타입별 예약 수 (상위 10개):');
    for (const item of bookingsByRoom) {
      const room = await Room.findById(item._id);
      const name = room ? room.roomName : '알 수 없음';
      console.log(`   - ${name}: ${item.count}개`);
    }
    console.log('');

    // 최근 예약 10개 샘플
    const recentBookings = await Booking.find({})
      .populate('lodgingId', 'lodgingName')
      .populate('roomId', 'roomName')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('='.repeat(80));
    console.log('📋 최근 예약 샘플 (10개):\n');
    
    recentBookings.forEach((booking, index) => {
      const lodgingName = booking.lodgingId?.lodgingName || '알 수 없음';
      const roomName = booking.roomId?.roomName || '알 수 없음';
      const checkIn = new Date(booking.checkIn).toLocaleDateString('ko-KR');
      const checkOut = new Date(booking.checkOut).toLocaleDateString('ko-KR');
      
      console.log(`${index + 1}. ${booking.userName} (${booking.userPhone})`);
      console.log(`   - 호텔: ${lodgingName}`);
      console.log(`   - 객실: ${roomName}`);
      console.log(`   - 체크인: ${checkIn} ~ 체크아웃: ${checkOut}`);
      console.log(`   - 가격: ₩${booking.price.toLocaleString()}`);
      console.log(`   - 상태: ${booking.status}`);
      console.log(`   - 리뷰 작성: ${booking.isReviewed ? '예' : '아니오'}`);
      console.log('');
    });

    // 유효성 검사 (고아 예약 확인)
    const allRooms = await Room.find({});
    const validRoomIds = allRooms.map(r => r._id);
    
    const orphanCount = await Booking.countDocuments({
      roomId: { $nin: validRoomIds }
    });

    if (orphanCount > 0) {
      console.log('='.repeat(80));
      console.log(`⚠️  경고: 고아 예약 ${orphanCount}개 발견 (존재하지 않는 객실 참조)\n`);
    } else {
      console.log('='.repeat(80));
      console.log('✅ 모든 예약이 유효한 객실을 참조하고 있습니다.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
};

checkBookings();