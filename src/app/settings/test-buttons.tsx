"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type TestStatus = "idle" | "loading" | "success" | "error";

export function TestButtons({
  slackConfigured,
  emailConfigured,
}: {
  slackConfigured: boolean;
  emailConfigured: boolean;
}) {
  const [slackStatus, setSlackStatus] = useState<TestStatus>("idle");
  const [emailStatus, setEmailStatus] = useState<TestStatus>("idle");
  const [slackMessage, setSlackMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  async function testSlack() {
    setSlackStatus("loading");
    setSlackMessage("");
    try {
      const res = await fetch("/api/settings/test-slack", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSlackStatus("success");
        setSlackMessage("テスト送信に成功しました");
      } else {
        setSlackStatus("error");
        setSlackMessage(data.error || "送信に失敗しました");
      }
    } catch {
      setSlackStatus("error");
      setSlackMessage("通信エラーが発生しました");
    }
  }

  async function testEmail() {
    setEmailStatus("loading");
    setEmailMessage("");
    try {
      const res = await fetch("/api/settings/test-email", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setEmailStatus("success");
        setEmailMessage("テスト送信に成功しました");
      } else {
        setEmailStatus("error");
        setEmailMessage(data.error || "送信に失敗しました");
      }
    } catch {
      setEmailStatus("error");
      setEmailMessage("通信エラーが発生しました");
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="space-y-2">
        <Button
          onClick={testSlack}
          disabled={!slackConfigured || slackStatus === "loading"}
          variant={slackStatus === "success" ? "default" : slackStatus === "error" ? "destructive" : "outline"}
        >
          {slackStatus === "loading" ? "送信中..." : "Slackテスト送信"}
        </Button>
        {slackMessage && (
          <p
            className={`text-sm ${
              slackStatus === "success"
                ? "text-green-600"
                : "text-destructive"
            }`}
          >
            {slackMessage}
          </p>
        )}
        {!slackConfigured && (
          <p className="text-sm text-muted-foreground">
            Slack設定が不完全です
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Button
          onClick={testEmail}
          disabled={!emailConfigured || emailStatus === "loading"}
          variant={emailStatus === "success" ? "default" : emailStatus === "error" ? "destructive" : "outline"}
        >
          {emailStatus === "loading" ? "送信中..." : "メールテスト送信"}
        </Button>
        {emailMessage && (
          <p
            className={`text-sm ${
              emailStatus === "success"
                ? "text-green-600"
                : "text-destructive"
            }`}
          >
            {emailMessage}
          </p>
        )}
        {!emailConfigured && (
          <p className="text-sm text-muted-foreground">
            メール設定が不完全です
          </p>
        )}
      </div>
    </div>
  );
}
