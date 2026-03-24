import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TaskForm } from "@/components/tasks/task-form";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await prisma.recurringTask.findUnique({ where: { id } });

  if (!task) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">定期タスク編集</h1>
      <TaskForm
        mode="edit"
        initialData={{
          id: task.id,
          title: task.title,
          type: task.type,
          clientId: task.clientId,
          defaultDayOfMonth: task.defaultDayOfMonth,
          reminderDaysBefore: task.reminderDaysBefore,
          slackChannel: task.slackChannel,
          emailTo: task.emailTo,
          isActive: task.isActive,
        }}
      />
    </div>
  );
}
