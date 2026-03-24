export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = await prisma.recurringTask.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const task = await prisma.recurringTask.update({
    where: { id },
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
  return NextResponse.json(task);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.recurringTask.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
