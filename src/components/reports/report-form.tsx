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
import { ReportPreview } from "@/components/reports/report-preview";

interface Client {
  id: string;
  name: string;
  contractSummary: string | null;
}

interface ReportFormProps {
  clients: Client[];
}

export function ReportForm({ clients }: ReportFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [clientId, setClientId] = useState("");
  const [period, setPeriod] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const companyName = "株式会社〇〇";

  const selectedClient = clients.find((c) => c.id === clientId);

  useEffect(() => {
    if (selectedClient?.contractSummary) {
      setWorkDescription(selectedClient.contractSummary);
    }
  }, [clientId, selectedClient?.contractSummary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          period,
          workDescription,
          amount: parseInt(amount, 10),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSavedReportId(data.id);
        setShowPreview(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!savedReportId) return;
    setPdfLoading(true);

    try {
      const response = await fetch(`/api/reports/${savedReportId}/pdf`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setPdfUrl(data.pdfUrl);
      }
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>報告書作成</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="clientId" className="text-sm font-medium">
                クライアント <span className="text-destructive">*</span>
              </label>
              <select
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                disabled={!!savedReportId}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">選択してください</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="period" className="text-sm font-medium">
                対象期間 <span className="text-destructive">*</span>
              </label>
              <Input
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
                disabled={!!savedReportId}
                placeholder="例: 2026年3月"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="workDescription" className="text-sm font-medium">
                業務内容 <span className="text-destructive">*</span>
              </label>
              <textarea
                id="workDescription"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                required
                disabled={!!savedReportId}
                placeholder="業務内容の詳細"
                rows={4}
                className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                金額（円） <span className="text-destructive">*</span>
              </label>
              <Input
                id="amount"
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={!!savedReportId}
                placeholder="例: 500000"
              />
            </div>

            {!savedReportId && (
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "保存中..." : "下書き保存"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/reports")}
                >
                  キャンセル
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {showPreview && selectedClient && (
        <Card>
          <CardHeader>
            <CardTitle>プレビュー</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReportPreview
              companyName={companyName}
              clientName={selectedClient.name}
              period={period}
              workDescription={workDescription}
              amount={parseInt(amount, 10) || 0}
            />

            <div className="flex gap-2">
              {!pdfUrl ? (
                <Button onClick={handleGeneratePdf} disabled={pdfLoading}>
                  {pdfLoading ? "PDF生成中..." : "PDF生成"}
                </Button>
              ) : (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">PDFダウンロード</Button>
                </a>
              )}
              <Button
                variant="outline"
                onClick={() => router.push("/reports")}
              >
                報告書一覧へ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
