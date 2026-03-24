FROM node:22-slim

RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /workspace

CMD ["bash"]
