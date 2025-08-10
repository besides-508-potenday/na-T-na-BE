import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activeChatbot() {
  const initialChatbots = [
    {
      name: 'F 친구 _투닥이',
      personality: '당신의 이야기에 감정 200% 몰입',
      speciality: '공감 스킬 향상을 위한 조력 메이트',
      is_unknown: false,
    },
    {
      name: '썸고수 _???',
      personality: '???',
      speciality: '연애 공감 시뮬레이션',
      is_unknown: true,
    },
    {
      name: '사회선배 _???',
      personality: '???',
      speciality: '직장 내 감정소통 연습',
      is_unknown: true,
    },
  ];

  for (const chatbot of initialChatbots) {
    await prisma.chatbot.upsert({
      where: { name: chatbot.name },
      update: {
        name: chatbot.name,
        is_unknown: chatbot.is_unknown,
        personality: chatbot.personality,
        speciality: chatbot.speciality,
      },
      create: {
        name: chatbot.name,
        is_unknown: chatbot.is_unknown,
        personality: chatbot.personality,
        speciality: chatbot.speciality,
      },
    });
  }
}

// 1. 챗봇 생성
activeChatbot()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(`❌ error during seeding: ${error}`);
    await prisma.$disconnect();
    process.exit(1);
  });
