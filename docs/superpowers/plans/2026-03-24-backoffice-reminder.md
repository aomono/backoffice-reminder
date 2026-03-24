# バックオフィスリマインダー Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a back-office reminder web app that notifies a 2-person team about recurring payments and deadlines, and generates PDF completion reports.

**Architecture:** Next.js 15 App Router fullstack app with Prisma ORM on Vercel Postgres. Vercel Cron Jobs trigger daily reminder checks that send notifications via Slack and Resend email. PDF reports are generated server-side with @react-pdf/renderer and stored in Vercel Blob Storage.

**Tech Stack:** Next.js 15, TypeScript, Prisma, Vercel Postgres (Neon), NextAuth.js, @slack/web-api, Resend, @react-pdf/renderer, Vercel Blob, Tailwind CSS, Vitest, pnpm

**Spec:** `docs/superpowers/specs/2026-03-24-backoffice-reminder-design.md`

---

## File Structure

```
/
├── .env.example                          # 環境変数テンプレート
├── .gitignore
├── next.config.ts                        # Next.js設定
├── tailwind.config.ts                    # Tailwind設定
├── tsconfig.json
├── package.json
├── vercel.json                           # Cron Job設定
├── prisma/
│   └── schema.prisma                     # 全データモデル定義
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # ルートレイアウト（認証Provider）
│   │   ├── page.tsx                      # ダッシュボード
│   │   ├── clients/
│   │   │   ├── page.tsx                  # クライアント一覧
│   │   │   ├── new/page.tsx              # クライアント新規作成
│   │   │   └── [id]/edit/page.tsx        # クライアント編集
│   │   ├── tasks/
│   │   │   ├── page.tsx                  # 定期タスク一覧
│   │   │   ├── new/page.tsx              # 定期タスク新規作成
│   │   │   └── [id]/edit/page.tsx        # 定期タスク編集
│   │   ├── reports/
│   │   │   ├── page.tsx                  # 報告書一覧
│   │   │   └── new/page.tsx              # 報告書作成
│   │   ├── settings/
│   │   │   └── page.tsx                  # 設定画面
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts  # NextAuth認証
│   │       ├── clients/route.ts          # クライアントCRUD API
│   │       ├── tasks/route.ts            # 定期タスクCRUD API
│   │       ├── deadlines/route.ts        # 締め日CRUD API
│   │       ├── reports/route.ts          # 報告書CRUD API
│   │       ├── reports/[id]/pdf/route.ts # PDF生成API
│   │       └── cron/reminder/route.ts    # Cronリマインドエンドポイント
│   ├── lib/
│   │   ├── prisma.ts                     # Prismaクライアントシングルトン
│   │   ├── auth.ts                       # NextAuth設定
│   │   ├── reminder.ts                   # リマインドロジック（期限判定・メッセージ組立）
│   │   ├── slack.ts                      # Slack通知送信
│   │   ├── email.ts                      # Resendメール送信
│   │   └── pdf.ts                        # PDF報告書テンプレート・生成
│   └── components/
│       ├── providers/
│       │   └── session-provider.tsx      # NextAuthセッションProvider
│       ├── layout/
│       │   ├── sidebar.tsx               # サイドバーナビゲーション
│       │   └── header.tsx                # ヘッダー（ユーザー情報）
│       ├── dashboard/
│       │   ├── task-list.tsx             # 今月のタスク一覧
│       │   └── notification-log.tsx      # リマインド履歴
│       ├── clients/
│       │   ├── client-form.tsx           # クライアント作成/編集フォーム
│       │   └── client-table.tsx          # クライアント一覧テーブル
│       ├── tasks/
│       │   ├── task-form.tsx             # 定期タスク作成フォーム
│       │   └── task-table.tsx            # 定期タスク一覧テーブル
│       ├── reports/
│       │   ├── report-form.tsx           # 報告書作成フォーム
│       │   └── report-table.tsx          # 報告書一覧テーブル
│       └── ui/
│           ├── button.tsx                # 共通ボタン
│           ├── input.tsx                 # 共通入力
│           ├── select.tsx                # 共通セレクト
│           ├── table.tsx                 # 共通テーブル
│           ├── card.tsx                  # 共通カード
│           ├── badge.tsx                 # ステータスバッジ
│           └── modal.tsx                 # 共通モーダル
└── tests/
    ├── lib/
    │   └── reminder.test.ts              # リマインドロジックテスト
    ├── api/
    │   ├── clients.test.ts               # クライアントAPIテスト
    │   ├── tasks.test.ts                 # タスクAPIテスト
    │   ├── deadlines.test.ts             # 締め日APIテスト
    │   ├── reports.test.ts               # 報告書APIテスト
    │   └── cron-reminder.test.ts         # Cronリマインドテスト
    └── setup.ts                          # テストセットアップ（Prismaモック）
```

