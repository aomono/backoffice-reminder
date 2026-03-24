import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NotificationLogEntry {
  id: string;
  channel: "slack" | "email";
  message: string;
  sentAt: string;
  recurringTask: {
    id: string;
    title: string;
  };
}

interface NotificationLogProps {
  logs: NotificationLogEntry[];
}

const channelConfig: Record<string, { label: string; className: string }> = {
  slack: {
    label: "Slack",
    className: "bg-purple-100 text-purple-800",
  },
  email: {
    label: "Email",
    className: "bg-blue-100 text-blue-800",
  },
};

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const date = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${date} ${time}`;
}

export function NotificationLog({ logs }: NotificationLogProps) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        通知履歴はまだありません。
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[160px]">送信日時</TableHead>
          <TableHead className="w-[80px]">チャネル</TableHead>
          <TableHead>メッセージ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => {
          const channel = channelConfig[log.channel] ?? {
            label: log.channel,
            className: "",
          };
          return (
            <TableRow key={log.id}>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTime(log.sentAt)}
              </TableCell>
              <TableCell>
                <Badge className={channel.className}>{channel.label}</Badge>
              </TableCell>
              <TableCell className="text-sm">{log.message}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
