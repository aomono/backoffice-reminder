export const dynamic = 'force-dynamic';

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportTable } from "@/components/reports/report-table";

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">報告書管理</h1>
        <Link href="/reports/new">
          <Button>新規作成</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>報告書一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportTable reports={reports} />
        </CardContent>
      </Card>
    </div>
  );
}
