import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientForm } from "@/components/clients/client-form";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });

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
    </div>
  );
}
