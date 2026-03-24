export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskList } from "@/components/dashboard/task-list";
import { NotificationLog } from "@/components/dashboard/notification-log";

export default async function Home() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const deadlines = await prisma.monthlyDeadline.findMany({
    where: { year, month },
    include: { recurringTask: true, client: true },
    orderBy: [{ status: "asc" }, { deadlineDate: "asc" }],
  });

  const notificationLogs = await prisma.notificationLog.findMany({
    include: { recurringTask: true },
    orderBy: { sentAt: "desc" },
    take: 20,
  });

  // Serialize dates to ISO strings for client components
  const serializedDeadlines = deadlines.map((d: typeof deadlines[number]) => ({
    id: d.id,
    year: d.year,
    month: d.month,
    deadlineDate: d.deadlineDate.toISOString(),
    status: d.status as "pending" | "reminded" | "completed",
    recurringTask: { id: d.recurringTask.id, title: d.recurringTask.title },
    client: d.client ? { id: d.client.id, name: d.client.name } : null,
  }));

  const serializedLogs = notificationLogs.map((l: typeof notificationLogs[number]) => ({
    id: l.id,
    channel: l.channel as "slack" | "email",
    message: l.message,
    sentAt: l.sentAt.toISOString(),
    recurringTask: { id: l.recurringTask.id, title: l.recurringTask.title },
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      <Card>
        <CardHeader>
          <CardTitle>
            今月のタスク一覧（{year}年{month}月）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaskList deadlines={serializedDeadlines} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>リマインド履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationLog logs={serializedLogs} />
        </CardContent>
      </Card>
    </div>
  );
}