---

## Task 1: プロジェクト初期化

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `.env.example`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Next.jsプロジェクトを作成**

```bash
cd /workspace
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --skip-install
```

「Would you like to use ...」の質問には上記フラグで自動回答。既存ファイル（CLAUDE.md等）は上書きしない。

- [ ] **Step 2: 依存パッケージをインストール**

```bash
pnpm install
pnpm add @prisma/client next-auth @auth/prisma-adapter
pnpm add @slack/web-api resend @react-pdf/renderer @vercel/blob
pnpm add -D vitest @vitejs/plugin-react vite-tsconfig-paths prisma
```

- [ ] **Step 3: .env.exampleを作成**

```bash
# .env.example
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
SLACK_BOT_TOKEN=""
SLACK_DEFAULT_CHANNEL=""
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@example.com"
CRON_SECRET="generate-with-openssl-rand-base64-32"
BLOB_READ_WRITE_TOKEN=""
COMPANY_NAME="株式会社〇〇"
```

- [ ] **Step 4: .gitignoreに追記**

`.env`, `.env.local`, `.env.production` が含まれていることを確認。なければ追記。

- [ ] **Step 5: Vitest設定を作成**

`vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["tests/setup.ts"],
  },
});
```

`tests/setup.ts`:

```typescript
import { vi } from "vitest";

// NextAuth session mock
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => ({
    user: { id: "test-user", email: "test@example.com", name: "Test User" },
  })),
}));
```

`package.json` に scripts 追加:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

- [ ] **Step 6: 動作確認**

```bash
pnpm dev
```

`http://localhost:3000` でNext.jsデフォルトページが表示されることを確認。Ctrl+Cで停止。

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "feat: initialize Next.js 15 project with dependencies and test config"
```

---

## Task 2: Prismaスキーマ定義とDB初期化

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/prisma.ts`

- [ ] **Step 1: Prisma初期化**

```bash
pnpm prisma init
```

- [ ] **Step 2: schema.prismaを定義**

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TaskType {
  salary
  contractor_payment
  invoice
  report
}

enum Frequency {
  monthly
}

enum DeadlineStatus {
  pending
  reminded
  completed
}

enum ReportStatus {
  draft
  finalized
}

enum NotificationChannel {
  slack
  email
}

model Client {
  id                 String            @id @default(cuid())
  name               String
  contactEmail       String?
  defaultDeadlineDay Int?
  contractSummary    String?           @db.Text
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  recurringTasks     RecurringTask[]
  monthlyDeadlines   MonthlyDeadline[]
  reports            Report[]
}

model RecurringTask {
  id                  String            @id @default(cuid())
  title               String
  type                TaskType
  clientId            String?
  client              Client?           @relation(fields: [clientId], references: [id])
  frequency           Frequency         @default(monthly)
  defaultDayOfMonth   Int?
  reminderDaysBefore  Int               @default(3)
  slackChannel        String?
  emailTo             String?
  isActive            Boolean           @default(true)
  monthlyDeadlines    MonthlyDeadline[]
  notificationLogs    NotificationLog[]
}

model MonthlyDeadline {
  id               String         @id @default(cuid())
  clientId         String?
  client           Client?        @relation(fields: [clientId], references: [id])
  recurringTaskId  String
  recurringTask    RecurringTask  @relation(fields: [recurringTaskId], references: [id])
  year             Int
  month            Int
  type             TaskType
  deadlineDate     DateTime
  status           DeadlineStatus @default(pending)
  createdAt        DateTime       @default(now())
  reports          Report[]
  notificationLogs NotificationLog[]

  @@unique([recurringTaskId, year, month])
}

model Report {
  id                 String         @id @default(cuid())
  clientId           String
  client             Client         @relation(fields: [clientId], references: [id])
  monthlyDeadlineId  String?
  monthlyDeadline    MonthlyDeadline? @relation(fields: [monthlyDeadlineId], references: [id])
  period             String
  workDescription    String         @db.Text
  amount             Int
  pdfUrl             String?
  status             ReportStatus   @default(draft)
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt
}

