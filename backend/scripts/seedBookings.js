// backend/scripts/seedBookings.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../src/config/db');
const Lodging = require('../src/lodging/model');
const Room = require('../src/room/model');
const Booking = require('../src/booking/model');
const User = require('../src/auth/model');

// 전화번호 생성 함수 (phoneNumber가 없는 경우를 위한 fallback)
const generatePhoneNumber = () => {
  const middle = Math.floor(Math.random() * 9000) + 1000;
  const last = Math.floor(Math.random() * 9000) + 1000;
  return `010-${middle}-${last}`;
};

// 랜덤 날짜 생성 함수 (미래 30일 ~ 180일 사이)
const generateRandomDate = (startDays = 30, endDays = 180) => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + startDays);
  
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + endDays);
  
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  return new Date(randomTime);
};

// 체크인/체크아웃 날짜 생성 (1박 ~ 7박)
const generateCheckInOut = () => {
  const checkIn = generateRandomDate(30, 180);
  const nights = Math.floor(Math.random() * 6) + 1; // 1박 ~ 7박
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkIn.getDate() + nights);
  
  // 시간 설정 (체크인: 15:00, 체크아웃: 11:00)
  checkIn.setHours(14, 40, 25, 758);
  checkOut.setHours(14, 40, 25, 758);
  
  return { checkIn, checkOut, nights };
};

// Payment Key 생성
const generatePaymentKey = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `temp_${timestamp}_${random}`;
};

const seedBookings = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB 연결 완료\n');

    // 1. 기존 예약 모두 삭제
    const existingBookingsCount = await Booking.countDocuments();
    if (existingBookingsCount > 0) {
      await Booking.deleteMany({});
      console.log(`🗑️  기존 예약 ${existingBookingsCount}개 삭제 완료\n`);
    } else {
      console.log('ℹ️  삭제할 기존 예약 없음\n');
    }

    // 2. 모든 호텔과 객실 조회
    const lodgings = await Lodging.find({}).sort({ lodgingName: 1 });
    const allRooms = await Room.find({ status: 'active' });
    
    console.log(`📊 호텔 수: ${lodgings.length}개`);
    console.log(`📊 객실 타입 수: ${allRooms.length}개\n`);

    // 3. role이 'user'인 유저 조회
    let users = await User.find({ role: 'user' }).select('_id name phoneNumber');
    
    if (users.length === 0) {
      console.log('⚠️  role이 "user"인 유저가 없습니다. 기본 테스트 유저를 생성합니다...\n');
      // 기본 테스트 유저 생성
      const testUser = await User.create({
        email: 'test@example.com',
        name: '테스트유저',
        phoneNumber: '010-0000-0000',
        role: 'user',
        provider: 'local',
        passwordHash: '$2b$10$dummyhashforseedonly'
      });
      users = [{ _id: testUser._id, name: testUser.name, phoneNumber: testUser.phoneNumber }];
    }

    console.log(`👥 사용 가능한 유저 (role: user): ${users.length}명\n`);
    
    // phoneNumber가 없는 유저 확인
    const usersWithoutPhone = users.filter(u => !u.phoneNumber);
    if (usersWithoutPhone.length > 0) {
      console.log(`⚠️  전화번호가 없는 유저: ${usersWithoutPhone.length}명 (예약 생성 시 랜덤 전화번호 사용)\n`);
    }
    console.log('='.repeat(80));

    // 4. 각 호텔의 객실별로 예약 생성
    let totalBookings = 0;
    const bookingsPerRoom = 3; // 각 객실 타입당 생성할 예약 수

    for (const lodging of lodgings) {
      const hotelRooms = allRooms.filter(r => r.lodgingId.toString() === lodging._id.toString());
      
      if (hotelRooms.length === 0) {
        console.log(`\n⚠️  ${lodging.lodgingName}: 객실이 없어 건너뜁니다.`);
        continue;
      }

      console.log(`\n🏨 호텔: ${lodging.lodgingName}`);
      console.log(`   객실 타입: ${hotelRooms.length}개`);

      const hotelBookings = [];

      for (const room of hotelRooms) {
        // 각 객실 타입당 bookingsPerRoom개의 예약 생성
        for (let i = 0; i < bookingsPerRoom; i++) {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          const { checkIn, checkOut, nights } = generateCheckInOut();
          
          // 가격 계산 (객실 가격 × 박수)
          const roomPrice = room.price || 240000;
          const totalPrice = roomPrice * nights;
          
          // 유저의 이름과 전화번호 사용 (전화번호가 없으면 랜덤 생성)
          const userName = randomUser.name || '테스트유저';
          const userPhone = randomUser.phoneNumber || generatePhoneNumber();
          
          const booking = {
            userId: randomUser._id,
            lodgingId: lodging._id,
            roomId: room._id,
            userName: userName,
            userPhone: userPhone,
            checkIn: checkIn,
            checkOut: checkOut,
            price: totalPrice,
            status: Math.random() > 0.1 ? 'confirmed' : (Math.random() > 0.5 ? 'booked' : 'pending'), // 90% confirmed
            paymentKey: generatePaymentKey(),
            paymentAmount: totalPrice,
            isReviewed: Math.random() > 0.7, // 30% 리뷰 작성됨
          };

          hotelBookings.push(booking);
        }
      }

      // 일괄 삽입
      const insertedBookings = await Booking.insertMany(hotelBookings);
      totalBookings += insertedBookings.length;
      
      console.log(`   ✅ 예약 ${insertedBookings.length}개 생성 완료`);
      console.log(`      - 객실 타입당 ${bookingsPerRoom}개씩 생성`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ 예약 생성 완료!\n');
    console.log(`📊 통계:`);
    console.log(`   - 처리된 호텔: ${lodgings.length}개`);
    console.log(`   - 생성된 예약: ${totalBookings}개`);
    console.log(`   - 객실 타입당 예약 수: ${bookingsPerRoom}개`);
    console.log(`   - 사용된 유저 수: ${users.length}명\n`);

    // 예약 상태별 통계
    const statusCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('📊 예약 상태별 통계:');
    statusCounts.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count}개`);
    });
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
};

seedBookings();

