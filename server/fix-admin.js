
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function fixAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');


    const email = 'bhromonbondhu@gmail.com'; // <-- your admin email
    const newPassword = 'admin123';  // <-- set desired password

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await usersCollection.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          role: 'admin',
          password: hashedPassword,
          isActive: true
        }
      }
    );

    if (result.matchedCount === 0) {
      console.log('❌ User not found with email:', email);
      console.log('   Available users:');
      const users = await usersCollection.find({}, { projection: { email: 1, username: 1, role: 1 } }).toArray();
      users.forEach(u => console.log(`   - ${u.email} (${u.username}) → role: ${u.role}`));
    } else {
      console.log('✅ Admin user fixed!');
      console.log(`   Email: ${email}`);
      console.log(`   New password: ${newPassword}`);
      console.log(`   Role: admin`);
      console.log(`   isActive: true`);
    }

    await mongoose.disconnect();
    console.log('\n🎉 Done! You can now login with:');
    console.log(`   Username/Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n⚠️  Delete this file after use!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdmin();