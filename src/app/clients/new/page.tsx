import { ClientForm } from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">クライアント新規作成</h1>
      <ClientForm mode="create" />
    </div>
  );
}
