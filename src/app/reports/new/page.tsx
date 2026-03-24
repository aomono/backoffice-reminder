import { prisma } from "@/lib/prisma";
import { ReportForm } from "@/components/reports/report-form";

export default async function NewReportPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      contractSummary: true,
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">報告書作成</h1>
      <ReportForm clients={clients} />
    </div>
  );
}
