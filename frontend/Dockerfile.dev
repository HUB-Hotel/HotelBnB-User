FROM node:20-alpine

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스코드는 볼륨 마운트로 연결됨
COPY . .

EXPOSE 5173

# Vite 개발 서버 실행
CMD ["npm", "run", "dev"]
