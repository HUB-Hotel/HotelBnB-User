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

// 1. 예약 생성
exports.createBookingService = async (userId, data) => {
    const { lodgingId, roomId, checkIn, checkOut, price, userName, userPhone, paymentKey, paymentAmount } = data;

    // userId가 ObjectId 형식인지 확인하고 변환
    let actualUserId = userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw { message: `유효하지 않은 사용자 ID입니다: ${userId}`, status: 400 };
    }

    // 숫자 ID를 ObjectId로 변환
    let actualLodgingId, actualRoomId;
    try {
        actualLodgingId = await convertToObjectId(lodgingId, Lodging, '숙소');
        actualRoomId = await convertToObjectId(roomId, Room, '객실');
    } catch (err) {
        throw err;
    }

    const room = await Room.findById(actualRoomId);
    if (!room) throw { message: "객실을 찾을 수 없습니다.", status: 404 };

    const totalStock = room.countRoom;

    const existingBookingsCount = await Booking.countDocuments({
        roomId: actualRoomId,
        status: { $ne: "cancelled" },
        $or: [
            { checkIn: { $lte: new Date(checkIn) }, checkOut: { $gt: new Date(checkIn) } },
            { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gte: new Date(checkOut) } },
            { checkIn: { $gte: new Date(checkIn) }, checkOut: { $lte: new Date(checkOut) } }
        ]
    });

    if (existingBookingsCount >= totalStock) {
        throw { message: "해당 날짜에 객실이 모두 매진되었습니다.", status: 400 };
    }

    const newBooking = await Booking.create({
        userId: actualUserId, lodgingId: actualLodgingId, roomId: actualRoomId, userName, userPhone, checkIn, checkOut, price,
        status: "confirmed",
        paymentKey, paymentAmount
    });

    return newBooking;
};

// 2. 내 예약 목록 조회 (🚨 여기를 수정했습니다!)
exports.getMyBookingsService = async (userId) => {
    return await Booking.find({ 
        userId,
        status: { $ne: "cancelled" } // 취소된 예약 제외
    })
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