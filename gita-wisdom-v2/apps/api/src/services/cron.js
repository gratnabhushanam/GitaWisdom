const cron = require('node-cron');
const prisma = require('../lib/prisma');
const { sendDailySlokaNotification } = require('./fcm');

const startDailySlokaCron = () => {
  cron.schedule('0 7 * * *', async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const sloka = await prisma.dailySloka.findFirst({
      where: {
        date: {
          gte: start,
          lt: end,
        },
      },
    });

    if (sloka) {
      await sendDailySlokaNotification('Daily Gita Wisdom', sloka.meaning.slice(0, 120));
    }
  });
};

module.exports = { startDailySlokaCron };
