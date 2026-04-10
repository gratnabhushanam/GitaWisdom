/**
 * Seed script to populate MongoDB with sample reels, kids videos, and quiz questions.
 * Run: node scripts/seedData.js
 */
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const fs = require('fs');

const MONGO_URI = process.env.MONGO_URI;
const QUIZ_FILE = path.join(__dirname, '..', 'data', 'quizQuestions.json');

const VideoMongoSchema = new mongoose.Schema({}, {
  strict: false,
  timestamps: true,
  collection: 'videos',
});
const VideoMongo = mongoose.models.VideoMongo || mongoose.model('VideoMongo', VideoMongoSchema);

// ── Sample Reels (curated, not user reels) ──
const sampleReels = [
  {
    title: 'Krishna\'s Butter Leela',
    description: 'Watch the divine play of little Krishna stealing butter from the gopis.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'reels',
    tags: ['krishna', 'leela', 'butter', 'spiritual'],
    isUserReel: false,
    isKids: false,
    contentType: 'spiritual',
    moderationStatus: 'approved',
    uploadSource: 'admin',
    collectionTitle: 'Krishna Leelas',
    likesCount: 42,
    sharesCount: 12,
    commentsCount: 5,
    likedBy: [],
    comments: [
      {
        id: 1,
        userId: 1,
        userName: 'Devotee',
        text: 'Jai Shri Krishna! 🙏',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    title: 'Bhagavad Gita Chapter 2 Summary',
    description: 'A quick 60-second summary of Sankhya Yoga – the Yoga of Knowledge.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'reels',
    tags: ['gita', 'chapter2', 'sankhya', 'yoga', 'spiritual'],
    isUserReel: false,
    isKids: false,
    contentType: 'spiritual',
    moderationStatus: 'approved',
    uploadSource: 'admin',
    collectionTitle: 'Bhagavad Gita',
    likesCount: 89,
    sharesCount: 34,
    commentsCount: 8,
    likedBy: [],
    comments: [],
  },
  {
    title: 'Hanuman Chalisa – Divine Power',
    description: 'Experience the divine energy of Hanuman Chalisa in this short spiritual reel.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'reels',
    tags: ['hanuman', 'chalisa', 'bhakti', 'spiritual'],
    isUserReel: false,
    isKids: false,
    contentType: 'spiritual',
    moderationStatus: 'approved',
    uploadSource: 'admin',
    collectionTitle: 'Hanuman Stories',
    likesCount: 156,
    sharesCount: 67,
    commentsCount: 12,
    likedBy: [],
    comments: [],
  },
  {
    title: 'Karma Yoga Explained',
    description: 'What is Karma Yoga? Learn the path of selfless action from the Bhagavad Gita.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'reels',
    tags: ['karma', 'yoga', 'gita', 'action', 'spiritual'],
    isUserReel: false,
    isKids: false,
    contentType: 'spiritual',
    moderationStatus: 'approved',
    uploadSource: 'admin',
    collectionTitle: 'Bhagavad Gita',
    likesCount: 73,
    sharesCount: 28,
    commentsCount: 3,
    likedBy: [],
    comments: [],
  },
  {
    title: 'Lord Rama – The Ideal King',
    description: 'A short reel about the virtues of Lord Rama and his reign of Dharma.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'reels',
    tags: ['rama', 'dharma', 'ramayana', 'spiritual'],
    isUserReel: false,
    isKids: false,
    contentType: 'spiritual',
    moderationStatus: 'approved',
    uploadSource: 'admin',
    collectionTitle: 'Ramayana',
    likesCount: 112,
    sharesCount: 45,
    commentsCount: 7,
    likedBy: [],
    comments: [],
  },
];

// ── Additional Quiz Questions ──
const additionalQuizQuestions = [
  {
    questionText: 'What is the main teaching of Karma Yoga?',
    category: 'Gita Teachings',
    videoUrl: '',
    options: [
      { answerText: 'Renounce all work', isCorrect: false },
      { answerText: 'Act without attachment to results', isCorrect: true },
      { answerText: 'Only meditate', isCorrect: false },
      { answerText: 'Pursue wealth', isCorrect: false },
    ],
  },
  {
    questionText: 'Where was the Bhagavad Gita spoken?',
    category: 'Gita Basics',
    videoUrl: '',
    options: [
      { answerText: 'Ayodhya', isCorrect: false },
      { answerText: 'Kurukshetra battlefield', isCorrect: true },
      { answerText: 'Vrindavan', isCorrect: false },
      { answerText: 'Dwarka', isCorrect: false },
    ],
  },
  {
    questionText: 'What does "Yoga" mean in the Bhagavad Gita?',
    category: 'Gita Teachings',
    videoUrl: '',
    options: [
      { answerText: 'Physical exercise', isCorrect: false },
      { answerText: 'Union with the Divine', isCorrect: true },
      { answerText: 'Breathing technique', isCorrect: false },
      { answerText: 'A type of dance', isCorrect: false },
    ],
  },
  {
    questionText: 'Who narrated the Bhagavad Gita to King Dhritarashtra?',
    category: 'Gita Basics',
    videoUrl: '',
    options: [
      { answerText: 'Vidura', isCorrect: false },
      { answerText: 'Bhishma', isCorrect: false },
      { answerText: 'Sanjaya', isCorrect: true },
      { answerText: 'Drona', isCorrect: false },
    ],
  },
  {
    questionText: 'What is the last chapter of Bhagavad Gita called?',
    category: 'Gita Chapters',
    videoUrl: '',
    options: [
      { answerText: 'Karma Yoga', isCorrect: false },
      { answerText: 'Bhakti Yoga', isCorrect: false },
      { answerText: 'Moksha Sannyasa Yoga', isCorrect: true },
      { answerText: 'Dhyana Yoga', isCorrect: false },
    ],
  },
  {
    questionText: 'What is "Dharma" according to the Gita?',
    category: 'Gita Teachings',
    videoUrl: '',
    options: [
      { answerText: 'Earning money', isCorrect: false },
      { answerText: 'Righteous duty', isCorrect: true },
      { answerText: 'Physical strength', isCorrect: false },
      { answerText: 'Royal power', isCorrect: false },
    ],
  },
  {
    questionText: 'Which form did Krishna show Arjuna in Chapter 11?',
    category: 'Gita Chapters',
    videoUrl: '',
    options: [
      { answerText: 'Child form', isCorrect: false },
      { answerText: 'Vishwarupa (Universal form)', isCorrect: true },
      { answerText: 'Warrior form', isCorrect: false },
      { answerText: 'Sage form', isCorrect: false },
    ],
  },
  {
    questionText: 'How many slokas are there in Bhagavad Gita?',
    category: 'Gita Basics',
    videoUrl: '',
    options: [
      { answerText: '500', isCorrect: false },
      { answerText: '700', isCorrect: true },
      { answerText: '1000', isCorrect: false },
      { answerText: '108', isCorrect: false },
    ],
  },
];

async function seedReels() {
  // Check if reels already exist
  const existingReels = await VideoMongo.countDocuments({ isUserReel: false, category: 'reels' });
  if (existingReels > 0) {
    console.log(`✓ ${existingReels} curated reels already exist in MongoDB. Skipping reel seed.`);
    return;
  }

  const result = await VideoMongo.insertMany(sampleReels);
  console.log(`✓ Seeded ${result.length} curated reels into MongoDB.`);
}

async function seedQuizQuestions() {
  try {
    let existing = [];
    if (fs.existsSync(QUIZ_FILE)) {
      const raw = fs.readFileSync(QUIZ_FILE, 'utf8');
      existing = JSON.parse(raw);
    }

    if (existing.length >= 5) {
      console.log(`✓ ${existing.length} quiz questions already exist. Skipping quiz seed.`);
      return;
    }

    const maxId = existing.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
    const now = new Date().toISOString();

    const newQuestions = additionalQuizQuestions.map((q, i) => ({
      ...q,
      id: maxId + i + 1,
      createdAt: now,
      updatedAt: now,
    }));

    const all = [...existing, ...newQuestions];
    
    // Ensure data directory exists
    const dataDir = path.dirname(QUIZ_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(QUIZ_FILE, JSON.stringify(all, null, 2), 'utf8');
    console.log(`✓ Added ${newQuestions.length} quiz questions. Total: ${all.length}.`);
  } catch (err) {
    console.error('Failed to seed quiz questions:', err.message);
  }
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB.\n');

  await seedReels();
  await seedQuizQuestions();

  console.log('\n✅ Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
