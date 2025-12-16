# =======================================
# 1단계: 빌드 (Builder Stage)
# =======================================
FROM node:20-alpine as builder

WORKDIR /app

# 패키지 파일 복사 및 설치
COPY package.json package-lock.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# [핵심] 빌드 시점에 환경변수 강제 주입
# .env 파일이 없어도 여기서 설정하면 무조건 적용됩니다.
ENV VITE_API_URL=https://hotelbnb-user.shop/api
ENV VITE_KAKAO_API_KEY=58f26b3aea7b3181bc706bd92ad7219f

# 빌드 실행 (이때 위 환경변수가 코드에 박힙니다)
RUN npm run build


# =======================================
# 2단계: 실행 (Production Stage)
# =======================================
FROM nginx:1.25-alpine

# 기본 설정 제거
RUN rm /etc/nginx/conf.d/default.conf

# (옵션) 커스텀 nginx 설정이 있다면 복사 (없으면 생략 가능하지만 기존에 쓰시던게 있으니 유지)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 1단계에서 빌드한 결과물(dist)만 쏙 가져오기
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 개방
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]