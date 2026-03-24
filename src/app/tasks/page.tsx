import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskTable } from "@/components/tasks/task-table";

export default async function TasksPage() {
  const tasks = await prisma.recurringTask.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">定期タスク管理</h1>
        <Link href="/tasks/new">
          <Button>新規作成</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>定期タスク一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskTable tasks={tasks} />
        </CardContent>
      </Card>
    </div>
  );
}
