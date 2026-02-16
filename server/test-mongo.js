const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Atlas Connection...');
console.log('📍 URI:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':***@'));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log('📊 Database:', mongoose.connection.name);
  console.log('🖥️  Host:', mongoose.connection.host);
  process.exit(0);
})
.catch((err) => {
  console.error('❌ Connection Failed');
  console.error('Error:', err.message);
  
  if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
    console.error('\n⚠️  Network/DNS Error - Your IP might not be whitelisted');
    console.error('Steps to fix:');
    console.error('1. Go to MongoDB Atlas → Network Access');
    console.error('2. Click "+ Add IP Address"');
    console.error('3. Select "Allow Access from Anywhere"');
    console.error('4. Wait 5-10 minutes');
    console.error('5. Run this test again');
  } else if (err.message.includes('authentication')) {
    console.error('\n⚠️  Authentication Error - Check username/password in .env');
  }
  
  process.exit(1);
});
