const mongoose = require('mongoose');
const VideoMongo = require('./models/mongo/VideoMongo');
mongoose.connect('mongodb://127.0.0.1:27017/gita-wisdom').then(async () => {
  const reels = await VideoMongo.find({ isUserReel: true });
  console.log("REELS:", JSON.stringify(reels, null, 2));
  process.exit(0);
});
