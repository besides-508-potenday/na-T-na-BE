FROM node:22-alpine AS builder

WORKDIR /app

# yarn 캐시 레이어를 최적화하기 위해서 lock 파일을 먼저 복사한다.
COPY package.json yarn.lock ./

# frozen-lockfile로 정확한 버젼 설치 + 개발 의존성 포함
RUN yarn install --frozen-lockfile --production=false

COPY . .
RUN yarn build

# 운영 의존성만 설치
RUN yarn install --frozen-lockfile --production=true --ignore-scripts

FROM node:22-alpine AS production

WORKDIR /app

# yarn으로 설최된 node_modules 복사
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/yarn.lock ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1
    
CMD [ "node", "dist/main" ]