import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    monthlyDeadline: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("Deadline API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list deadlines with filters", async () => {
    const mockDeadlines = [
      {
        id: "dl-1",
        clientId: "c-1",
        recurringTaskId: "rt-1",
        year: 2026,
        month: 3,
        type: "invoice",
        deadlineDate: new Date("2026-03-25"),
        status: "pending",
        createdAt: new Date(),
        recurringTask: { id: "rt-1", title: "請求書送付" },
      },
    ];
    vi.mocked(prisma.monthlyDeadline.findMany).mockResolvedValue(
      mockDeadlines as never
    );

    const { GET } = await import("@/app/api/deadlines/route");
    const url = "http://localhost/api/deadlines?year=2026&month=3&clientId=c-1";
    const response = await GET(new Request(url));
    const data = await response.json();

    expect(data).toHaveLength(1);
    expect(data[0].year).toBe(2026);
    expect(data[0].month).toBe(3);
    expect(prisma.monthlyDeadline.findMany).toHaveBeenCalledWith({
      where: { year: 2026, month: 3, clientId: "c-1" },
      include: { recurringTask: true },
      orderBy: { deadlineDate: "asc" },
    });
  });

  it("should list deadlines without filters", async () => {
    vi.mocked(prisma.monthlyDeadline.findMany).mockResolvedValue([]);

    const { GET } = await import("@/app/api/deadlines/route");
    const response = await GET(new Request("http://localhost/api/deadlines"));
    const data = await response.json();

    expect(data).toHaveLength(0);
    expect(prisma.monthlyDeadline.findMany).toHaveBeenCalledWith({
      where: {},
      include: { recurringTask: true },
      orderBy: { deadlineDate: "asc" },
    });
  });

  it("should create a deadline", async () => {
    const newDeadline = {
      id: "dl-2",
      clientId: "c-1",
      recurringTaskId: "rt-1",
      year: 2026,
      month: 3,
      type: "invoice",
      deadlineDate: new Date("2026-03-25"),
      status: "pending",
      createdAt: new Date(),
    };
    vi.mocked(prisma.monthlyDeadline.create).mockResolvedValue(
      newDeadline as never
    );

    const { POST } = await import("@/app/api/deadlines/route");
    const request = new Request("http://localhost/api/deadlines", {
      method: "POST",
      body: JSON.stringify({
        clientId: "c-1",
        recurringTaskId: "rt-1",
        year: 2026,
        month: 3,
        type: "invoice",
        deadlineDate: "2026-03-25",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.id).toBe("dl-2");
    expect(response.status).toBe(201);
    expect(prisma.monthlyDeadline.create).toHaveBeenCalledWith({
      data: {
        clientId: "c-1",
        recurringTaskId: "rt-1",
        year: 2026,
        month: 3,
        type: "invoice",
        deadlineDate: new Date("2026-03-25"),
      },
    });
  });

  it("should get a deadline by id", async () => {
    const mockDeadline = {
      id: "dl-1",
      clientId: "c-1",
      recurringTaskId: "rt-1",
      year: 2026,
      month: 3,
      type: "invoice",
      deadlineDate: new Date("2026-03-25"),
      status: "pending",
      createdAt: new Date(),
      recurringTask: { id: "rt-1", title: "請求書送付" },
    };
    vi.mocked(prisma.monthlyDeadline.findUnique).mockResolvedValue(
      mockDeadline as never
    );

    const { GET } = await import("@/app/api/deadlines/[id]/route");
    const response = await GET(
      new Request("http://localhost/api/deadlines/dl-1"),
      { params: Promise.resolve({ id: "dl-1" }) }
    );
    const data = await response.json();

    expect(data.id).toBe("dl-1");
  });

  it("should return 404 for non-existent deadline", async () => {
    vi.mocked(prisma.monthlyDeadline.findUnique).mockResolvedValue(null);

    const { GET } = await import("@/app/api/deadlines/[id]/route");
    const response = await GET(
      new Request("http://localhost/api/deadlines/dl-999"),
      { params: Promise.resolve({ id: "dl-999" }) }
    );

    expect(response.status).toBe(404);
  });

  it("should update deadline status to completed", async () => {
    const updatedDeadline = {
      id: "dl-1",
      clientId: "c-1",
      recurringTaskId: "rt-1",
      year: 2026,
      month: 3,
      type: "invoice",
      deadlineDate: new Date("2026-03-25"),
      status: "completed",
      createdAt: new Date(),
    };
    vi.mocked(prisma.monthlyDeadline.update).mockResolvedValue(
      updatedDeadline as never
    );

    const { PUT } = await import("@/app/api/deadlines/[id]/route");
    const request = new Request("http://localhost/api/deadlines/dl-1", {
      method: "PUT",
      body: JSON.stringify({
        status: "completed",
      }),
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: "dl-1" }),
    });
    const data = await response.json();

    expect(data.status).toBe("completed");
    expect(prisma.monthlyDeadline.update).toHaveBeenCalledWith({
      where: { id: "dl-1" },
      data: {
        deadlineDate: undefined,
        status: "completed",
      },
    });
  });

  it("should update deadline date", async () => {
    const updatedDeadline = {
      id: "dl-1",
      clientId: "c-1",
      recurringTaskId: "rt-1",
      year: 2026,
      month: 3,
      type: "invoice",
      deadlineDate: new Date("2026-03-28"),
      status: "pending",
      createdAt: new Date(),
    };
    vi.mocked(prisma.monthlyDeadline.update).mockResolvedValue(
      updatedDeadline as never
    );

    const { PUT } = await import("@/app/api/deadlines/[id]/route");
    const request = new Request("http://localhost/api/deadlines/dl-1", {
      method: "PUT",
      body: JSON.stringify({
        deadlineDate: "2026-03-28",
      }),
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: "dl-1" }),
    });
    const data = await response.json();

    expect(data.deadlineDate).toBeDefined();
    expect(prisma.monthlyDeadline.update).toHaveBeenCalledWith({
      where: { id: "dl-1" },
      data: {
        deadlineDate: new Date("2026-03-28"),
        status: undefined,
      },
    });
  });

  it("should delete a deadline", async () => {
    vi.mocked(prisma.monthlyDeadline.delete).mockResolvedValue({
      id: "dl-1",
      clientId: "c-1",
      recurringTaskId: "rt-1",
      year: 2026,
      month: 3,
      type: "invoice",
      deadlineDate: new Date("2026-03-25"),
      status: "pending",
      createdAt: new Date(),
    } as never);

    const { DELETE } = await import("@/app/api/deadlines/[id]/route");
    const response = await DELETE(
      new Request("http://localhost/api/deadlines/dl-1", { method: "DELETE" }),
      { params: Promise.resolve({ id: "dl-1" }) }
    );
    const data = await response.json();

    expect(data.ok).toBe(true);
  });
});
