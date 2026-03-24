import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    report: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const mockReport = {
  id: "report-1",
  clientId: "client-1",
  monthlyDeadlineId: null,
  period: "2026年3月",
  workDescription: "システム開発業務",
  amount: 500000,
  pdfUrl: null,
  status: "draft",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockReportWithClient = {
  ...mockReport,
  client: {
    id: "client-1",
    name: "テストクライアント",
    contactEmail: "test@example.com",
    defaultDeadlineDay: null,
    contractSummary: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

describe("Report API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list all reports with client", async () => {
    vi.mocked(prisma.report.findMany).mockResolvedValue([
      mockReportWithClient,
    ] as never);

    const { GET } = await import("@/app/api/reports/route");
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveLength(1);
    expect(data[0].period).toBe("2026年3月");
    expect(data[0].client.name).toBe("テストクライアント");
    expect(prisma.report.findMany).toHaveBeenCalledWith({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("should create a report", async () => {
    vi.mocked(prisma.report.create).mockResolvedValue(mockReport as never);

    const { POST } = await import("@/app/api/reports/route");
    const request = new Request("http://localhost/api/reports", {
      method: "POST",
      body: JSON.stringify({
        clientId: "client-1",
        period: "2026年3月",
        workDescription: "システム開発業務",
        amount: 500000,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.period).toBe("2026年3月");
    expect(data.amount).toBe(500000);
    expect(response.status).toBe(201);
  });

  it("should get a report by id", async () => {
    vi.mocked(prisma.report.findUnique).mockResolvedValue(
      mockReportWithClient as never
    );

    const { GET } = await import("@/app/api/reports/[id]/route");
    const response = await GET(
      new Request("http://localhost/api/reports/report-1"),
      { params: Promise.resolve({ id: "report-1" }) }
    );
    const data = await response.json();

    expect(data.period).toBe("2026年3月");
    expect(data.client.name).toBe("テストクライアント");
  });

  it("should return 404 for non-existent report", async () => {
    vi.mocked(prisma.report.findUnique).mockResolvedValue(null);

    const { GET } = await import("@/app/api/reports/[id]/route");
    const response = await GET(
      new Request("http://localhost/api/reports/non-existent"),
      { params: Promise.resolve({ id: "non-existent" }) }
    );

    expect(response.status).toBe(404);
  });

  it("should update a report", async () => {
    const updatedReport = {
      ...mockReport,
      period: "2026年4月",
      amount: 600000,
    };
    vi.mocked(prisma.report.update).mockResolvedValue(updatedReport as never);

    const { PUT } = await import("@/app/api/reports/[id]/route");
    const request = new Request("http://localhost/api/reports/report-1", {
      method: "PUT",
      body: JSON.stringify({
        clientId: "client-1",
        period: "2026年4月",
        workDescription: "システム開発業務",
        amount: 600000,
      }),
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: "report-1" }),
    });
    const data = await response.json();

    expect(data.period).toBe("2026年4月");
    expect(data.amount).toBe(600000);
  });

  it("should delete a report", async () => {
    vi.mocked(prisma.report.delete).mockResolvedValue(mockReport as never);

    const { DELETE } = await import("@/app/api/reports/[id]/route");
    const response = await DELETE(
      new Request("http://localhost/api/reports/report-1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: "report-1" }) }
    );
    const data = await response.json();

    expect(data.ok).toBe(true);
  });
});
