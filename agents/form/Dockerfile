FROM python:3.13-alpine3.22 AS builder
RUN apk add --no-cache \
    build-base \
    python3-dev \
    musl-dev \
    linux-headers \
    openssl-dev \
    zlib-dev
ARG RELEASE_VERSION="main"
COPY ./agents/form/ /app/agents/form
COPY ./apps/agentstack-sdk-py/ /app/apps/agentstack-sdk-py/
WORKDIR /app/agents/form
RUN --mount=type=cache,target=/tmp/.cache/uv \
    --mount=type=bind,from=ghcr.io/astral-sh/uv:0.9.5,source=/uv,target=/bin/uv \
    UV_COMPILE_BYTECODE=1 HOME=/tmp uv sync

FROM python:3.13-alpine3.22
ARG RELEASE_VERSION="main"
COPY --from=builder /app/agents/form/.venv/ /app/agents/form/.venv/
ENV PRODUCTION_MODE=True \
    RELEASE_VERSION=${RELEASE_VERSION}
CMD ["/app/agents/form/.venv/bin/server"]
