// backend/scripts/checkCollections.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../src/config/db');

const checkCollections = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB 연결 완료\n');

    const db = require('mongoose').connection.db;
    const collections = await db.listCollections().toArray();

    console.log('='.repeat(80));
    console.log('📊 MongoDB 컬렉션 목록\n');
    console.log(`총 ${collections.length}개의 컬렉션이 있습니다.\n`);

    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count}개 문서`);
    }

    console.log('\n' + '='.repeat(80));
    
    // 쿠폰 관련 컬렉션 찾기
    const couponCollections = collections.filter(c => 
      c.name.toLowerCase().includes('coupon') || 
      c.name.toLowerCase().includes('쿠폰')
    );

    if (couponCollections.length > 0) {
      console.log('\n🎫 쿠폰 관련 컬렉션:\n');
      for (const collection of couponCollections) {
        const count = await db.collection(collection.name).countDocuments();
        const sample = await db.collection(collection.name).findOne();
        console.log(`  - ${collection.name}: ${count}개 문서`);
        if (sample) {
          console.log(`    샘플 데이터:`, JSON.stringify(sample, null, 2));
        }
      }
    } else {
      console.log('\n⚠️  쿠폰 관련 컬렉션을 찾을 수 없습니다.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
};

checkCollections();