model NotificationLog {
  id                String            @id @default(cuid())
  recurringTaskId   String
  recurringTask     RecurringTask     @relation(fields: [recurringTaskId], references: [id])
  monthlyDeadlineId String?
  monthlyDeadline   MonthlyDeadline?  @relation(fields: [monthlyDeadlineId], references: [id])
  channel           NotificationChannel
  message           String            @db.Text
  sentAt            DateTime          @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

- [ ] **Step 3: Prismaクライアントシングルトンを作成**

`src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Prismaクライアント生成**

```bash
pnpm prisma generate
```

エラーなく完了することを確認。（DBへのマイグレーションはデプロイ時に行う。ローカルでDBに繋ぐ場合は `DATABASE_URL` を .env に設定して `pnpm prisma db push` を実行。）

- [ ] **Step 5: コミット**

```bash
git add prisma/schema.prisma src/lib/prisma.ts
git commit -m "feat: define Prisma schema with all data models"
```

---

## Task 3: NextAuth認証セットアップ

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/middleware.ts`

- [ ] **Step 1: NextAuth設定を作成**

`src/lib/auth.ts`:

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS?.split(",") ?? [];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      return ALLOWED_EMAILS.includes(user.email);
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
```

- [ ] **Step 2: APIルートを作成**

`src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 3: ミドルウェアで認証保護**

`src/middleware.ts`:

```typescript
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!api/auth|api/cron|auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

`/api/cron` はCRON_SECRET認証なのでNextAuthから除外。

- [ ] **Step 4: .env.exampleにALLOWED_EMAILSを追記**

```bash
ALLOWED_EMAILS="user1@example.com,user2@example.com"
```

- [ ] **Step 5: コミット**

```bash
git add src/lib/auth.ts src/app/api/auth/ src/middleware.ts .env.example
git commit -m "feat: add NextAuth with Google OAuth and email whitelist"
```

---

## Task 4: 共通UIコンポーネントとレイアウト

**Files:**
- Create: `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/select.tsx`, `src/components/ui/table.tsx`, `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/modal.tsx`, `src/components/layout/sidebar.tsx`, `src/components/layout/header.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: shadcn/ui を導入**

```bash
pnpm dlx shadcn@latest init
```

設定: TypeScript, tailwind.config.ts, `src/components/ui`, `@/components`, CSS variables: yes.

- [ ] **Step 2: 必要なshadcnコンポーネントを追加**

```bash
pnpm dlx shadcn@latest add button input select table card badge dialog
```

- [ ] **Step 3: サイドバーナビゲーションを作成**

`src/components/layout/sidebar.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: "📊" },
  { href: "/clients", label: "クライアント", icon: "👥" },
  { href: "/tasks", label: "定期タスク", icon: "🔄" },
  { href: "/reports", label: "報告書", icon: "📄" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-gray-50 p-4">
      <h1 className="mb-8 text-xl font-bold">BackOffice</h1>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
              pathname === item.href
                ? "bg-gray-200 font-medium"
                : "hover:bg-gray-100"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 4: ヘッダーを作成**

`src/components/layout/header.tsx`:

```typescript
"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{session?.user?.name}</span>
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          ログアウト
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: ルートレイアウトを更新**

`src/app/layout.tsx` をSessionProviderでラップし、Sidebar + Headerを配置:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BackOffice Reminder",
  description: "バックオフィスリマインダー",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <SessionProvider>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col">
              <Header />
              <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
```

`src/components/providers/session-provider.tsx` も作成:

```typescript
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

- [ ] **Step 6: 動作確認**

```bash
pnpm dev
```

レイアウト（サイドバー + ヘッダー + メインエリア）が表示されることを確認。

- [ ] **Step 7: コミット**

```bash
git add src/components/ src/app/layout.tsx
git commit -m "feat: add UI components, sidebar navigation, and app layout"
```

---

## Task 5: クライアントCRUD API + 画面

**Files:**
- Create: `src/app/api/clients/route.ts`, `src/app/api/clients/[id]/route.ts`, `src/app/clients/page.tsx`, `src/app/clients/new/page.tsx`, `src/app/clients/[id]/edit/page.tsx`, `src/components/clients/client-form.tsx`, `src/components/clients/client-table.tsx`
- Test: `tests/api/clients.test.ts`

- [ ] **Step 1: テストを書く**

`tests/api/clients.test.ts`:

```typescript
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
      { id: "1", name: "Client A", contactEmail: "a@example.com", defaultDeadlineDay: null, contractSummary: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    vi.mocked(prisma.client.findMany).mockResolvedValue(mockClients);

    const { GET } = await import("@/app/api/clients/route");
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Client A");
  });

  it("should create a client", async () => {
    const newClient = { id: "2", name: "Client B", contactEmail: "b@example.com", defaultDeadlineDay: 25, contractSummary: "コンサルティング", createdAt: new Date(), updatedAt: new Date() };
    vi.mocked(prisma.client.create).mockResolvedValue(newClient);

    const { POST } = await import("@/app/api/clients/route");
    const request = new Request("http://localhost/api/clients", {
      method: "POST",
      body: JSON.stringify({ name: "Client B", contactEmail: "b@example.com", defaultDeadlineDay: 25, contractSummary: "コンサルティング" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.name).toBe("Client B");
    expect(response.status).toBe(201);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
pnpm vitest run tests/api/clients.test.ts
```

Expected: FAIL（`@/app/api/clients/route` が存在しないため）

- [ ] **Step 3: クライアントAPI（一覧・作成）を実装**

`src/app/api/clients/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const body = await request.json();
  const client = await prisma.client.create({
    data: {
      name: body.name,
      contactEmail: body.contactEmail,
      defaultDeadlineDay: body.defaultDeadlineDay,
      contractSummary: body.contractSummary,
    },
  });
  return NextResponse.json(client, { status: 201 });
}
```

- [ ] **Step 4: クライアントAPI（取得・更新・削除）を実装**

`src/app/api/clients/[id]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const client = await prisma.client.update({
    where: { id },
    data: {
      name: body.name,
      contactEmail: body.contactEmail,
      defaultDeadlineDay: body.defaultDeadlineDay,
      contractSummary: body.contractSummary,
    },
  });
  return NextResponse.json(client);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: テストが通ることを確認**

```bash
pnpm vitest run tests/api/clients.test.ts
```

Expected: PASS

- [ ] **Step 6: クライアント一覧画面を実装**

`src/app/clients/page.tsx` — Server Componentで `prisma.client.findMany()` を呼び、`ClientTable` を表示。「新規作成」ボタン付き。

`src/components/clients/client-table.tsx` — テーブルで名前、メール、締め日、操作（編集/削除）を表示。

- [ ] **Step 7: クライアント作成・編集フォームを実装**

`src/components/clients/client-form.tsx` — name, contactEmail, defaultDeadlineDay, contractSummary の入力フォーム。Server Actionで保存。

`src/app/clients/new/page.tsx` — ClientFormを使って新規作成。
`src/app/clients/[id]/edit/page.tsx` — ClientFormを使って編集。

- [ ] **Step 8: 動作確認**

```bash
pnpm dev
```

`/clients` にアクセスし、一覧表示・新規作成・編集が動作することを確認。

- [ ] **Step 9: コミット**

```bash
git add src/app/api/clients/ src/app/clients/ src/components/clients/ tests/api/clients.test.ts
git commit -m "feat: add client CRUD API and management pages"
```

---

## Task 6: 定期タスクCRUD API + 画面

**Files:**
- Create: `src/app/api/tasks/route.ts`, `src/app/api/tasks/[id]/route.ts`, `src/app/tasks/page.tsx`, `src/app/tasks/new/page.tsx`, `src/app/tasks/[id]/edit/page.tsx`, `src/components/tasks/task-form.tsx`, `src/components/tasks/task-table.tsx`
- Test: `tests/api/tasks.test.ts`

- [ ] **Step 1: テストを書く**

`tests/api/tasks.test.ts` — RecurringTask のCRUDテスト。クライアント紐付あり/なしの両パターン。

- [ ] **Step 2: テスト失敗確認**

```bash
pnpm vitest run tests/api/tasks.test.ts
```

- [ ] **Step 3: 定期タスクAPI実装**

`src/app/api/tasks/route.ts` — GET（一覧、clientをinclude）、POST（作成）
`src/app/api/tasks/[id]/route.ts` — GET / PUT / DELETE（**注意**: Next.js 15では `params` は `Promise` なので `const { id } = await params;` とする。Task 5のクライアントAPIを参考にすること）

- [ ] **Step 4: テスト通過確認**

```bash
pnpm vitest run tests/api/tasks.test.ts
```

- [ ] **Step 5: タスク一覧・作成画面を実装**

`src/app/tasks/page.tsx` — RecurringTask一覧。タイプ（給与/委託料/請求書/報告書）をバッジ表示。
`src/app/tasks/new/page.tsx` — タスク作成フォーム。タイプ選択、クライアント選択（optional）、基準日、リマインド日数、Slackチャンネル、メール先。
`src/components/tasks/task-form.tsx`, `src/components/tasks/task-table.tsx`

- [ ] **Step 6: 動作確認・コミット**

```bash
pnpm dev
# /tasks で確認
git add src/app/api/tasks/ src/app/tasks/ src/components/tasks/ tests/api/tasks.test.ts
git commit -m "feat: add recurring task CRUD API and management pages"
```

---

## Task 7: 締め日管理API + クライアント画面に統合

**Files:**
- Create: `src/app/api/deadlines/route.ts`, `src/app/api/deadlines/[id]/route.ts`
- Modify: `src/app/clients/[id]/edit/page.tsx`（締め日登録セクション追加）
- Test: `tests/api/deadlines.test.ts`

- [ ] **Step 1: テストを書く**

`tests/api/deadlines.test.ts` — MonthlyDeadline のCRUD + ステータス更新テスト。

- [ ] **Step 2: テスト失敗確認**

- [ ] **Step 3: 締め日API実装**

`src/app/api/deadlines/route.ts`:
- GET: クエリパラメータ `year`, `month`, `clientId` でフィルタ
- POST: 新規締め日登録

`src/app/api/deadlines/[id]/route.ts`:
- PUT: deadlineDate, status の更新（完了マーク用）
- DELETE: 締め日削除

- [ ] **Step 4: テスト通過確認**

- [ ] **Step 5: クライアント編集画面に締め日セクション追加**

クライアント編集画面の下部に「今月の締め日」セクション追加。invoice / report のそれぞれの締め日を登録・編集できるUI。

- [ ] **Step 6: 動作確認・コミット**

```bash
git add src/app/api/deadlines/ src/app/clients/ tests/api/deadlines.test.ts
git commit -m "feat: add monthly deadline management API and UI"
```

---

## Task 8: リマインドロジック + Cronエンドポイント

**Files:**
- Create: `src/lib/reminder.ts`, `src/lib/slack.ts`, `src/lib/email.ts`, `src/app/api/cron/reminder/route.ts`, `vercel.json`
- Test: `tests/lib/reminder.test.ts`, `tests/api/cron-reminder.test.ts`

- [ ] **Step 1: リマインドロジックのテストを書く**

`tests/lib/reminder.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { shouldSendReminder, buildReminderMessage } from "@/lib/reminder";

describe("shouldSendReminder", () => {
  it("should return true when today is within reminder window", () => {
    const deadline = new Date("2026-03-28");
    const today = new Date("2026-03-25");
    const reminderDaysBefore = 3;
    expect(shouldSendReminder(deadline, today, reminderDaysBefore)).toBe(true);
  });

  it("should return false when today is before reminder window", () => {
    const deadline = new Date("2026-03-28");
    const today = new Date("2026-03-24");
    const reminderDaysBefore = 3;
    expect(shouldSendReminder(deadline, today, reminderDaysBefore)).toBe(false);
  });

  it("should return true on deadline day", () => {
    const deadline = new Date("2026-03-28");
    const today = new Date("2026-03-28");
    expect(shouldSendReminder(deadline, today, 3)).toBe(true);
  });

  it("should return true when past deadline", () => {
    const deadline = new Date("2026-03-28");
    const today = new Date("2026-03-30");
    expect(shouldSendReminder(deadline, today, 3)).toBe(true);
  });
});

describe("buildReminderMessage", () => {
  it("should include days remaining", () => {
    const msg = buildReminderMessage("請求書発行", "○○社", new Date("2026-03-28"), new Date("2026-03-25"));
    expect(msg).toContain("あと3日");
    expect(msg).toContain("○○社");
    expect(msg).toContain("請求書発行");
  });

  it("should show urgent message on deadline day", () => {
    const msg = buildReminderMessage("請求書発行", "○○社", new Date("2026-03-28"), new Date("2026-03-28"));
    expect(msg).toContain("本日期限");
  });

  it("should show overdue message when past deadline", () => {
    const msg = buildReminderMessage("請求書発行", "○○社", new Date("2026-03-28"), new Date("2026-03-30"));
    expect(msg).toContain("期限超過");
  });
});
```

- [ ] **Step 2: テスト失敗確認**

```bash
pnpm vitest run tests/lib/reminder.test.ts
```

- [ ] **Step 3: リマインドロジックを実装**

`src/lib/reminder.ts`:

```typescript
export function shouldSendReminder(
  deadline: Date,
  today: Date,
  reminderDaysBefore: number
): boolean {
  const reminderStart = new Date(deadline);
  reminderStart.setDate(reminderStart.getDate() - reminderDaysBefore);
  return today >= reminderStart;
}

export function buildReminderMessage(
  taskTitle: string,
  clientName: string | null,
  deadline: Date,
  today: Date
): string {
  const diffMs = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const target = clientName ? `${clientName}の${taskTitle}` : taskTitle;
  const dateStr = `${deadline.getMonth() + 1}/${deadline.getDate()}`;

  if (diffDays < 0) {
    return `【期限超過】${target} 期限: ${dateStr}（${Math.abs(diffDays)}日超過）`;
  }
  if (diffDays === 0) {
    return `【本日期限！】${target} 期限: ${dateStr}`;
  }
  return `【リマインド】${target} 期限: ${dateStr}（あと${diffDays}日）`;
}
```

- [ ] **Step 4: テスト通過確認**

```bash
pnpm vitest run tests/lib/reminder.test.ts
```

- [ ] **Step 5: Slack通知モジュールを作成**

`src/lib/slack.ts`:

```typescript
import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function sendSlackMessage(channel: string, text: string) {
  await slack.chat.postMessage({ channel, text });
}
```

- [ ] **Step 6: メール通知モジュールを作成**

`src/lib/email.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, text: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    text,
  });
}
```

- [ ] **Step 7: Cronエンドポイントを実装**

`src/app/api/cron/reminder/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shouldSendReminder, buildReminderMessage } from "@/lib/reminder";
import { sendSlackMessage } from "@/lib/slack";
import { sendEmail } from "@/lib/email";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // 当月のMonthlyDeadlineが未作成のRecurringTaskに対して自動生成
  const allActiveTasks = await prisma.recurringTask.findMany({
    where: { isActive: true },
    include: {
      monthlyDeadlines: { where: { year, month } },
    },
  });

  for (const task of allActiveTasks) {
    if (task.monthlyDeadlines.length === 0 && task.defaultDayOfMonth) {
      const deadlineDate = new Date(year, month - 1, task.defaultDayOfMonth);
      await prisma.monthlyDeadline.create({
        data: {
          recurringTaskId: task.id,
          clientId: task.clientId,
          year,
          month,
          type: task.type,
          deadlineDate,
        },
      });
    }
  }

  const tasks = await prisma.recurringTask.findMany({
    where: { isActive: true },
    include: {
      client: true,
      monthlyDeadlines: {
        where: {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          status: { not: "completed" },
        },
      },
    },
  });

  let sentCount = 0;

  for (const task of tasks) {
    for (const deadline of task.monthlyDeadlines) {
      if (!shouldSendReminder(deadline.deadlineDate, today, task.reminderDaysBefore)) {
        continue;
      }

      const message = buildReminderMessage(
        task.title,
        task.client?.name ?? null,
        deadline.deadlineDate,
        today
      );

      if (task.slackChannel) {
        await sendSlackMessage(task.slackChannel, message);
        await prisma.notificationLog.create({
          data: {
            recurringTaskId: task.id,
            monthlyDeadlineId: deadline.id,
            channel: "slack",
            message,
          },
        });
        sentCount++;
      }

      if (task.emailTo) {
        await sendEmail(task.emailTo, message, message);
        await prisma.notificationLog.create({
          data: {
            recurringTaskId: task.id,
            monthlyDeadlineId: deadline.id,
            channel: "email",
            message,
          },
        });
        sentCount++;
      }

      if (deadline.status === "pending") {
        await prisma.monthlyDeadline.update({
          where: { id: deadline.id },
          data: { status: "reminded" },
        });
      }
    }
  }

  return NextResponse.json({ ok: true, sent: sentCount });
}
```

- [ ] **Step 8: vercel.jsonにCron設定を追加**

`vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/reminder",
      "schedule": "0 0 * * *"
    }
  ]
}
```

※ `0 0 * * *` = UTC 00:00 = JST 09:00

- [ ] **Step 9: Cronエンドポイントのテストを書いて通す**

`tests/api/cron-reminder.test.ts` — CRON_SECRET認証、リマインド送信ロジックのテスト。

- [ ] **Step 10: コミット**

```bash
git add src/lib/reminder.ts src/lib/slack.ts src/lib/email.ts src/app/api/cron/ vercel.json tests/
git commit -m "feat: add reminder logic, notification modules, and cron endpoint"
```

---

## Task 9: ダッシュボード画面

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/dashboard/task-list.tsx`, `src/components/dashboard/notification-log.tsx`

