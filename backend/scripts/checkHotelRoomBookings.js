// backend/scripts/checkHotelRoomBookings.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../src/config/db');
const Lodging = require('../src/lodging/model');
const Room = require('../src/room/model');
const Booking = require('../src/booking/model');

const checkHotelRoomBookings = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB 연결 완료\n');

    // 모든 호텔 조회
    const lodgings = await Lodging.find({}).sort({ lodgingName: 1 });
    console.log(`📊 총 호텔 수: ${lodgings.length}개\n`);
    console.log('='.repeat(100));

    let totalRooms = 0;
    let totalBookings = 0;

    for (const lodging of lodgings) {
      console.log(`\n🏨 호텔: ${lodging.lodgingName}`);
      console.log(`   주소: ${lodging.address}`);
      console.log(`   카테고리: ${lodging.category} | 별점: ${lodging.starRating}성\n`);

      // 해당 호텔의 모든 객실 조회
      const rooms = await Room.find({ lodgingId: lodging._id }).sort({ price: 1 });
      
      if (rooms.length === 0) {
        console.log('   ⚠️  객실이 등록되어 있지 않습니다.\n');
        console.log('   ' + '-'.repeat(96));
        continue;
      }

      totalRooms += rooms.length;
      console.log(`   📦 객실 타입: ${rooms.length}개\n`);

      // 각 객실 타입별 정보 및 예약 건수
      for (const room of rooms) {
        // 해당 객실의 예약 건수 조회
        const bookingCount = await Booking.countDocuments({
          roomId: room._id,
          status: { $ne: 'cancelled' }
        });

        // 예약 상태별 상세 통계
        const statusCounts = await Booking.aggregate([
          {
            $match: {
              roomId: room._id,
              status: { $ne: 'cancelled' }
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        totalBookings += bookingCount;

        console.log(`   ┌─ ${room.roomName}`);
        console.log(`   │  객실 크기: ${room.roomSize}`);
        console.log(`   │  가격: ₩${room.price.toLocaleString()}/night`);
        console.log(`   │  최소 인원: ${room.capacityMin}명 | 최대 인원: ${room.capacityMax}명`);
        console.log(`   │  재고: ${room.countRoom}개`);
        console.log(`   │  상태: ${room.status}`);
        console.log(`   │  예약 건수: ${bookingCount}개`);

        if (statusCounts.length > 0) {
          const statusDetails = statusCounts.map(s => `${s._id}: ${s.count}개`).join(', ');
          console.log(`   │  예약 상태별: ${statusDetails}`);
        }

        // 잔여 객실 계산
        const remaining = room.countRoom - bookingCount;
        console.log(`   │  잔여 객실: ${remaining}개`);
        
        if (remaining < 0) {
          console.log(`   │  ⚠️  경고: 예약이 재고를 초과했습니다!`);
        } else if (remaining === 0) {
          console.log(`   │  ⚠️  매진`);
        }
        
        console.log(`   └─`);
      }

      // 호텔별 총 예약 건수
      const hotelTotalBookings = await Booking.countDocuments({
        lodgingId: lodging._id,
        status: { $ne: 'cancelled' }
      });

      console.log(`\n   📊 호텔 총 예약 건수: ${hotelTotalBookings}개`);
      console.log('   ' + '-'.repeat(96));
    }

    // 전체 통계
    console.log('\n' + '='.repeat(100));
    console.log('📊 전체 통계\n');
    console.log(`   - 총 호텔 수: ${lodgings.length}개`);
    console.log(`   - 총 객실 타입 수: ${totalRooms}개`);
    console.log(`   - 총 활성 예약 건수: ${totalBookings}개`);

    // 객실 타입별 전체 예약 통계
    const roomTypeStats = await Booking.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' }
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomId',
          foreignField: '_id',
          as: 'room'
        }
      },
      {
        $unwind: '$room'
      },
      {
        $group: {
          _id: '$room.roomName',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\n📊 객실 타입별 전체 예약 통계:');
    roomTypeStats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count}개`);
    });

    // 호텔별 예약 건수 상위 10개
    const topHotels = await Booking.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$lodgingId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    console.log('\n📊 예약이 많은 호텔 Top 10:');
    for (const item of topHotels) {
      const lodging = await Lodging.findById(item._id);
      const name = lodging ? lodging.lodgingName : '알 수 없음';
      console.log(`   - ${name}: ${item.count}개`);
    }

    console.log('\n' + '='.repeat(100));
    console.log('✅ 조회 완료!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
};

checkHotelRoomBookings();