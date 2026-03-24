import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientForm } from "@/components/clients/client-form";
import { DeadlineSection } from "@/components/clients/deadline-section";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, recurringTasks] = await Promise.all([
    prisma.client.findUnique({ where: { id } }),
    prisma.recurringTask.findMany({
      where: {
        OR: [{ clientId: id }, { clientId: null }],
        isActive: true,
        type: { in: ["invoice", "report"] },
      },
      select: { id: true, title: true, type: true },
      orderBy: { title: "asc" },
    }),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">クライアント編集</h1>
      <ClientForm
        mode="edit"
        initialData={{
          id: client.id,
          name: client.name,
          contactEmail: client.contactEmail,
          defaultDeadlineDay: client.defaultDeadlineDay,
          contractSummary: client.contractSummary,
        }}
      />
      <DeadlineSection clientId={client.id} recurringTasks={recurringTasks} />
    </div>
  );
}
