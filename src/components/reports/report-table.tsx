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

interface Report {
  id: string;
  period: string;
  amount: number;
  status: string;
  pdfUrl: string | null;
  client: {
    id: string;
    name: string;
  };
}

interface ReportTableProps {
  reports: Report[];
}

export function ReportTable({ reports }: ReportTableProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("この報告書を削除しますか？")) return;

    const response = await fetch(`/api/reports/${id}`, { method: "DELETE" });
    if (response.ok) {
      router.refresh();
    }
  };

  if (reports.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        報告書がまだ登録されていません。
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>クライアント</TableHead>
          <TableHead>対象期間</TableHead>
          <TableHead>金額</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead>PDF</TableHead>
          <TableHead className="w-[100px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell className="font-medium">
              {report.client.name}
            </TableCell>
            <TableCell>{report.period}</TableCell>
            <TableCell>¥{report.amount.toLocaleString()}</TableCell>
            <TableCell>
              {report.status === "finalized" ? (
                <Badge variant="default">確定済</Badge>
              ) : (
                <Badge variant="secondary">下書き</Badge>
              )}
            </TableCell>
            <TableCell>
              {report.pdfUrl ? (
                <a
                  href={report.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  ダウンロード
                </a>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Link href={`/reports/${report.id}`}>
                  <Button variant="outline" size="xs">
                    詳細
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="xs"
                  onClick={() => handleDelete(report.id)}
                >
                  削除
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
