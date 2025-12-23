const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

/**
 * email 필드의 unique 인덱스를 sparse unique 인덱스로 변경
 * 카카오 로그인 시 email이 null인 경우 중복 키 에러 방지
 */
async function fixEmailIndex() {
  try {
    console.log('🔌 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // 기존 인덱스 목록 확인
    const indexes = await collection.indexes();
    console.log('📋 현재 인덱스 목록:', indexes.map(idx => idx.name));
    
    // 기존 email 인덱스 삭제
    try {
      await collection.dropIndex('email_1');
      console.log('✅ 기존 email 인덱스 삭제 완료');
    } catch (err) {
      if (err.code === 27) {
        console.log('⚠️ 인덱스가 존재하지 않습니다.');
      } else {
        console.log('⚠️ 인덱스 삭제 중 경고:', err.message);
      }
    }
    
    // sparse unique 인덱스 생성
    await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('✅ sparse unique 인덱스 생성 완료');
    
    // 인덱스 확인
    const newIndexes = await collection.indexes();
    const emailIndex = newIndexes.find(idx => idx.name === 'email_1');
    if (emailIndex) {
      console.log('📊 생성된 인덱스 정보:', JSON.stringify(emailIndex, null, 2));
    }
    
    console.log('✅ 작업 완료!');
    process.exit(0);
  } catch (err) {
    console.error('❌ 에러:', err);
    process.exit(1);
  }
}

fixEmailIndex();

