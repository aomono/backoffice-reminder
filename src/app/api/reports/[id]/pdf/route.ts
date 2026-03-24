export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { generateReportPdf } from "@/lib/pdf";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const companyName = process.env.COMPANY_NAME ?? "株式会社〇〇";
  const issueDate = new Date().toLocaleDateString("ja-JP");

  const pdfBuffer = await generateReportPdf({
    companyName,
    clientName: report.client.name,
    period: report.period,
    workDescription: report.workDescription,
    amount: report.amount,
    issueDate,
  });

  const blob = await put(
    `reports/${id}/${report.period.replace(/\s+/g, "_")}.pdf`,
    pdfBuffer,
    { access: "public", contentType: "application/pdf" }
  );

  const updated = await prisma.report.update({
    where: { id },
    data: {
      pdfUrl: blob.url,
      status: "finalized",
    },
  });

  return NextResponse.json({ pdfUrl: updated.pdfUrl });
}
