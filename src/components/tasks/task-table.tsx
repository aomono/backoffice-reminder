"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const typeConfig: Record<string, { label: string; className: string }> = {
  salary: { label: "給与", className: "bg-blue-100 text-blue-800" },
  contractor_payment: {
    label: "業務委託料",
    className: "bg-green-100 text-green-800",
  },
  invoice: { label: "請求書", className: "bg-yellow-100 text-yellow-800" },
  report: { label: "報告書", className: "bg-purple-100 text-purple-800" },
};

interface Task {
  id: string;
  title: string;
  type: string;
  clientId: string | null;
  client: { id: string; name: string } | null;
  defaultDayOfMonth: number | null;
  reminderDaysBefore: number;
  isActive: boolean;
}

interface TaskTableProps {
  tasks: Task[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  const router = useRouter();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;

    const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (response.ok) {
      router.refresh();
    }
  };

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        定期タスクがまだ登録されていません。
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>タイトル</TableHead>
          <TableHead>タイプ</TableHead>
          <TableHead>クライアント</TableHead>
          <TableHead>実行日</TableHead>
          <TableHead>リマインド日数</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead className="w-[120px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const config = typeConfig[task.type] ?? {
            label: task.type,
            className: "",
          };
          return (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge className={config.className}>{config.label}</Badge>
              </TableCell>
              <TableCell>{task.client?.name ?? "-"}</TableCell>
              <TableCell>
                {task.defaultDayOfMonth
                  ? `${task.defaultDayOfMonth}日`
                  : "-"}
              </TableCell>
              <TableCell>{task.reminderDaysBefore}日前</TableCell>
              <TableCell>
                <Badge
                  className={
                    task.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {task.isActive ? "有効" : "無効"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Link href={`/tasks/${task.id}/edit`}>
                    <Button variant="outline" size="xs">
                      編集
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="xs"
                    onClick={() => handleDelete(task.id, task.title)}
                  >
                    削除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
