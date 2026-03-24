import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientTable } from "@/components/clients/client-table";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">クライアント管理</h1>
        <Link href="/clients/new">
          <Button>新規作成</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>クライアント一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientTable clients={clients} />
        </CardContent>
      </Card>
    </div>
  );
}
