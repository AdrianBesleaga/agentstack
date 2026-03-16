FROM node:22-alpine@sha256:ad1aedbcc1b0575074a91ac146d6956476c1f9985994810e4ee02efd932a68fd
ARG RELEASE_VERSION="main"
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY ./apps/agentstack-sdk-ts/ /app/apps/agentstack-sdk-ts/
COPY ./agents/stack-claw/ /app/agents/stack-claw/
WORKDIR /app/agents/stack-claw
RUN pnpm install --frozen-lockfile
ENV PRODUCTION_MODE=True \
    RELEASE_VERSION=${RELEASE_VERSION}
CMD ["pnpm", "start"]