- [ ] **Step 1: ダッシュボードページを実装**

`src/app/page.tsx` — Server Componentで当月のMonthlyDeadlineとNotificationLogを取得。

クエリ:
1. `prisma.monthlyDeadline.findMany({ where: { year, month }, include: { recurringTask: true, client: true }, orderBy: [{ status: 'asc' }, { deadlineDate: 'asc' }] })`
2. `prisma.notificationLog.findMany({ orderBy: { sentAt: 'desc' }, take: 20 })`

- [ ] **Step 2: タスク一覧コンポーネント**

`src/components/dashboard/task-list.tsx`:
- 各行にタスク名、クライアント名、期限日、ステータスバッジ
- 未完了タスクには「完了」ボタン（Server Actionで `monthlyDeadline.status = completed` に更新）
- 期限超過は赤、当日は黄色、通常は緑のバッジ

- [ ] **Step 3: リマインド履歴コンポーネント**

`src/components/dashboard/notification-log.tsx`:
- 送信日時、チャネル（Slack/Email）、メッセージ内容をテーブル表示

- [ ] **Step 4: 動作確認**

```bash
pnpm dev
```

ダッシュボードに今月のタスク一覧とリマインド履歴が表示されることを確認。

- [ ] **Step 5: コミット**

```bash
git add src/app/page.tsx src/components/dashboard/
git commit -m "feat: add dashboard with task list and notification history"
```

