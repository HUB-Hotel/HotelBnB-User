const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// 🚨 경로 변경: ../models/User -> ../auth/model
const User = require("../auth/model"); 
require("dotenv").config();

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// (카카오 전략 코드는 기존과 동일, 경로만 주의하면 됨)
passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    callbackURL: process.env.KAKAO_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const kakaoId = profile.id;
        const email = profile._json?.kakao_account?.email;
        
        // 카카오 API 응답 구조에 맞게 닉네임 가져오기 (우선순위 순서)
        const nickname = profile._json?.kakao_account?.profile?.nickname 
            || profile._json?.properties?.nickname 
            || profile.displayName 
            || "카카오유저";
        
        // 프로필 이미지 가져오기
        const photoUrl = profile._json?.kakao_account?.profile?.profile_image_url 
            || profile._json?.properties?.profile_image 
            || "";

        let user = await User.findOne({ kakaoId });
        
        // 기존 사용자가 이메일로 존재하는 경우 연동
        if (!user && email) {
            user = await User.findOne({ email });
            if (user) {
                user.kakaoId = kakaoId;
                user.provider = "kakao";
                // 이름이 없거나 기본값이면 카카오 닉네임으로 업데이트
                if (!user.name || user.name === "미연동 계정" || user.name === "카카오유저") {
                    user.name = nickname;
                }
                // 프로필 이미지도 업데이트
                if (photoUrl) {
                    user.profileImage = photoUrl;
                }
                await user.save();
            }
        }
        
        // 새 사용자 생성
        if (!user) {
            user = await User.create({
                email: email || undefined,
                name: nickname,
                kakaoId,
                provider: "kakao",
                profileImage: photoUrl
            });
        } else {
            // 기존 사용자의 이름이 없거나 기본값이면 카카오 닉네임으로 업데이트
            if (!user.name || user.name === "미연동 계정" || user.name === "카카오유저") {
                user.name = nickname;
                await user.save();
            }
            // 프로필 이미지도 업데이트 (없는 경우에만)
            if (photoUrl && !user.profileImage) {
                user.profileImage = photoUrl;
                await user.save();
            }
        }
        
        return done(null, user);
    } catch (err) { 
        console.error('❌ 카카오 로그인 에러:', err);
        return done(err); 
    }
}));

// (구글 전략 코드도 동일)
// 환경 변수 확인
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
    console.warn('⚠️ Google OAuth 환경 변수가 설정되지 않았습니다. Google 로그인이 작동하지 않을 수 있습니다.');
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const displayName = profile.displayName;
        const photoUrl = profile.photos?.[0]?.value;

        let user = await User.findOne({ googleId });
        if (!user && email) {
            user = await User.findOne({ email });
            if (user) {
                user.googleId = googleId;
                await user.save();
            }
        }
        if (!user) {
            user = await User.create({
                email,
                name: displayName,
                googleId,
                provider: "google",
                profileImage: profile.photos?.[0]?.value
            });
        }
        return done(null, user);
    } catch (err) { return done(err); }
}));

module.exports = passport;