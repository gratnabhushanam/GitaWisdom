const admin = require('firebase-admin');

let initialized = false;

const initFcm = () => {
  if (initialized) return;
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
  initialized = true;
};

const sendDailySlokaNotification = async (title, body) => {
  initFcm();
  if (!initialized) return;

  await admin.messaging().send({
    topic: 'daily-sloka',
    notification: { title, body },
  });
};

module.exports = { sendDailySlokaNotification };
