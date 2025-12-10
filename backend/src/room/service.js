const Room = require("./model");
const Lodging = require("../lodging/model");
const mongoose = require("mongoose");

exports.getRoomsByLodgingService = async (lodgingId) => {
    let actualLodgingId = lodgingId;
    
    // 숫자 ID인 경우 실제 Lodging을 찾아서 ObjectId를 가져옴
    if (!mongoose.Types.ObjectId.isValid(lodgingId)) {
        // 숫자로 변환 가능한지 확인
        const numericId = parseInt(lodgingId);
        if (!isNaN(numericId)) {
            // 모든 Lodging을 가져와서 인덱스로 찾기 (임시 해결책)
            const lodgings = await Lodging.find({}).sort({ createdAt: 1 }).limit(100);
            if (lodgings.length >= numericId && numericId > 0) {
                actualLodgingId = lodgings[numericId - 1]._id;
            } else {
                throw new Error(`숙소를 찾을 수 없습니다: ${lodgingId}`);
            }
        } else {
            throw new Error(`유효하지 않은 숙소 ID입니다: ${lodgingId}`);
        }
    }
    
    // lodgingId가 DB에 있는 방들을 찾아서 반환합니다.
    const rooms = await Room.find({ lodgingId: actualLodgingId });
    return rooms;
};