---

## Task 10: 報告書CRUD API + PDF生成 + 画面

**Files:**
- Create: `src/app/api/reports/route.ts`, `src/app/api/reports/[id]/route.ts`, `src/app/api/reports/[id]/pdf/route.ts`, `src/lib/pdf.ts`, `src/app/reports/page.tsx`, `src/app/reports/new/page.tsx`, `src/components/reports/report-form.tsx`, `src/components/reports/report-table.tsx`
- Test: `tests/api/reports.test.ts`

- [ ] **Step 1: テストを書く**

`tests/api/reports.test.ts` — Report CRUD + PDF生成のテスト。

- [ ] **Step 2: テスト失敗確認**

- [ ] **Step 3: 報告書CRUD APIを実装**

`src/app/api/reports/route.ts` — GET（一覧、clientをinclude）、POST（作成）
`src/app/api/reports/[id]/route.ts` — GET / PUT / DELETE

- [ ] **Step 4: PDFテンプレートを実装**

`src/lib/pdf.ts`:

```typescript
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { renderToBuffer } from "@react-pdf/renderer";

// 日本語フォント登録（Noto Sans JP）
Font.register({
  family: "NotoSansJP",
  src: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2g.ttf",
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "NotoSansJP", fontSize: 11 },
  header: { fontSize: 10, color: "#666", marginBottom: 20 },
  title: { fontSize: 18, textAlign: "center", marginBottom: 30 },
  recipient: { fontSize: 12, marginBottom: 20 },
  section: { marginBottom: 15 },
  label: { fontSize: 10, color: "#666", marginBottom: 4 },
  value: { fontSize: 11 },
  amount: { fontSize: 14, fontWeight: "bold", textAlign: "right", marginTop: 20 },
  footer: { position: "absolute", bottom: 40, left: 40, fontSize: 9, color: "#999" },
});

interface ReportData {
  companyName: string;
  clientName: string;
  period: string;
  workDescription: string;
  amount: number;
  issueDate: string;
}

export async function generateReportPdf(data: ReportData): Promise<Buffer> {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{data.companyName}</Text>
          <Text>発行日: {data.issueDate}</Text>
        </View>
        <Text style={styles.title}>業務完了報告書</Text>
        <View style={styles.recipient}>
          <Text>{data.clientName} 御中</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>対象期間</Text>
          <Text style={styles.value}>{data.period}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>作業内容</Text>
          <Text style={styles.value}>{data.workDescription}</Text>
        </View>
        <View style={styles.amount}>
          <Text>金額: ¥{data.amount.toLocaleString()}</Text>
        </View>
        <View style={styles.footer}>
          <Text>{data.companyName}</Text>
        </View>
      </Page>
    </Document>
  );

  return await renderToBuffer(doc);
}
```

