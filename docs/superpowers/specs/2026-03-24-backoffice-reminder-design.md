# バックオフィスリマインダー 設計書

## 概要

2名体制の会社向けバックオフィス支援アプリ。給与・業務委託料の支払いリマインド、クライアントごとの請求書・業務完了報告書の締め日管理、報告書PDF自動生成を行う。

### 背景・目的

- 既存のバックオフィスSaaSで基本業務は回っているが、支払い・請求系のリマインドが手動
- 業務完了報告書はWordで手作業作成→PDF化しており非効率
- バイブコーディングのデモとしてWebアプリを見せたい

### ユーザー

- オーナー（櫻井佑介）+ 1名、計2名

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 15 (App Router) + TypeScript |
| デプロイ | Vercel |
| DB | Vercel Postgres (Neon) + Prisma ORM |
| 認証 | NextAuth.js（Google OAuth） |
| スケジューラ | Vercel Cron Jobs |
| Slack通知 | @slack/web-api |
| メール送信 | Resend |
| PDF生成 | @react-pdf/renderer |
| ストレージ | Vercel Blob Storage |
| パッケージマネージャ | pnpm |

---

## データモデル

### Client（クライアント）

| フィールド | 型 | 説明 |
|---|---|---|
| id | String (cuid) | PK |
| name | String | クライアント名 |
| contactEmail | String? | 連絡先メール |
| defaultDeadlineDay | Int? | 通常の締め日（日） |
| contractSummary | String? | 契約書ベースの作業内容テンプレート |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

### RecurringTask（定期タスク）

| フィールド | 型 | 説明 |
|---|---|---|
| id | String (cuid) | PK |
| title | String | タスク名 |
| type | Enum | salary / contractor_payment / invoice / report |
| clientId | String? | FK → Client（紐付かないタスクもある） |
| frequency | Enum | monthly（初期スコープでは monthly のみ） |
| defaultDayOfMonth | Int? | 毎月の基準日 |
| reminderDaysBefore | Int | 何日前にリマインドするか |
| slackChannel | String? | Slack通知先チャンネル |
| emailTo | String? | メール通知先 |
| isActive | Boolean | 有効/無効 |

### MonthlyDeadline（月次締め日）

| フィールド | 型 | 説明 |
|---|---|---|
| id | String (cuid) | PK |
| clientId | String? | FK → Client（nullable、給与等はクライアント紐付なし） |
| recurringTaskId | String | FK → RecurringTask（対応する定期タスク） |
| year | Int | 年 |
| month | Int | 月 |
| type | Enum | salary / contractor_payment / invoice / report |
| deadlineDate | DateTime | 実際の締め日（クライアント指定 or defaultDayOfMonth） |
| status | Enum | pending / reminded / completed |
| createdAt | DateTime | 作成日時 |

※ 給与・委託料支払い等のクライアント紐付かないタスクも MonthlyDeadline で月次の完了状態を管理する（clientId は nullable に変更）。

### Report（業務完了報告書）

| フィールド | 型 | 説明 |
|---|---|---|
| id | String (cuid) | PK |
| clientId | String | FK → Client |
| monthlyDeadlineId | String? | FK → MonthlyDeadline |
| period | String | 対象期間 |
| workDescription | String | 作業内容 |
| amount | Int | 金額（JPY、円単位） |
| pdfUrl | String? | 生成済みPDFのURL |
| status | Enum | draft / finalized |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

### NotificationLog（通知ログ）

| フィールド | 型 | 説明 |
|---|---|---|
| id | String (cuid) | PK |
| recurringTaskId | String | FK → RecurringTask |
| monthlyDeadlineId | String? | FK → MonthlyDeadline |
| channel | Enum | slack / email |
| message | String | 送信内容 |
| sentAt | DateTime | 送信日時 |

---

## 画面構成

### ダッシュボード（/）

- 今月のタスク一覧（未完了が上、期限が近い順）
- 直近のリマインド履歴
- ステータス：対応済み / 未対応がひと目でわかる

