"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Deadline {
  id: string;
  year: number;
  month: number;
  deadlineDate: string;
  status: "pending" | "reminded" | "completed";
  recurringTask: {
    id: string;
    title: string;
  };
  client: {
    id: string;
    name: string;
  } | null;
}

interface TaskListProps {
  deadlines: Deadline[];
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "未対応",
    className: "bg-gray-100 text-gray-800",
  },
  reminded: {
    label: "リマインド済",
    className: "bg-yellow-100 text-yellow-800",
  },
  completed: {
    label: "完了",
    className: "bg-green-100 text-green-800",
  },
};

function getDeadlineClassName(deadlineDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineDate);
  deadline.setHours(0, 0, 0, 0);

  if (deadline < today) return "text-red-600 font-medium";
  if (deadline.getTime() === today.getTime()) return "text-orange-600 font-medium";
  return "";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export function TaskList({ deadlines }: TaskListProps) {
  const router = useRouter();

  const handleComplete = async (id: string) => {
    const response = await fetch(`/api/deadlines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    if (response.ok) {
      router.refresh();
    }
  };

  if (deadlines.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        今月のタスクはありません。
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>タスク名</TableHead>
          <TableHead>クライアント</TableHead>
          <TableHead>期限日</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead className="w-[100px]">アクション</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deadlines.map((deadline) => {
          const status = statusConfig[deadline.status] ?? {
            label: deadline.status,
            className: "",
          };
          return (
            <TableRow key={deadline.id}>
              <TableCell className="font-medium">
                {deadline.recurringTask.title}
              </TableCell>
              <TableCell>{deadline.client?.name ?? "-"}</TableCell>
              <TableCell className={getDeadlineClassName(deadline.deadlineDate)}>
                {formatDate(deadline.deadlineDate)}
              </TableCell>
              <TableCell>
                <Badge className={status.className}>{status.label}</Badge>
              </TableCell>
              <TableCell>
                {deadline.status !== "completed" && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleComplete(deadline.id)}
                  >
                    完了
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
