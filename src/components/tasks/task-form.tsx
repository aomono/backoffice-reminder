"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Client {
  id: string;
  name: string;
}

interface TaskFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    type: string;
    clientId: string | null;
    defaultDayOfMonth: number | null;
    reminderDaysBefore: number;
    slackChannel: string | null;
    emailTo: string | null;
    isActive: boolean;
  };
}

const taskTypeOptions = [
  { value: "salary", label: "給与" },
  { value: "contractor_payment", label: "業務委託料" },
  { value: "invoice", label: "請求書" },
  { value: "report", label: "報告書" },
];

export function TaskForm({ mode, initialData }: TaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [type, setType] = useState(initialData?.type ?? "salary");
  const [clientId, setClientId] = useState(initialData?.clientId ?? "");
  const [defaultDayOfMonth, setDefaultDayOfMonth] = useState(
    initialData?.defaultDayOfMonth?.toString() ?? ""
  );
  const [reminderDaysBefore, setReminderDaysBefore] = useState(
    initialData?.reminderDaysBefore?.toString() ?? "3"
  );
  const [slackChannel, setSlackChannel] = useState(
    initialData?.slackChannel ?? ""
  );
  const [emailTo, setEmailTo] = useState(initialData?.emailTo ?? "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      type,
      clientId: clientId || null,
      defaultDayOfMonth: defaultDayOfMonth
        ? parseInt(defaultDayOfMonth, 10)
        : null,
      reminderDaysBefore: reminderDaysBefore
        ? parseInt(reminderDaysBefore, 10)
        : 3,
      slackChannel: slackChannel || null,
      emailTo: emailTo || null,
      isActive,
    };

    try {
      const url =
        mode === "create" ? "/api/tasks" : `/api/tasks/${initialData!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/tasks");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const selectClassName =
    "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "定期タスク新規作成" : "定期タスク編集"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              タイトル <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="タスク名"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              タイプ <span className="text-destructive">*</span>
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={selectClassName}
            >
              {taskTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="clientId" className="text-sm font-medium">
              クライアント
            </label>
            <select
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className={selectClassName}
            >
              <option value="">なし</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="defaultDayOfMonth" className="text-sm font-medium">
              デフォルト実行日
            </label>
            <Input
              id="defaultDayOfMonth"
              type="number"
              min={1}
              max={31}
              value={defaultDayOfMonth}
              onChange={(e) => setDefaultDayOfMonth(e.target.value)}
              placeholder="例: 25"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="reminderDaysBefore"
              className="text-sm font-medium"
            >
              リマインド日数（日前）
            </label>
            <Input
              id="reminderDaysBefore"
              type="number"
              min={0}
              max={30}
              value={reminderDaysBefore}
              onChange={(e) => setReminderDaysBefore(e.target.value)}
              placeholder="3"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slackChannel" className="text-sm font-medium">
              Slackチャンネル
            </label>
            <Input
              id="slackChannel"
              value={slackChannel}
              onChange={(e) => setSlackChannel(e.target.value)}
              placeholder="#channel-name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="emailTo" className="text-sm font-medium">
              メール通知先
            </label>
            <Input
              id="emailTo"
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="example@example.com"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              有効
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? "保存中..."
                : mode === "create"
                  ? "作成"
                  : "更新"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/tasks")}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
