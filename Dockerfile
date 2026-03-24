FROM node:22-slim

RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Bun (required for Channels)
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /workspace

CMD ["bash"]
