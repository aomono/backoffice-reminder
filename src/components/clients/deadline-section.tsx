"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RecurringTask {
  id: string;
  title: string;
  type: string;
}

interface Deadline {
  id: string;
  clientId: string | null;
  recurringTaskId: string;
  year: number;
  month: number;
  type: string;
  deadlineDate: string;
  status: string;
  recurringTask?: RecurringTask;
}

interface DeadlineSectionProps {
  clientId: string;
  recurringTasks: RecurringTask[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "未対応",
  reminded: "リマインド済",
  completed: "完了",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  reminded: "secondary",
  completed: "default",
};

const TYPE_LABELS: Record<string, string> = {
  invoice: "請求書",
  report: "報告書",
};

function DeadlineRow({
  type,
  deadline,
  clientId,
  recurringTasks,
  year,
  month,
  onSaved,
}: {
  type: string;
  deadline: Deadline | null;
  clientId: string;
  recurringTasks: RecurringTask[];
  year: number;
  month: number;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(
    deadline ? deadline.deadlineDate.split("T")[0] : ""
  );
  const [selectedTaskId, setSelectedTaskId] = useState(
    deadline?.recurringTaskId ?? ""
  );
  const [loading, setLoading] = useState(false);

  const tasksForType = recurringTasks.filter((t) => t.type === type);

  useEffect(() => {
    if (deadline) {
      setDate(deadline.deadlineDate.split("T")[0]);
      setSelectedTaskId(deadline.recurringTaskId);
    }
  }, [deadline]);

  const handleSave = async () => {
    if (!date || !selectedTaskId) return;
    setLoading(true);
    try {
      if (deadline) {
        await fetch(`/api/deadlines/${deadline.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deadlineDate: date }),
        });
      } else {
        await fetch("/api/deadlines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId,
            recurringTaskId: selectedTaskId,
            year,
            month,
            type,
            deadlineDate: date,
          }),
        });
      }
      onSaved();
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!deadline) return;
    setLoading(true);
    try {
      await fetch(`/api/deadlines/${deadline.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      onSaved();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span className="min-w-[60px] text-sm font-medium">
        {TYPE_LABELS[type] ?? type}
      </span>

      {!deadline && tasksForType.length > 0 && (
        <select
          className="rounded-md border px-2 py-1 text-sm"
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
        >
          <option value="">タスクを選択</option>
          {tasksForType.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      )}

      {deadline?.recurringTask && (
        <span className="text-sm text-muted-foreground">
          {deadline.recurringTask.title}
        </span>
      )}

      <Input
        type="date"
        className="w-auto"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {deadline && (
        <Badge variant={STATUS_VARIANTS[deadline.status] ?? "outline"}>
          {STATUS_LABELS[deadline.status] ?? deadline.status}
        </Badge>
      )}

      <div className="ml-auto flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={loading || !date || !selectedTaskId}>
          {deadline ? "更新" : "登録"}
        </Button>
        {deadline && deadline.status !== "completed" && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleComplete}
            disabled={loading}
          >
            完了にする
          </Button>
        )}
      </div>
    </div>
  );
}

export function DeadlineSection({
  clientId,
  recurringTasks,
}: DeadlineSectionProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeadlines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/deadlines?clientId=${clientId}&year=${year}&month=${month}`
      );
      const data = await res.json();
      setDeadlines(data);
    } finally {
      setLoading(false);
    }
  }, [clientId, year, month]);

  useEffect(() => {
    fetchDeadlines();
  }, [fetchDeadlines]);

  const invoiceDeadline =
    deadlines.find((d) => d.type === "invoice") ?? null;
  const reportDeadline =
    deadlines.find((d) => d.type === "report") ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          今月の締め日（{year}年{month}月）
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        ) : (
          <div className="space-y-3">
            <DeadlineRow
              type="invoice"
              deadline={invoiceDeadline}
              clientId={clientId}
              recurringTasks={recurringTasks}
              year={year}
              month={month}
              onSaved={fetchDeadlines}
            />
            <DeadlineRow
              type="report"
              deadline={reportDeadline}
              clientId={clientId}
              recurringTasks={recurringTasks}
              year={year}
              month={month}
              onSaved={fetchDeadlines}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