- [ ] **Step 5: PDF生成APIエンドポイントを実装**

`src/app/api/reports/[id]/pdf/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReportPdf } from "@/lib/pdf";
import { put } from "@vercel/blob";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pdfBuffer = await generateReportPdf({
    companyName: process.env.COMPANY_NAME ?? "株式会社〇〇",
    clientName: report.client.name,
    period: report.period,
    workDescription: report.workDescription,
    amount: report.amount,
    issueDate: new Date().toLocaleDateString("ja-JP"),
  });

  const blob = await put(`reports/${report.id}.pdf`, pdfBuffer, {
    access: "public",
    contentType: "application/pdf",
  });

  await prisma.report.update({
    where: { id: report.id },
    data: { pdfUrl: blob.url, status: "finalized" },
  });

  return NextResponse.json({ pdfUrl: blob.url });
}
```

- [ ] **Step 6: テスト通過確認**

```bash
pnpm vitest run tests/api/reports.test.ts
```

- [ ] **Step 7: 報告書一覧・作成画面を実装**

`src/app/reports/page.tsx` — Report一覧。PDFダウンロードリンク付き。
`src/app/reports/new/page.tsx` — クライアント選択→contractSummaryプリセット→期間・金額入力→HTMLプレビュー→PDF生成。

プレビューはHTMLで報告書のレイアウトを再現する（`src/components/reports/report-preview.tsx`）。PDF生成ボタンを押すまでは確認用のHTML表示。PDFと完全に同一である必要はないが、内容と構成が確認できること。
`src/components/reports/report-form.tsx`, `src/components/reports/report-table.tsx`

