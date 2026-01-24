
const mongoose = require("mongoose");

const uri = "mongodb://bhromonbondhu_db_user:softwareproject@bhromonbondhu-shard-00-00.kv3x9uu.mongodb.net:27017,bhromonbondhu-shard-00-01.kv3x9uu.mongodb.net:27017,bhromonbondhu-shard-00-02.kv3x9uu.mongodb.net:27017/testdb?ssl=true&replicaSet=atlas-abc-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Connection Error:\n", err));
