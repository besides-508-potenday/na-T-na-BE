import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. 챗봇 생성
  const firstChatbot = await prisma.chatbot.upsert({
    where: { name: '투닥이' },
    update: {},
    create: {
      name: '투닥이',
      speciality: '공감 학습 능력기',
    },
  });

  // 2. 성격 4개 데이터
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

  // 3. 챗봇성격 데이터 생성
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

main()
.then(
  async() => {await prisma.$disconnect();
})
.catch(async (error)=> {
  console.error(`❌ error during seeding: ${error}`);
  await prisma.$disconnect();
  process.exit(1);
});