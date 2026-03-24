import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deadline = await prisma.monthlyDeadline.findUnique({
    where: { id },
    include: { recurringTask: true },
  });
  if (!deadline) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(deadline);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const deadline = await prisma.monthlyDeadline.update({
    where: { id },
    data: {
      deadlineDate: body.deadlineDate
        ? new Date(body.deadlineDate)
        : undefined,
      status: body.status ?? undefined,
    },
  });
  return NextResponse.json(deadline);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.monthlyDeadline.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