- [ ] **Step 8: 動作確認**

```bash
pnpm dev
```

`/reports/new` で報告書作成→PDF生成→ダウンロードが動作することを確認。

- [ ] **Step 9: コミット**

```bash
git add src/app/api/reports/ src/app/reports/ src/components/reports/ src/lib/pdf.ts tests/api/reports.test.ts
git commit -m "feat: add report CRUD, PDF generation, and report pages"
```

---

## Task 11: 設定画面

**Files:**
- Create: `src/app/settings/page.tsx`

- [ ] **Step 1: 設定画面を実装**

`src/app/settings/page.tsx`:
- Slack連携状態の表示（SLACK_BOT_TOKEN が設定されているかどうか）
- デフォルトのSlackチャンネル設定
- デフォルトのメール通知先設定
- 自社名の設定（PDF報告書のヘッダーに使用）

設定値はDB（新規 `AppSetting` モデル、key-value）または環境変数で管理。初期スコープでは環境変数のみ表示し、Slack/メールの接続テスト機能を付ける。

- [ ] **Step 2: Slack接続テスト機能**

「テスト送信」ボタン → Slackにテストメッセージを送信 → 成功/失敗を表示。

- [ ] **Step 3: 動作確認・コミット**

```bash
git add src/app/settings/
git commit -m "feat: add settings page with Slack/email connection test"
```

