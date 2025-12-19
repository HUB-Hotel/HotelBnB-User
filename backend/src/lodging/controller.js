// backend/src/lodging/controller.js

const Lodging = require("./model");
const Room = require("../room/model");
const { successResponse, errorResponse } = require("../common/response");

// 1. 숙소 목록 조회 (검색 기능 포함)
exports.getLodgings = async (req, res) => {
  try {
    // guests 파라미터 추가
    const { loc, checkIn, checkOut, category, guests } = req.query;

    let query = {};

    // 1. 지역 검색 (기존 유지)
    if (loc) {
      query.$or = [
        { address: { $regex: loc, $options: 'i' } },
        { country: { $regex: loc, $options: 'i' } },
        { lodgingName: { $regex: loc, $options: 'i' } },
        { hashtag: { $regex: loc, $options: 'i' } }
      ];
    }

    // 2. 카테고리 (기존 유지)
    if (category) {
      query.category = category;
    }

    // ✅ 3. 인원 수 필터링 (추가됨!)
    // "숙소의 최대 수용 인원"이 "검색한 인원"보다 크거나 같아야 함
    if (guests) {
      query.maxGuests = { $gte: parseInt(guests) };
    }

    const lodgings = await Lodging.find(query);

    // 각 호텔의 객실 가격 배열 추가
    const lodgingsWithRoomPrices = await Promise.all(
      lodgings.map(async (lodging) => {
        // 해당 호텔의 활성 객실들의 가격만 가져오기
        const rooms = await Room.find({
          lodgingId: lodging._id,
          status: 'active'
        }).select('price').lean();

        // 객실 가격 배열 생성 (중복 제거 및 정렬)
        const roomPrices = [...new Set(rooms.map(r => r.price))].sort((a, b) => a - b);

        // lodging 객체에 roomPrices 필드 추가
        const lodgingObj = lodging.toObject();
        lodgingObj.roomPrices = roomPrices.length > 0 ? roomPrices : [lodging.minPrice || 0];

        return lodgingObj;
      })
    );

    res.status(200).json(successResponse(lodgingsWithRoomPrices || [], `${lodgingsWithRoomPrices.length}개 발견`));

  } catch (err) {
    res.status(500).json(errorResponse(err.message || "숙소 목록 조회 실패", 500));
  }
};

// 🚨 [부활] 2. 숙소 상세 조회 (이게 없어서 상세페이지가 안 떴던 것!)
exports.getLodgingDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // DB에서 ID로 찾기
    const lodging = await Lodging.findById(id);

    if (!lodging) {
      return res.status(404).json(errorResponse("숙소를 찾을 수 없습니다.", 404));
    }

    res.status(200).json(successResponse(lodging, "숙소 상세 조회 성공"));
  } catch (err) {
    res.status(500).json(errorResponse("잘못된 요청입니다. (ID 형식을 확인하세요)", 500));
  }
};

// 🚨 [부활] 3. 객실 목록 조회 (이것도 필요할 수 있음)
// (만약 rooms 컨트롤러가 따로 있다면 생략 가능하지만, 보통 같이 둠)
// 하지만 작성자님 구조상 /api/rooms/:lodgingId 로 요청한다면 room/controller.js 에 있어야 함.
// lodgings/:id 호출 시에는 위의 getLodgingDetail만 있으면 됩니다.