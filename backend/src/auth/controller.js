const authService = require("./service");
const { successResponse, errorResponse } = require("../common/response");

// MongoDB validation 에러를 사용자 친화적인 메시지로 변환
const formatValidationError = (error) => {
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors);
        const firstError = errors[0];
        
        // 필드명을 한국어로 매핑
        const fieldMap = {
            'name': '이름',
            'email': '이메일',
            'passwordHash': '비밀번호',
            'phoneNumber': '전화번호'
        };
        
        const fieldName = fieldMap[firstError.path] || firstError.path;
        
        if (firstError.kind === 'required') {
            return `${fieldName}을(를) 입력해주세요.`;
        } else if (firstError.kind === 'unique') {
            return `이미 사용 중인 ${fieldName}입니다.`;
        } else if (firstError.kind === 'regexp' || firstError.kind === 'user defined') {
            return firstError.message || `${fieldName} 형식이 올바르지 않습니다.`;
        }
        
        return firstError.message || `${fieldName} 입력값을 확인해주세요.`;
    }
    
    // MongoDB duplicate key 에러 처리
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const fieldMap = {
            'email': '이메일',
            'phoneNumber': '전화번호',
            'kakaoId': '카카오 계정',
            'googleId': '구글 계정'
        };
        const fieldName = fieldMap[field] || field;
        return `이미 사용 중인 ${fieldName}입니다.`;
    }
    
    return null;
};

exports.register = async (req, res) => {
    try {
        const data = await authService.registerService(req.body);
        res.status(201).json(successResponse(data, "회원가입 완료", 201));
    } catch (err) {
        // MongoDB validation 에러를 사용자 친화적인 메시지로 변환
        const friendlyMessage = formatValidationError(err);
        const errorMessage = friendlyMessage || err.message || '회원가입에 실패했습니다.';
        const statusCode = err.status || 500;
        
        res.status(statusCode).json(errorResponse(errorMessage, statusCode));
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.loginService(email, password);

        res.cookie('token', token, { httpOnly: true, path: "/" });

        res.status(200).json(successResponse({ user, token }, "로그인 성공", 200));
    } catch (err) {
        res.status(err.status || 500).json(errorResponse(err.message, err.status || 500));
    }
};

// ✅ [추가] 로그아웃 (쿠키 삭제)
exports.logout = (req, res) => {
    try {
        // 쿠키를 비우고 옵션을 동일하게 줘서 만료시킴
        res.clearCookie('token', { httpOnly: true, path: "/" });
        res.status(200).json(successResponse(null, "로그아웃 되었습니다.", 200));
    } catch (err) {
        res.status(500).json(errorResponse(err.message, 500));
    }
};

exports.getMe = async (req, res) => {
    try {
        const data = await authService.getMeService(req.user.id);
        res.status(200).json(successResponse(data, "내 정보 조회 성공", 200));
    } catch (err) {
        res.status(err.status || 500).json(errorResponse(err.message, err.status || 500));
    }
};

exports.updateMe = async (req, res) => {
    try {
        const data = await authService.updateMeService(req.user.id, req.body);
        res.status(200).json(successResponse(data, "정보 수정 완료", 200));
    } catch (err) {
        res.status(err.status || 500).json(errorResponse(err.message, err.status || 500));
    }
};

// ✅ 추가됨: 구글 로그인 콜백 처리
exports.googleCallback = (req, res) => {
    try {
        // Passport가 req.user에 유저 정보를 담아줌 -> 토큰 생성
        const token = authService.generateToken(req.user);

        // 프론트엔드로 리다이렉트 (토큰 전달)
        res.redirect(`${process.env.FRONT_ORIGIN}/oauth/google?token=${token}`);
    } catch (err) {
        res.status(500).json(errorResponse("소셜 로그인 실패", 500));
    }
};

// ▼▼▼ [추가] 카카오 로그인 콜백 ▼▼▼
exports.kakaoCallback = (req, res) => {
    try {
        const token = authService.generateToken(req.user);
        // 프론트엔드의 카카오 처리 페이지로 리다이렉트
        // (프론트 주소는 상황에 맞춰 /oauth/callback 등으로 통일해도 됨)
        res.redirect(`${process.env.FRONT_ORIGIN}/oauth/kakao?token=${token}`);
    } catch (err) {
        res.status(500).json(errorResponse("카카오 로그인 실패", 500));
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, name } = req.body;
        const tempPassword = await authService.resetPasswordService(email, name);
        
        res.status(200).json(successResponse({ tempPassword }, "임시 비밀번호가 발급되었습니다."));
    } catch (err) {
        res.status(err.status || 500).json(errorResponse(err.message, err.status || 500));
    }
};