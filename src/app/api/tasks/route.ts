export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tasks = await prisma.recurringTask.findMany({
    include: { client: true },
    orderBy: { title: "asc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const task = await prisma.recurringTask.create({
    data: {
      title: body.title,
      type: body.type,
      clientId: body.clientId ?? null,
      defaultDayOfMonth: body.defaultDayOfMonth ?? null,
      reminderDaysBefore: body.reminderDaysBefore ?? 3,
      slackChannel: body.slackChannel ?? null,
      emailTo: body.emailTo ?? null,
      isActive: body.isActive ?? true,
    },
  });
  return NextResponse.json(task, { status: 201 });
}
