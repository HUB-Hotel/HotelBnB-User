const Booking = require("./model");
const Room = require("../room/model");
const Lodging = require("../lodging/model");
const mongoose = require("mongoose");

// 숫자 ID를 ObjectId로 변환하는 헬퍼 함수
const convertToObjectId = async (id, model, fieldName) => {
    if (mongoose.Types.ObjectId.isValid(id)) {
        return id;
    }
    
    // 숫자 ID인 경우 실제 데이터를 찾아서 ObjectId를 가져옴
    const numericId = parseInt(id);
    if (!isNaN(numericId)) {
        const items = await model.find({}).sort({ createdAt: 1 }).limit(100);
        if (items.length >= numericId && numericId > 0) {
            return items[numericId - 1]._id;
        }
    }
    
    throw { message: `유효하지 않은 ${fieldName}입니다: ${id}`, status: 400 };
};

// 1. 예약 생성 (그대로 유지)
exports.createBookingService = async (userId, data) => {
    const { lodgingId, roomId, checkIn, checkOut, price, userName, userPhone, paymentKey, paymentAmount } = data;

    console.log(`👉 [Service] 예약 생성 시작. userId: ${userId}, lodgingId: ${lodgingId}, roomId: ${roomId}`);

    // userId가 ObjectId 형식인지 확인하고 변환
    let actualUserId = userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error(`❌ [Service] 유효하지 않은 userId: ${userId}`);
        throw { message: `유효하지 않은 사용자 ID입니다: ${userId}`, status: 400 };
    }

    // 숫자 ID를 ObjectId로 변환
    let actualLodgingId, actualRoomId;
    try {
        console.log(`👉 [Service] ID 변환 시작. lodgingId: ${lodgingId}, roomId: ${roomId}`);
        actualLodgingId = await convertToObjectId(lodgingId, Lodging, '숙소');
        actualRoomId = await convertToObjectId(roomId, Room, '객실');
        console.log(`✅ [Service] ID 변환 완료. actualLodgingId: ${actualLodgingId}, actualRoomId: ${actualRoomId}`);
    } catch (err) {
        console.error(`❌ [Service] ID 변환 실패:`, err);
        throw err;
    }

    console.log(`👉 [Service] Room 조회 시도. ID: ${actualRoomId}`);

    const room = await Room.findById(actualRoomId);

    console.log("👉 [Service] DB에서 찾은 Room 정보:", room);

    if (!room) throw { message: "객실을 찾을 수 없습니다.", status: 404 };

    const totalStock = room.countRoom;

    console.log(`👉 [Service] 날짜 변환 확인. CheckIn: ${new Date(checkIn)}, CheckOut: ${new Date(checkOut)}`);

    const existingBookingsCount = await Booking.countDocuments({
        roomId: actualRoomId,
        status: { $ne: "cancelled" },
        $or: [
            { checkIn: { $lte: new Date(checkIn) }, checkOut: { $gt: new Date(checkIn) } },
            { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gte: new Date(checkOut) } },
            { checkIn: { $gte: new Date(checkIn) }, checkOut: { $lte: new Date(checkOut) } }
        ]
    });

    console.log(`👉 [Service] 예약된 수: ${existingBookingsCount}, 전체 재고: ${totalStock}`);

    if (existingBookingsCount >= totalStock) {
        throw { message: "해당 날짜에 객실이 모두 매진되었습니다.", status: 400 };
    }

    console.log(`👉 [Service] 예약 데이터 생성 시작`);
    console.log(`   - userId: ${actualUserId}`);
    console.log(`   - lodgingId: ${actualLodgingId}`);
    console.log(`   - roomId: ${actualRoomId}`);
    console.log(`   - userName: ${userName}`);
    console.log(`   - userPhone: ${userPhone}`);
    console.log(`   - checkIn: ${checkIn}`);
    console.log(`   - checkOut: ${checkOut}`);
    console.log(`   - price: ${price}`);

    const newBooking = await Booking.create({
        userId: actualUserId, lodgingId: actualLodgingId, roomId: actualRoomId, userName, userPhone, checkIn, checkOut, price,
        status: "confirmed", // 예약 생성 시 바로 확정
        paymentKey, paymentAmount
    });

    console.log("👉 [Service] 예약 생성 완료!");

    return newBooking;
};

// 2. 내 예약 목록 조회 (🚨 여기를 수정했습니다!)
exports.getMyBookingsService = async (userId) => {
    return await Booking.find({ userId })
        .populate("lodgingId") // ✅ 특정 필드만 가져오지 말고 통째로 가져오는 게 안전합니다.
        .populate("roomId")    // ✅ 룸 정보도 통째로 가져옴 (roomName, roomImage 등 필요하니까)
        .sort({ createdAt: -1 }); // 최신순 정렬
};

// 3. 예약 상세 조회
exports.getBookingDetailService = async (bookingId, userId) => {
    const booking = await Booking.findById(bookingId)
        .populate("lodgingId")
        .populate("roomId");
    
    if (!booking) throw { message: "예약이 없습니다.", status: 404 };
    
    // userId가 ObjectId 객체일 수 있으므로 문자열로 변환 후 비교
    if (booking.userId.toString() !== userId.toString()) {
        throw { message: "권한이 없습니다.", status: 403 };
    }
    
    return booking;
};

// 3. 예약 취소 (그대로 유지)
exports.cancelBookingService = async (bookingId, userId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw { message: "예약이 없습니다.", status: 404 };
    
    // userId가 ObjectId 객체일 수 있으므로 문자열로 변환 후 비교
    if (booking.userId.toString() !== userId.toString()) throw { message: "권한이 없습니다.", status: 403 };

    booking.status = "cancelled";
    await booking.save();
    return null;
};