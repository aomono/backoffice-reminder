#!/bin/bash
# Claude Code Channels watchdog
# crontabで毎5分実行。tmuxセッションが死んでいたら自動再起動。

SESSION_NAME="claude-dev"
LOG="/home/ubuntu/projects/dev-team/watchdog.log"

if ! tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "$(date): Session dead, restarting..." >> $LOG
    /home/ubuntu/projects/dev-team/start-channels.sh >> $LOG 2>&1
else
    # 静かに正常確認（ログは書かない）
    :
fi
