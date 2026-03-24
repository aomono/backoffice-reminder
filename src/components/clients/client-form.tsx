"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ClientFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
    contactEmail: string | null;
    defaultDeadlineDay: number | null;
    contractSummary: string | null;
  };
}

export function ClientForm({ mode, initialData }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name ?? "");
  const [contactEmail, setContactEmail] = useState(
    initialData?.contactEmail ?? ""
  );
  const [defaultDeadlineDay, setDefaultDeadlineDay] = useState(
    initialData?.defaultDeadlineDay?.toString() ?? ""
  );
  const [contractSummary, setContractSummary] = useState(
    initialData?.contractSummary ?? ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      contactEmail: contactEmail || null,
      defaultDeadlineDay: defaultDeadlineDay
        ? parseInt(defaultDeadlineDay, 10)
        : null,
      contractSummary: contractSummary || null,
    };

    try {
      const url =
        mode === "create"
          ? "/api/clients"
          : `/api/clients/${initialData!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/clients");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "クライアント新規作成" : "クライアント編集"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              名前 <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="クライアント名"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contactEmail" className="text-sm font-medium">
              連絡先メール
            </label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="example@example.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="defaultDeadlineDay"
              className="text-sm font-medium"
            >
              デフォルト締め日
            </label>
            <Input
              id="defaultDeadlineDay"
              type="number"
              min={1}
              max={31}
              value={defaultDeadlineDay}
              onChange={(e) => setDefaultDeadlineDay(e.target.value)}
              placeholder="例: 25"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contractSummary" className="text-sm font-medium">
              契約概要
            </label>
            <textarea
              id="contractSummary"
              value={contractSummary}
              onChange={(e) => setContractSummary(e.target.value)}
              placeholder="契約内容の概要"
              rows={4}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
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
              onClick={() => router.push("/clients")}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
