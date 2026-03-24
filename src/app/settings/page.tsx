import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestButtons } from "./test-buttons";

function ConfigStatus({ configured }: { configured: boolean }) {
  return configured ? (
    <Badge variant="default">設定済み</Badge>
  ) : (
    <Badge variant="destructive">未設定</Badge>
  );
}

function SettingRow({
  label,
  value,
  secret,
}: {
  label: string;
  value: string | undefined;
  secret?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {secret ? (
        <ConfigStatus configured={!!value} />
      ) : (
        <span className="text-sm font-medium">
          {value || <span className="text-muted-foreground">未設定</span>}
        </span>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const slackBotToken = process.env.SLACK_BOT_TOKEN;
  const slackDefaultChannel = process.env.SLACK_DEFAULT_CHANNEL;
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;
  const companyName = process.env.COMPANY_NAME;
  const allowedEmails = process.env.ALLOWED_EMAILS;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Slack設定 */}
        <Card>
          <CardHeader>
            <CardTitle>Slack連携</CardTitle>
            <CardDescription>Slack通知の設定状況</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow
              label="SLACK_BOT_TOKEN"
              value={slackBotToken}
              secret
            />
            <SettingRow
              label="デフォルトチャンネル"
              value={slackDefaultChannel}
            />
          </CardContent>
        </Card>

        {/* メール設定 */}
        <Card>
          <CardHeader>
            <CardTitle>メール送信設定</CardTitle>
            <CardDescription>Resendによるメール送信の設定状況</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow
              label="RESEND_API_KEY"
              value={resendApiKey}
              secret
            />
            <SettingRow
              label="送信元メールアドレス"
              value={resendFromEmail}
            />
          </CardContent>
        </Card>

        {/* 自社情報 */}
        <Card>
          <CardHeader>
            <CardTitle>自社情報</CardTitle>
            <CardDescription>PDF出力などに使用される情報</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow label="自社名" value={companyName} />
          </CardContent>
        </Card>

        {/* 許可ユーザー */}
        <Card>
          <CardHeader>
            <CardTitle>許可ユーザー</CardTitle>
            <CardDescription>ログインを許可されたメールアドレス</CardDescription>
          </CardHeader>
          <CardContent>
            {allowedEmails ? (
              <div className="flex flex-wrap gap-2">
                {allowedEmails.split(",").map((email) => (
                  <Badge key={email.trim()} variant="secondary">
                    {email.trim()}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">未設定</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* テスト送信 */}
      <Card>
        <CardHeader>
          <CardTitle>接続テスト</CardTitle>
          <CardDescription>
            Slack・メールの送信テストを実行します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestButtons
            slackConfigured={!!slackBotToken && !!slackDefaultChannel}
            emailConfigured={!!resendApiKey && !!resendFromEmail}
          />
        </CardContent>
      </Card>
    </div>
  );
}
