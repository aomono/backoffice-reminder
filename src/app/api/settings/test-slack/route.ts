export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { sendSlackMessage } from "@/lib/slack";

export async function POST() {
  const channel = process.env.SLACK_DEFAULT_CHANNEL;

  if (!process.env.SLACK_BOT_TOKEN) {
    return NextResponse.json(
      { error: "SLACK_BOT_TOKEN が設定されていません" },
      { status: 400 }
    );
  }

  if (!channel) {
    return NextResponse.json(
      { error: "SLACK_DEFAULT_CHANNEL が設定されていません" },
      { status: 400 }
    );
  }

  try {
    await sendSlackMessage(
      channel,
      "BackOffice Reminder からのテスト送信です。"
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Slack test failed:", error);
    return NextResponse.json(
      { error: "Slack送信に失敗しました" },
      { status: 500 }
    );
  }
}
