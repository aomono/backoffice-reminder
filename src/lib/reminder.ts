export function shouldSendReminder(
  deadline: Date,
  today: Date,
  reminderDaysBefore: number
): boolean {
  const reminderStart = new Date(deadline);
  reminderStart.setDate(reminderStart.getDate() - reminderDaysBefore);
  return today >= reminderStart;
}

export function buildReminderMessage(
  taskTitle: string,
  clientName: string | null,
  deadline: Date,
  today: Date
): string {
  const diffMs = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const target = clientName ? `${clientName}の${taskTitle}` : taskTitle;
  const dateStr = `${deadline.getMonth() + 1}/${deadline.getDate()}`;

  if (diffDays < 0)
    return `【期限超過】${target} 期限: ${dateStr}（${Math.abs(diffDays)}日超過）`;
  if (diffDays === 0) return `【本日期限！】${target} 期限: ${dateStr}`;
  return `【リマインド】${target} 期限: ${dateStr}（あと${diffDays}日）`;
}
