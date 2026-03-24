import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    recurringTask: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const mockTask = {
  id: "1",
  title: "給与計算",
  type: "salary",
  clientId: "client-1",
  client: { id: "client-1", name: "Client A" },
  frequency: "monthly",
  defaultDayOfMonth: 25,
  reminderDaysBefore: 3,
  slackChannel: "#payroll",
  emailTo: "payroll@example.com",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTaskNoClient = {
  id: "2",
  title: "月次報告書",
  type: "report",
  clientId: null,
  client: null,
  frequency: "monthly",
  defaultDayOfMonth: 10,
  reminderDaysBefore: 5,
  slackChannel: null,
  emailTo: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Task API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list all tasks with client relation", async () => {
    vi.mocked(prisma.recurringTask.findMany).mockResolvedValue([
      mockTask,
      mockTaskNoClient,
    ] as any);

    const { GET } = await import("@/app/api/tasks/route");
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveLength(2);
    expect(data[0].title).toBe("給与計算");
    expect(data[0].client.name).toBe("Client A");
    expect(data[1].client).toBeNull();
    expect(prisma.recurringTask.findMany).toHaveBeenCalledWith({
      include: { client: true },
      orderBy: { title: "asc" },
    });
  });

  it("should create a task with client", async () => {
    vi.mocked(prisma.recurringTask.create).mockResolvedValue(mockTask as any);

    const { POST } = await import("@/app/api/tasks/route");
    const request = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: "給与計算",
        type: "salary",
        clientId: "client-1",
        defaultDayOfMonth: 25,
        reminderDaysBefore: 3,
        slackChannel: "#payroll",
        emailTo: "payroll@example.com",
        isActive: true,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.title).toBe("給与計算");
    expect(response.status).toBe(201);
  });

  it("should create a task without client", async () => {
    vi.mocked(prisma.recurringTask.create).mockResolvedValue(
      mockTaskNoClient as any
    );

    const { POST } = await import("@/app/api/tasks/route");
    const request = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: "月次報告書",
        type: "report",
        defaultDayOfMonth: 10,
        reminderDaysBefore: 5,
        isActive: true,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.title).toBe("月次報告書");
    expect(data.clientId).toBeNull();
    expect(response.status).toBe(201);
  });

  it("should get a task by id with client", async () => {
    vi.mocked(prisma.recurringTask.findUnique).mockResolvedValue(
      mockTask as any
    );

    const { GET } = await import("@/app/api/tasks/[id]/route");
    const response = await GET(new Request("http://localhost/api/tasks/1"), {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    expect(data.title).toBe("給与計算");
    expect(data.client.name).toBe("Client A");
  });

  it("should return 404 for non-existent task", async () => {
    vi.mocked(prisma.recurringTask.findUnique).mockResolvedValue(null);

    const { GET } = await import("@/app/api/tasks/[id]/route");
    const response = await GET(
      new Request("http://localhost/api/tasks/999"),
      { params: Promise.resolve({ id: "999" }) }
    );

    expect(response.status).toBe(404);
  });

  it("should update a task", async () => {
    const updatedTask = {
      ...mockTask,
      title: "給与計算（更新）",
      reminderDaysBefore: 5,
    };
    vi.mocked(prisma.recurringTask.update).mockResolvedValue(
      updatedTask as any
    );

    const { PUT } = await import("@/app/api/tasks/[id]/route");
    const request = new Request("http://localhost/api/tasks/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "給与計算（更新）",
        type: "salary",
        clientId: "client-1",
        defaultDayOfMonth: 25,
        reminderDaysBefore: 5,
        slackChannel: "#payroll",
        emailTo: "payroll@example.com",
        isActive: true,
      }),
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    expect(data.title).toBe("給与計算（更新）");
  });

  it("should delete a task", async () => {
    vi.mocked(prisma.recurringTask.delete).mockResolvedValue(mockTask as any);

    const { DELETE } = await import("@/app/api/tasks/[id]/route");
    const response = await DELETE(
      new Request("http://localhost/api/tasks/1", { method: "DELETE" }),
      { params: Promise.resolve({ id: "1" }) }
    );
    const data = await response.json();

    expect(data.ok).toBe(true);
  });
});