---

## Task 12: 全テスト実行と最終確認

（Vitest設定は Task 1 で作成済み）

- [ ] **Step 1: 全テスト実行**

```bash
pnpm test
```

全テストがPASSすることを確認。

- [ ] **Step 2: ビルド確認**

```bash
pnpm build
```

エラーなくビルドが通ることを確認。

- [ ] **Step 3: 必要に応じてテスト修正・コミット**

```bash
git add -A
git commit -m "test: fix any remaining test issues"
```

---

## Task 13: デプロイ準備

**Files:**
- Modify: `vercel.json`, `.env.example`

- [ ] **Step 1: 環境変数一覧を最終確認**

`.env.example` に全ての必要な環境変数が記載されていることを確認:

```
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
ALLOWED_EMAILS
SLACK_BOT_TOKEN
SLACK_DEFAULT_CHANNEL
RESEND_API_KEY
RESEND_FROM_EMAIL
CRON_SECRET
BLOB_READ_WRITE_TOKEN
COMPANY_NAME
```

- [ ] **Step 2: vercel.jsonの最終確認**

Cron設定が正しいことを確認。

- [ ] **Step 3: 最終コミット**

```bash
git add -A
git commit -m "chore: finalize deployment configuration"
```

- [ ] **Step 4: Vercelにデプロイ**

ユーザーに確認の上、`vercel` CLI またはGitHub連携でデプロイ。Vercelダッシュボードで環境変数を設定。

```bash
pnpm prisma db push  # 本番DBにスキーマを反映
```
