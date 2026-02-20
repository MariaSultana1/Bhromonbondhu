// Cleanup script to fix duplicate key errors
const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupTicketIds() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('transporttickets');

    // Step 1: Drop the problematic index
    try {
      console.log('🗑️  Dropping old ticketId_1 index...');
      await collection.dropIndex('ticketId_1');
      console.log('✅ Dropped ticketId_1 index');
    } catch (error) {
      if (error.message.includes('index not found')) {
        console.log('ℹ️  Index doesn\'t exist');
      } else {
        throw error;
      }
    }

    // Step 2: Delete all documents with null ticketId
    console.log('🧹 Deleting documents with null ticketId...');
    const result = await collection.deleteMany({ ticketId: null });
    console.log(`✅ Deleted ${result.deletedCount} documents with null ticketId`);

    // Step 3: Create new sparse index
    console.log('🔨 Creating new sparse ticketId index...');
    await collection.createIndex({ ticketId: 1 }, { sparse: true, unique: true });
    console.log('✅ Created new sparse ticketId index');

    // Step 4: Verify
    const remainingDocs = await collection.countDocuments({ ticketId: null });
    console.log(`📊 Documents with null ticketId remaining: ${remainingDocs}`);

    const indexes = await collection.listIndexes().toArray();
    const ticketIdIndex = indexes.find(idx => idx.name === 'ticketId_1');
    console.log('📋 Current index config:', ticketIdIndex);

    console.log('\n✅ Cleanup completed successfully!');
    console.log('ℹ️  You can now restart the server.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

cleanupTicketIds();
