#!/bin/bash
# Claude Code Channels - 24/7 runner
# Usage: ./start-channels.sh

SESSION_NAME="claude-dev"
CONTAINER="claude-dev"

# コンテナが動いていなければ起動
docker compose -f ~/projects/dev-team/docker-compose.yml up -d

# 既存のtmuxセッションがあれば削除
tmux kill-session -t $SESSION_NAME 2>/dev/null

# tmuxセッションを作成してClaude Codeを起動
tmux new-session -d -s $SESSION_NAME \
  "docker exec -it $CONTAINER bash -c 'export PATH=/root/.bun/bin:\$PATH && claude --channels plugin:telegram@claude-plugins-official'"

echo "✅ Claude Code Channels started in tmux session: $SESSION_NAME"
echo ""
echo "Commands:"
echo "  tmux attach -t $SESSION_NAME    # セッションに入る"
echo "  tmux kill-session -t $SESSION_NAME  # 停止"
echo "  tmux ls                          # セッション一覧"
