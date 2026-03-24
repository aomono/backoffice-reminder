"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Client {
  id: string;
  name: string;
  contactEmail: string | null;
  defaultDeadlineDay: number | null;
  contractSummary: string | null;
}

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  const router = useRouter();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;

    const response = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (response.ok) {
      router.refresh();
    }
  };

  if (clients.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        クライアントがまだ登録されていません。
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名前</TableHead>
          <TableHead>メール</TableHead>
          <TableHead>デフォルト締め日</TableHead>
          <TableHead className="w-[120px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>{client.contactEmail ?? "-"}</TableCell>
            <TableCell>
              {client.defaultDeadlineDay
                ? `${client.defaultDeadlineDay}日`
                : "-"}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Link href={`/clients/${client.id}/edit`}>
                  <Button variant="outline" size="xs">編集</Button>
                </Link>
                <Button
                  variant="destructive"
                  size="xs"
                  onClick={() => handleDelete(client.id, client.name)}
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
