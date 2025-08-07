import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activeChatbot() {
  const firstChatbot = await prisma.chatbot.upsert({
    where: { name: '투닥이' },
    update: {},
    create: {
      name: '투닥이',
      speciality: '공감 학습 능력기',
    },
  });

  const personalityNames: string[] = ['소심함', '감정 과몰입', '인정 욕구', '관계 중심 정서'];

  const personalities = await Promise.all(
    personalityNames.map((name) =>
      prisma.personality.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  await Promise.all(
    personalities.map((personality) =>
      prisma.chatbotPersonality.create({
        data: {
          chatbot_id: firstChatbot.id,
          personality_id: personality.id,
        },
      }),
    ),
  );
}

// 2. 공개되지 않은 2개의 챗봇
async function unknownChatbots() {
  const chatbots = [
    {
      name: '썸고수_???',
      speciality: '연애 공감 시뮬레이션',
    },
    {
      name: '사회선배_???',
      speciality: '직장 내 감정소통 연습',
    },
  ];

  // 챗봇생성
  await Promise.all(
    chatbots.map((chatbot) =>
      prisma.chatbot.upsert({
        where: { name: chatbot.name },
        update: {},
        create: {
          name: chatbot.name,
          speciality: chatbot.speciality,
          is_unknown: true,
        },
      }),
    ),
  );
}

// 1. 활성 챗봇: 투닥이
activeChatbot()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(`❌ error during seeding: ${error}`);
    await prisma.$disconnect();
    process.exit(1);
  });

// 2. 미공개 챗봇 2개
unknownChatbots()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(`❌ error during seeding: ${error}`);
    await prisma.$disconnect();
    process.exit(1);
  });
