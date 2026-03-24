export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const clientId = searchParams.get("clientId");

  const where: Record<string, unknown> = {};
  if (year) where.year = parseInt(year, 10);
  if (month) where.month = parseInt(month, 10);
  if (clientId) where.clientId = clientId;

  const deadlines = await prisma.monthlyDeadline.findMany({
    where,
    include: { recurringTask: true },
    orderBy: { deadlineDate: "asc" },
  });
  return NextResponse.json(deadlines);
}

export async function POST(request: Request) {
  const body = await request.json();
  const deadline = await prisma.monthlyDeadline.create({
    data: {
      clientId: body.clientId ?? null,
      recurringTaskId: body.recurringTaskId,
      year: body.year,
      month: body.month,
      type: body.type,
      deadlineDate: new Date(body.deadlineDate),
    },
  });
  return NextResponse.json(deadline, { status: 201 });
}
