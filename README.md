## 목차

- [목차](#목차)
- [프로젝트 소개](#프로젝트-소개)
- [설계](#설계)
  - [ERD 다이어그램](#erd-다이어그램)
  - [시퀀스 다이어그램](#시퀀스-다이어그램)
- [프로젝트 구조](#프로젝트-구조)
  - [백엔드 API 설명](#백엔드-api-설명)
- [프로젝트 셋팅 방법](#프로젝트-셋팅-방법)
  - [프로젝트 초기 셋팅](#프로젝트-초기-셋팅)
  - [프로젝트 실행](#프로젝트-실행)
  - [단위테스트 케이스 실행](#단위테스트-케이스-실행)

---

## 프로젝트 소개

![na-t-na-intro](./docs/na-t-na-intro.png)

> 프로젝트 시연영상

![](https://github.com/user-attachments/assets/03562005-99b1-4b57-83d9-137b84915be5)

<br>

> 백엔드 파트 사용 기술스택

- Language / Framework / Package-Manager: ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)
- Web Socket: ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
- Testing: ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
- RDBMS / NoSQL: ![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white) ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
- Cloud: ![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
- EC2, ALB(Application Load Balancer), Route53, ACM, S3, VPC
- CI/CD: ![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white) ![PM2](https://img.shields.io/badge/PM2-%232B037A?style=for-the-badge&logo=PM2&logoColor=white)

---

## 설계

### ERD 다이어그램

![domain-relations](./docs/domain-relations.png)

- [dbdiagram link - Na-T-Na ERD](https://dbdiagram.io/d/na-T-na-BE-ERD-688b84b6cca18e685caf46b2)

![na-t-na-erd](./docs/na-T-na-BE-ERD.png)

### 시퀀스 다이어그램

---

## 프로젝트 구조

- 7개의 도메인을 주축으로 모듈생성
  비즈니스를 이루는 도메인은 `Chatbot`, `Chatroom`, `Message`, `Quiz`, `External-API`,`Quiz`, `User` 으로 각 7개는 독립적인 모듈과 프로바이더로 구성되어있습니다.

- 클린아키텍쳐와 레이어드아키텍쳐을 모델로 프로젝트의 각 도메인별 계층을 구성하였습니다.
- 각 도메인에는 `domain`, `presentation`, `infrastructure` 3개의 계층을 갖고있습니다.
  - `domain`
    - 해당 도메인의 비즈니스룰과 핵심을 나타냅니다.
    - 서비스로직, 비즈니스규칙, 래포지토리 인터페이스, 서비스 unit-test 로 구성되어있습니다.
  - `presentation`
    - 컨트롤러(REST API), 게이트웨이(Web-Socket) 등 에 해당되며, API요청할때 먼저 접근되는 프레젠테이션 및 이벤트/URL 라우팅 계층을 의미합니다.
  - `infrastructure`
    - 도메인계층에서는 래포지토리 인터페이스이며, 인터페이스의 실제 구현체를 의미합니다. 데이터베이스와 연결된 ORM을 이용하여 query에 알맞는 리스폰스를 응답합니다.

```bash
chatbots
├─ chatbots.module.ts
├─ domain
│  ├─ chatbot-with-personalities.type.ts
│  ├─ chatbot.policy.ts
│  ├─ chatbot.repository.interface.ts
│  ├─ chatbots.service.test.ts
│  └─ chatbots.service.ts
├─ infrastructure
│  └─ chatbot.repository.ts
└─ presentation
   ├─ chatbots.controller.ts
   └─ dto
        └─ get-chatbots.response.dto.ts
```

- 전체 프로젝트 구조

```bash
📦
├─ .dockerignore
├─ .env.test
├─ .github
│  └─ workflows
│     ├─ deploy-production.yml
│     └─ test.yml
├─ .gitignore
├─ .prettierrc
├─ .vscode
│  └─ launch.json
├─ Dockerfile
├─ README.md
├─ docker-compose.yml
├─ eslint.config.mjs
├─ jest.config.json
├─ nest-cli.json
├─ package.json
├─ prisma
│  ├─ first-chatbot-seeds.ts
│  └─ schema.prisma
├─ src
│  ├─ app.controller.spec.ts
│  ├─ app.controller.ts
│  ├─ app.module.ts
│  ├─ app.service.ts
│  │
│  ├─ chatbots
│  │  ├─ chatbots.module.ts
│  │  ├─ domain
│  │  │  ├─ chatbot-with-personalities.type.ts
│  │  │  ├─ chatbot.policy.ts
│  │  │  ├─ chatbot.repository.interface.ts
│  │  │  ├─ chatbots.service.test.ts
│  │  │  └─ chatbots.service.ts
│  │  ├─ infrastructure
│  │  │  └─ chatbot.repository.ts
│  │  └─ presentation
│  │     ├─ chatbots.controller.ts
│  │     └─ dto
│  │        └─ get-chatbots.response.dto.ts
│  │
│  ├─ chatrooms
│  │  ├─ chatrooms.module.ts
│  │  ├─ domain
│  │  │  ├─ chatroom-feedback-buisness-rule.ts
│  │  │  ├─ chatroom.repository.interface.ts
│  │  │  ├─ chatrooms.service.spec.ts
│  │  │  ├─ chatrooms.service.ts
│  │  │  └─ chatting-socket-business-rule.ts
│  │  ├─ infrastructure
│  │  │  └─ chatroom.repository.ts
│  │  └─ presentation
│  │     ├─ chatrooms.controller.ts
│  │     ├─ chatrooms.gateway.ts
│  │     └─ dto
│  │        ├─ answer.dto.ts
│  │        ├─ get-last-letter.dto.ts
│  │        └─ join-room.dto.ts
│  │
│  ├─ common
│  │  ├─ S3_URL.ts
│  │  ├─ common.module.ts
│  │  ├─ custom-exceptions
│  │  │  ├─ base-custom-exception.ts
│  │  │  └─ policy-errors.ts
│  │  ├─ global-exception.filter.ts
│  │  ├─ swagger-mock-api.service.ts
│  │  ├─ swagger-mock.interceptor.spec.ts
│  │  └─ swagger-mock.interceptor.ts
│  │
│  ├─ external-api
│  │  ├─ dto
│  │  │  ├─ request-chatbot-reaction-from-conversation.dto.ts
│  │  │  ├─ request-create-situation.dto.ts
│  │  │  └─ request-feedback.dto.ts
│  │  ├─ external-api.module.ts
│  │  ├─ external-api.service.spec.ts
│  │  └─ external-api.service.ts
│  │
│  ├─ main.ts
│  │
│  ├─ messages
│  │  ├─ domain
│  │  │  ├─ message-business-rule.ts
│  │  │  ├─ message.cache-store.interface.ts
│  │  │  ├─ message.repository.interface.ts
│  │  │  ├─ message.type.ts
│  │  │  ├─ messages.service.spec.ts
│  │  │  └─ messages.service.ts
│  │  ├─ infrastructure
│  │  │  ├─ message.cache-store.ts
│  │  │  └─ message.repository.ts
│  │  └─ messages.module.ts
│  │
│  ├─ prisma
│  │  ├─ prisma.module.ts
│  │  └─ prisma.service.ts
│  │
│  ├─ quizes
│  │  ├─ domain
│  │  │  ├─ dto
│  │  │  │  └─ update-quiz.dto.ts
│  │  │  ├─ quiz-list.type.ts
│  │  │  ├─ quiz.cache-store.interface.ts
│  │  │  ├─ quiz.repository.interface.ts
│  │  │  ├─ quizes.service.spec.ts
│  │  │  └─ quizes.service.ts
│  │  ├─ infrastructure
│  │  │  ├─ quiz.cache-store.ts
│  │  │  └─ quiz.repository.ts
│  │  └─ quizes.module.ts
│  │
│  ├─ redis
│  │  ├─ redis.module.ts
│  │  ├─ redis.service-integration.test.ts
│  │  ├─ redis.service.interface.ts
│  │  └─ redis.service.ts
│  │
│  └─ users
│     ├─ domain
│     │  ├─ create-user.dto.ts
│     │  ├─ user.policy.ts
│     │  ├─ user.repository.interface.ts
│     │  ├─ users.service.spec.ts
│     │  └─ users.service.ts
│     ├─ infrastructure
│     │  └─ user.repository.ts
│     ├─ presentation
│     │  └─ users.controller.ts
│     └─ users.module.ts
├─ test
│  └─ jest-e2e.json
├─ tsconfig.build.json
├─ tsconfig.json
└─ yarn.lock

```

### 백엔드 API 설명

---

## 프로젝트 셋팅 방법

### 프로젝트 초기 셋팅

- Mysql8.0, Reids 먼저 설치 권장
- 도커실행을 하게되면 아래 명령어로 로컬환경 도커 셋팅을 한다.

```bash
docker-compose up -d
```

- 프로젝트 사용 패키지 인스톨

```bash
yarn install
```

- 연결된 데이터베이스에 prisma ORM 반영하기

```bash
npx prisma generate
npx prisma db push
```

- 초기 챗봇(투닥이) 데이터 초기셋팅

```bash
npx prisma db seed
```

### 프로젝트 실행

```bash
# 일반 실행
$ yarn run start

# 개발모드
$ yarn run start:dev

```

### 단위테스트 케이스 실행

```bash
# unit tests
$ yarn run test

```
