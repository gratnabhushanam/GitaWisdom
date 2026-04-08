const prisma = require('../src/lib/prisma');

const mentorSeeds = [
  {
    type: 'stress',
    slokaText: 'Karmanye vadhikaraste ma phaleshu kadachana',
    meaningSimple: 'Focus on your duty, not on the result.',
    teluguExplanation: 'నీ కర్తవ్యంపై దృష్టి పెట్టు, ఫలితంపై కాదు.',
    realLifeGuidance: 'Break work into small actions and stay disciplined daily.',
  },
  {
    type: 'fear',
    slokaText: 'Na tvevaham jatu nasam na tvam neme janadhipah',
    meaningSimple: 'The soul is eternal; fear belongs to the temporary body and mind.',
    teluguExplanation: 'ఆత్మ శాశ్వతం; భయం తాత్కాలికమైన మనసు మరియు శరీరానికి చెందినది.',
    realLifeGuidance: 'When anxious, breathe deeply and remember your inner strength.',
  },
  {
    type: 'anger',
    slokaText: 'Krodhad bhavati sammohah sammohat smriti-vibhramah',
    meaningSimple: 'Anger leads to confusion and poor decisions.',
    teluguExplanation: 'కోపం మనసును మసకబార్చి నిర్ణయశక్తిని తగ్గిస్తుంది.',
    realLifeGuidance: 'Pause before reacting. Delay your response by 10 seconds.',
  },
  {
    type: 'confusion',
    slokaText: 'Vyavasayatmika buddhir ekeha kuru-nandana',
    meaningSimple: 'A focused mind follows one clear path.',
    teluguExplanation: 'ఏకాగ్రత ఉన్న మనసు స్పష్టమైన దారిని ఎంచుకుంటుంది.',
    realLifeGuidance: 'Write your top priority for the day and finish it first.',
  },
  {
    type: 'motivation',
    slokaText: 'Uddhared atmanatmanam natmanam avasadayet',
    meaningSimple: 'Lift yourself through your own effort.',
    teluguExplanation: 'నీ ప్రయత్నంతోనే నీను నీవు పైకి తీసుకెళ్లాలి.',
    realLifeGuidance: 'Start with one small positive action every morning.',
  },
];

async function main() {
  for (const item of mentorSeeds) {
    const existing = await prisma.mentorSloka.findFirst({ where: { type: item.type } });
    if (!existing) {
      await prisma.mentorSloka.create({ data: item });
    }
  }
  console.log('Mentor seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