### クライアント管理（/clients）

- クライアント一覧・追加・編集
- 契約ベースの作業内容テンプレート登録
- 今月の締め日登録（請求書・報告書それぞれ）

### 定期タスク管理（/tasks）

- 給与支払い、委託料支払いなどの定期タスク設定
- リマインドタイミング（何日前）、通知先の設定

### 報告書作成（/reports）

- クライアント選択 → 契約テンプレから作業内容プリセット
- 期間・金額を入力
- プレビュー → PDF生成 → ダウンロード

### 設定（/settings）

- Slack連携設定
- メール通知先設定
- 認証済みユーザー管理

---

## リマインド・通知フロー

### Vercel Cron Job（毎朝9:00 JST）

1. RecurringTask を全件取得
2. 各タスクの次回期限を算出：
   - 固定日タスク（給与等）→ `defaultDayOfMonth`
   - クライアント指定タスク → `MonthlyDeadline.deadlineDate`
3. 今日が「期限 - reminderDaysBefore」以降 かつ 未完了 → リマインド送信
4. Slack: 指定チャンネルにメッセージ投稿
5. メール: Resend 経由で送信
6. リマインド送信ログを記録

### リマインドメッセージ例

```
【リマインド】○○社の請求書発行 期限: 3/28（あと3日）
```

### エスカレーション

- 期限当日: 「本日期限！」と強調
- 期限超過: さらに強調表示

### 完了マーク

- Web管理画面から「対応済み」ボタンで完了 → その月のリマインドが止まる

---

## PDF報告書生成

### 生成フロー

1. `/reports/new` でクライアント選択
2. 契約テンプレから作業内容がプリセット
3. 期間・金額・追加の作業内容があれば編集
4. プレビュー表示（Web上でPDFイメージ確認）
5. 「PDF生成」ボタン → サーバーサイドでPDF作成
6. Vercel Blob Storage に保存、ダウンロードリンク生成

### PDFフォーマット

- ヘッダー: 自社名、発行日
- 宛先: クライアント名
- タイトル: 「業務完了報告書」
- 本文: 対象期間、作業内容、金額
- フッター: 自社情報

---

## 初期スコープ外（将来拡張）

- Slack Bot からの締め日登録（チャットで自然言語入力）
- Outlook 連携で会議実績を報告書に自動挿入
- マネーフォワードクラウドとの請求書データ連携
- PDF自動メール送付
- クライアントごとのPDFレイアウトカスタマイズ

---

## ディレクトリ構成

```
/app
  /page.tsx              # ダッシュボード
  /clients/              # クライアント管理
  /tasks/                # 定期タスク管理
  /reports/              # 報告書作成
  /settings/             # 設定
  /api/
    /cron/reminder/      # Vercel Cron Job エンドポイント
    /reports/generate/   # PDF生成API
/components/             # 共通UIコンポーネント
/lib/
  /reminder.ts           # リマインドロジック
  /slack.ts              # Slack通知
  /email.ts              # メール送信
  /pdf.ts                # PDF生成
/prisma/
  /schema.prisma         # DBスキーマ
```

---

## 認証・セキュリティ

- NextAuth.js で Google OAuth 認証
- 許可ユーザーはメールアドレスのホワイトリストで管理（2名）
- API ルートは全て認証必須
- Cron エンドポイントは `CRON_SECRET` ヘッダーで認証（Vercel が自動付与）
- 環境変数で機密情報管理（.env）

---

## ダッシュボードのクエリ設計

ダッシュボード「今月のタスク一覧」は以下のように構築する：

1. 当月の `MonthlyDeadline` を全件取得（全タスク種別）
2. `deadlineDate` 昇順、`status = pending` を優先してソート
3. 各エントリに紐づく `RecurringTask` の情報（title, type）を JOIN
4. `NotificationLog` から直近のリマインド履歴を取得して表示
