# CLAUDE.md — AI Development Team

## プロジェクト概要
- **プロダクト**: TBD
- **オーナー**: 櫻井佑介
- **環境**: AWS Lightsail / Ubuntu 24.04 / Node v22

## チーム構成（初期）

### Team Lead（きおいさん経由で指示）
- タスク分解・優先順位付け・進捗統合・最終判断

### 開発チーム
| 役割 | 担当範囲 | 触れるディレクトリ |
|---|---|---|
| Requirements Engineer | 要件定義・ユーザーストーリー | /docs, CLAUDE.md |
| System Architect | アーキテクチャ・DB・API設計 | /docs/architecture, /prisma |
| Backend Developer | サーバーサイド実装 | /src/server, /src/api |
| Frontend Developer | UI/UX実装 | /src/client, /src/components |
| QA / Test Engineer | テストケース・自動テスト | /tests, /e2e |
| Code Reviewer | レビュー・セキュリティチェック | 全ファイル（読み取り専用） |

### グロースチーム（プロダクトリリース後に立ち上げ）
- Growth Analyst / Growth Strategist / Marketing Executor / Experiment Runner

## コーディング規約
- 言語: TypeScript（strict mode）
- パッケージマネージャ: pnpm
- フォーマッタ: Prettier
- リンタ: ESLint
- テスト: Vitest（ユニット）+ Playwright（E2E）
- コミットメッセージ: Conventional Commits（feat: / fix: / docs: / refactor: / test:）

## Git運用
- mainブランチは常にデプロイ可能な状態を維持
- 作業はfeature/ブランチで行い、PRベースでマージ
- 各役割は担当ディレクトリ以外のファイルを変更しない

## 禁止事項
- 機密情報（APIキー・トークン）のコミット禁止 → .envで管理
- mainへの直接push禁止
- テストなしでのマージ禁止
- destructiveなコマンド（rm -rf等）の無断実行禁止

## KPI（プロダクト決定後に設定）
- TBD
