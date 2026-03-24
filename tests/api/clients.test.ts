import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    client: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("Client API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list all clients", async () => {
    const mockClients = [
      {
        id: "1",
        name: "Client A",
        contactEmail: "a@example.com",
        defaultDeadlineDay: null,
        contractSummary: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(prisma.client.findMany).mockResolvedValue(mockClients);

    const { GET } = await import("@/app/api/clients/route");
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Client A");
  });

  it("should create a client", async () => {
    const newClient = {
      id: "2",
      name: "Client B",
      contactEmail: "b@example.com",
      defaultDeadlineDay: 25,
      contractSummary: "コンサルティング",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.client.create).mockResolvedValue(newClient);

    const { POST } = await import("@/app/api/clients/route");
    const request = new Request("http://localhost/api/clients", {
      method: "POST",
      body: JSON.stringify({
        name: "Client B",
        contactEmail: "b@example.com",
        defaultDeadlineDay: 25,
        contractSummary: "コンサルティング",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.name).toBe("Client B");
    expect(response.status).toBe(201);
  });

  it("should get a client by id", async () => {
    const mockClient = {
      id: "1",
      name: "Client A",
      contactEmail: "a@example.com",
      defaultDeadlineDay: null,
      contractSummary: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.client.findUnique).mockResolvedValue(mockClient);

    const { GET } = await import("@/app/api/clients/[id]/route");
    const response = await GET(new Request("http://localhost/api/clients/1"), {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    expect(data.name).toBe("Client A");
  });

  it("should return 404 for non-existent client", async () => {
    vi.mocked(prisma.client.findUnique).mockResolvedValue(null);

    const { GET } = await import("@/app/api/clients/[id]/route");
    const response = await GET(
      new Request("http://localhost/api/clients/999"),
      { params: Promise.resolve({ id: "999" }) }
    );

    expect(response.status).toBe(404);
  });

  it("should update a client", async () => {
    const updatedClient = {
      id: "1",
      name: "Client A Updated",
      contactEmail: "a-new@example.com",
      defaultDeadlineDay: 15,
      contractSummary: "更新済み",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.client.update).mockResolvedValue(updatedClient);

    const { PUT } = await import("@/app/api/clients/[id]/route");
    const request = new Request("http://localhost/api/clients/1", {
      method: "PUT",
      body: JSON.stringify({
        name: "Client A Updated",
        contactEmail: "a-new@example.com",
        defaultDeadlineDay: 15,
        contractSummary: "更新済み",
      }),
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    expect(data.name).toBe("Client A Updated");
  });

  it("should delete a client", async () => {
    vi.mocked(prisma.client.delete).mockResolvedValue({
      id: "1",
      name: "Client A",
      contactEmail: "a@example.com",
      defaultDeadlineDay: null,
      contractSummary: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { DELETE } = await import("@/app/api/clients/[id]/route");
    const response = await DELETE(
      new Request("http://localhost/api/clients/1", { method: "DELETE" }),
      { params: Promise.resolve({ id: "1" }) }
    );
    const data = await response.json();

    expect(data.ok).toBe(true);
  });
});
