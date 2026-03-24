export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reports = await prisma.report.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  const body = await request.json();
  const report = await prisma.report.create({
    data: {
      clientId: body.clientId,
      monthlyDeadlineId: body.monthlyDeadlineId ?? null,
      period: body.period,
      workDescription: body.workDescription,
      amount: body.amount,
    },
  });
  return NextResponse.json(report, { status: 201 });
}
