import { TaskForm } from "@/components/tasks/task-form";

export default function NewTaskPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">定期タスク新規作成</h1>
      <TaskForm mode="create" />
    </div>
  );
}
