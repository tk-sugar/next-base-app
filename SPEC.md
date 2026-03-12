# GitHub AI レポート 仕様書

## 1. 概要

GitHub の Repository / Pull Request / Issue / Commit 情報を収集し、  
AI によって **開発状況のレポートを自動生成する SaaS**。

本サービスは主に以下の課題を解決する。

- 開発チームの週報作成の手間
- マネージャーが開発状況を把握しづらい
- PRレビュー停滞や開発リスクの見える化不足
- 非エンジニアへの説明コスト

AI により GitHub 活動を解析し、以下のレポートを生成する。

- チーム週報
- 個人週報
- 開発サマリー
- リスク検知

---

# 2. 想定ユーザー

## エンジニアチーム

- 開発進捗を自動でまとめたい
- 週報を自動生成したい

## CTO / Engineering Manager

- チーム状況を把握したい
- 開発のボトルネックを知りたい

## PM / PdM

- 非エンジニア向けの開発説明が必要

---

# 3. プロダクトコンセプト

**GitHub 活動を人間が読めるレポートに変換する AI SaaS**

入力：

- Pull Request
- Issue
- Commit
- Review
- Contributor

出力：

- 開発要約
- チーム週報
- 個人週報
- 停滞PR
- 開発リスク

---

# 4. MVP のゴール

GitHub Repository を連携すると、  
**週次の開発レポートを AI が自動生成する。**

---

# 5. MVP 機能

## 5.1 認証

- GitHub OAuth ログイン

取得スコープ

- repo
- read:org

---

## 5.2 GitHub 連携

ユーザーは以下を選択できる

- Organization
- Repository

---

## 5.3 データ取得

GitHub API から以下を取得する。

### Pull Request

- title
- body
- author
- reviewer
- created_at
- merged_at
- state
- labels
- comments

### Issue

- title
- body
- assignee
- state
- created_at
- closed_at
- labels

### Commit

- message
- author
- date

### Review

- reviewer
- comment
- state

---

# 6. 指標集計

以下のメトリクスを計算する。

### PR 指標

- PR 作成数
- PR マージ数
- 平均マージ時間
- レビュー待ちPR
- 長期未マージPR

### Issue 指標

- Issue 作成数
- Issue クローズ数
- 未解決 Issue

### Commit 指標

- コミット数
- Contributor 数

### レビュー指標

- レビュー数
- レビュワー分布

---

# 7. AI レポート生成

AI を使用して以下を生成する。

## チーム週報

生成内容：

- 今週の開発概要
- 主な変更内容
- マージされた主要 PR
- 停滞している PR
- 懸念点
- 来週の注力領域

---

## 個人週報

各エンジニアごとに生成

内容：

- 今週の作業概要
- 対応した PR
- 対応した Issue
- レビュー貢献
- 次の作業候補

---

## エグゼクティブサマリー

非エンジニア向け

内容：

- 開発進捗
- 現在のリスク
- 今後の注力

---

# 8. 停滞検知

以下の条件を検知する。

### PR停滞

- 7日以上レビューなし
- 14日以上未マージ

### レビュー偏り

- 特定ユーザーにレビュー集中

### 開発リスク

- Hotfix PR増加
- Issue再オープン

---

# 9. UI 画面

## 9.1 ログイン画面

- GitHub OAuth

---

## 9.2 リポジトリ選択

表示

- Organization
- Repository

選択可能

---

## 9.3 ダッシュボード

表示項目

- 今週のサマリー
- PR数
- Issue数
- Contributor数
- 停滞PR

---

## 9.4 レポート画面

表示

- AI チーム週報
- 個人週報
- PR一覧
- Issue一覧

---

## 9.5 設定画面

設定項目

- レポート生成曜日
- Slack通知
- 対象Repository
- 除外ユーザー

---

# 10. 通知

以下の通知をサポート。

### Slack

送信内容

- 週報
- PR停滞通知

---

### Email

送信内容

- 週次レポート

---

# 11. 非機能要件

## パフォーマンス

- 初回同期：5分以内
- レポート生成：10秒以内

---

## セキュリティ

- OAuth トークン暗号化
- GitHub 権限最小化
- private repo 対応

---

## 可用性

- GitHub API エラー時リトライ
- バッチ処理対応

---

# 12. システム構成

推奨構成

## Frontend

Next.js, TyepeScript, Tailwind CSS

---

## Backend

Node.js, TypeScript

---

## Database

PostgreSQL

---

## AI

OpenAI API or Anthropic API

---

## Queue

Redis

---

## Hosting

Vercel

---

## 課金

Stripe

---

# 13. データモデル

## users

| column | type |
|------|------|
id | uuid
github_id | string
name | string
email | string

---

## organizations

| column | type |
|------|------|
id | uuid
github_org_id | string
name | string

---

## repositories

| column | type |
|------|------|
id | uuid
github_repo_id | string
name | string

---

## pull_requests

| column | type |
|------|------|
id | uuid
repo_id | uuid
title | text
author | string
created_at | datetime
merged_at | datetime

---

## issues

| column | type |
|------|------|
id | uuid
repo_id | uuid
title | text
state | string
created_at | datetime

---

## commits

| column | type |
|------|------|
id | uuid
repo_id | uuid
author | string
message | text
date | datetime

---

## reports

| column | type |
|------|------|
id | uuid
repo_id | uuid
week_start | date
summary | text
created_at | datetime

---

# 14. レポート例

## チーム週報

今週は認証機能の改善と管理画面の不具合修正が中心でした。

主な成果：

- 認証APIのリファクタリング
- 管理画面UI改善
- 決済エラー修正

懸念点：

通知機能のPRレビューが停滞しています。

---

# 16. 料金モデル

## Free

- 1 Repository
- 7日履歴

---

## Pro

月額

9ドル

---

## Team

月額

49ドル