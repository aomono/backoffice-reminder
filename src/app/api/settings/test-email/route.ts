export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST() {
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY が設定されていません" },
      { status: 400 }
    );
  }

  if (!fromEmail) {
    return NextResponse.json(
      { error: "RESEND_FROM_EMAIL が設定されていません" },
      { status: 400 }
    );
  }

  try {
    await sendEmail(
      fromEmail,
      "BackOffice Reminder テスト送信",
      "これはBackOffice Reminderからのテストメールです。正常に送信されています。"
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email test failed:", error);
    return NextResponse.json(
      { error: "メール送信に失敗しました" },
      { status: 500 }
    );
  }
}
