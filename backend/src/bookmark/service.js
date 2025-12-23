const mongoose = require("mongoose");
const User = require("../auth/model");
const Lodging = require("../lodging/model"); // 숙소 존재 확인용

// ID를 ObjectId로 변환하는 헬퍼 함수
const convertToObjectId = (lodgingId) => {
    // 이미 ObjectId 형식인지 확인
    if (mongoose.Types.ObjectId.isValid(lodgingId)) {
        return new mongoose.Types.ObjectId(lodgingId);
    }
    
    // 유효하지 않은 ID인 경우
    throw { status: 400, message: "유효하지 않은 숙소 ID입니다." };
};

// 1. 찜 추가
exports.addBookmarkService = async (userId, lodgingId) => {
    // ObjectId로 변환
    const objectId = convertToObjectId(lodgingId);
    
    // 숙소가 진짜 있는지 확인
    const lodging = await Lodging.findById(objectId);
    if (!lodging) throw { status: 404, message: "숙소를 찾을 수 없습니다." };

    // $addToSet: 이미 있으면 추가 안 함 (중복 방지)
    await User.findByIdAndUpdate(userId, {
        $addToSet: { wishlist: objectId }
    });
};

// 2. 찜 삭제
exports.removeBookmarkService = async (userId, lodgingId) => {
    // ObjectId로 변환
    const objectId = convertToObjectId(lodgingId);
    
    // $pull: 배열에서 해당 ID 제거
    await User.findByIdAndUpdate(userId, {
        $pull: { wishlist: objectId }
    });
};

// 3. 내 북마크 목록 조회
exports.getMyBookmarksService = async (userId) => {
    const user = await User.findById(userId).populate("wishlist");
    return user ? user.wishlist : [];
};