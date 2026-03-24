import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    recurringTask: {
      findMany: vi.fn(),
    },
    monthlyDeadline: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    notificationLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/slack", () => ({
  sendSlackMessage: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn(),
}));

describe("Cron Reminder API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CRON_SECRET", "test-secret");
  });

  it("should reject requests without CRON_SECRET", async () => {
    const { GET } = await import("@/app/api/cron/reminder/route");
    const request = new Request("http://localhost/api/cron/reminder");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("should reject requests with wrong CRON_SECRET", async () => {
    const { GET } = await import("@/app/api/cron/reminder/route");
    const request = new Request("http://localhost/api/cron/reminder", {
      headers: { Authorization: "Bearer wrong-secret" },
    });
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("should accept requests with correct CRON_SECRET", async () => {
    vi.mocked(prisma.recurringTask.findMany).mockResolvedValue([]);
    vi.mocked(prisma.monthlyDeadline.findMany).mockResolvedValue([]);

    const { GET } = await import("@/app/api/cron/reminder/route");
    const request = new Request("http://localhost/api/cron/reminder", {
      headers: { Authorization: "Bearer test-secret" },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("should auto-generate MonthlyDeadline and send reminders", async () => {
    const { sendSlackMessage } = await import("@/lib/slack");
    const { sendEmail } = await import("@/lib/email");

    const mockTask = {
      id: "task-1",
      title: "請求書発行",
      type: "invoice",
      clientId: "client-1",
      client: { id: "client-1", name: "○○社" },
      frequency: "monthly",
      defaultDayOfMonth: 28,
      reminderDaysBefore: 7,
      slackChannel: "#billing",
      emailTo: "billing@example.com",
      isActive: true,
    };

    vi.mocked(prisma.recurringTask.findMany).mockResolvedValue([
      mockTask,
    ] as any);
    vi.mocked(prisma.monthlyDeadline.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.monthlyDeadline.create).mockResolvedValue({
      id: "deadline-1",
    } as any);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const mockDeadline = {
      id: "deadline-1",
      recurringTaskId: "task-1",
      clientId: "client-1",
      client: { id: "client-1", name: "○○社" },
      year,
      month,
      type: "invoice",
      deadlineDate: new Date(year, month - 1, 28),
      status: "pending",
      recurringTask: mockTask,
    };

    vi.mocked(prisma.monthlyDeadline.findMany).mockResolvedValue([
      mockDeadline,
    ] as any);
    vi.mocked(prisma.monthlyDeadline.update).mockResolvedValue({} as any);
    vi.mocked(prisma.notificationLog.create).mockResolvedValue({} as any);

    const { GET } = await import("@/app/api/cron/reminder/route");
    const request = new Request("http://localhost/api/cron/reminder", {
      headers: { Authorization: "Bearer test-secret" },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(sendSlackMessage).toHaveBeenCalledWith(
      "#billing",
      expect.stringContaining("○○社")
    );
    expect(sendEmail).toHaveBeenCalledWith(
      "billing@example.com",
      expect.stringContaining("請求書発行"),
      expect.stringContaining("請求書発行")
    );
    expect(prisma.monthlyDeadline.update).toHaveBeenCalledWith({
      where: { id: "deadline-1" },
      data: { status: "reminded" },
    });
  });
});
