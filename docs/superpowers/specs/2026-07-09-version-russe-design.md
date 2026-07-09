# ロシア語版サイト 設計書（Votre Japon sur Mesure — Русская версия）

- 作成日: 2026-07-09
- 元プロジェクト: `vogue-japon-toppage`（フランス語版・完成済み）
- 対象リポジトリ: `vogue-yapon`
- ステータス: 承認済み（2026-07-09）

---

## 1. 目的・対象

日本旅行のオーダーメイド・コンシェルジュサービス「Votre Japon sur Mesure」の**ロシア語版**を、フランス語版を土台に自然なロシア語へ翻訳して立ち上げる。

**対象ユーザー**: 在外ロシア語話者（EU・中央アジア・ジョージア・アルメニア・UAE・イスラエル等に居住し、**非制裁で EUR / USD の国際カード決済が可能な層**）。

**対象外・前提**:
- ロシア国内発行カードは国際制裁により Stripe が自動的に扱わない（遮断を回避することはしない）。
- 制裁対象者・制裁回避を目的とする利用は想定しない。この対象設定自体の可否は最終的に専門家確認が望ましい（要裏取り）。

---

## 2. 構成・公開

- 既存 `vogue-yapon` の旧ファイル（2026-04時点、FR版の大改善が未反映）は `_old/` に退避し、クリーンな状態から作り直す。
- **今のFR版4ページをコピー→翻訳**（中核4ページ先行フェーズ）:
  1. `index.html`（トップ ← FR `vogue-japon-toppage.html`）
  2. `planification-form.html`（AIプラン作成フォーム）
  3. `concierge-payment.html`（コンシェルジュ決済）
  4. `contact.html`（お問い合わせ）
- 併せて必要なアセット: `nav-shared.js`（RU化）、`img/`（FRから流用、軽量化済み版）、`robots.txt`、`sitemap.xml`、OG画像。

**公開先**: `ru.japon.progic.jp`
- **新規Netlifyサイトで完全分離**（FRの `votre-japon-sur-mesure` とは別サイト）。
- GMO Cloud（progic.jp ゾーン）に `ru` の CNAME を1本追加し、Netlify のサイトに向ける。SSL は Netlify 自動発行。

**各ページ共通のメタ**:
- `lang="ru"`
- `canonical` = `https://ru.japon.progic.jp/<page>`
- OGP / Twitter card（`og:locale=ru_RU`、OG画像は流用可）
- **hreflang**: FR版とRU版を相互に指す（`alternate` fr / ru、`x-default`）
- RU用 `robots.txt` + `sitemap.xml`（RUページのURLで）

**デプロイ**: FRの `/deploy-vogue` と同じ dist 方式を RU 用に複製（クリーンな `dist/` を作り、機密混入・サイズ回帰を検査してから `netlify deploy --prod`）。

---

## 3. 決済（方式A：EUR / USD 固定リンク併用）

- **基準通貨 = EUR**: €10 / €150 / €500（FRの既存 Payment Link を流用可能）。
- **USD**: 新規に USD 建て Payment Link を**3本作成**。
  - 提案額: **$11 / $165 / $550**（EUR × 約1.08 を丸め）。**月次で見直し**、金額はダッシュボードで調整（コード変更不要）。
- `concierge-payment.html`（RU）:
  - **通貨トグル（EUR / USD、既定 = EUR）** を設置し、選択に応じて Payment Link を切替。
  - `STRIPE_PAYMENT_LINKS` を `{ eur: {10,150,500}, usd: {11,165,550} }` の2階層構造に拡張。`getPaymentLink()` は現在の通貨とプランで対応リンクを返す。
  - 画面に「**表示額は参考レートに基づく定期見直し価格であり、リアルタイム為替ではない**」旨を明記。
- リアルタイム為替換算（方式C）は今回は採用しない。将来 Worker + Checkout Session で拡張可能（別フェーズ）。

---

## 4. 多言語・デザイン

- **フォント**:
  - 見出し: **EB Garamond**（キリル対応）を継続。
  - ラベル/UI: FRの **Jost はキリル非対応**のため、**キリル対応の幾何サンセリフ（Montserrat 等）に差し替え**。
  - 日本語装飾字（禅・茶・着 等）: **Noto Serif JP** 継続。
- **ナビ（snav JS）**: RUページ同士をリンクし、ラベルをロシア語化（Главная / 4 сезона / Планирование / Консьерж / Новости / Впечатления 等）。
- **言語切替トグル（FR ⇄ RU）**: 両サイトのヘッダー付近に小さく設置し、対応ページへ遷移。

---

## 5. メール・AI連携

- **Cloudflare Worker（`wild-moon-ff72japan-api-proxy...`）はそのまま流用**（言語非依存の中継。再デプロイ不要）。
- **お問い合わせ**: クライアント側の翻訳プロンプトを「**ロシア語 → 日本語に翻訳**」へ変更。宛先は sato@progic.jp + info@progic.jp。`reply_to` に顧客アドレス。
- **AIプラン生成**: プロンプトを**ロシア語**に置換（「日本旅行の高級コンシェルジュ専門家として、ロシア語で詳細な旅程を作成」）。出力もロシア語。`max_tokens: 2200` を継承（FRの打ち切り不具合修正を踏襲）。
- **通知メール件名**: 判別のため末尾に **(RU)** を付す（例: 「🧳 Nouvelle commande Concierge (RU)」）。
- **顧客への返信フロー**: 日本語で起草 → 「アキ」がロシア語へ翻訳 → Gmail下書き → 佐藤さん承認後に送信。RU用返信テンプレは後続フェーズ。

---

## 6. 翻訳品質

- 機械的な直訳を避け、**自然で洗練されたロシア語**にする。
- 丁寧体（вы）で統一。ブランドの高級・叙情的トーンを保持。固有名詞・専門用語の表記を一貫させる。
- 翻訳は translator スキル / アキが担当し、ファイル反映は実装フェーズで行う。

---

## 7. スコープ外（後続フェーズ）

- 残り7ページ: 四季（four-seasons-journey）・体験（taiken-japon）・体験記（ma-experience-japon）・ニュース（actualites-japon）・法的2ページ（mentions-legales / politique-confidentialite）。
- 運用マニュアルのロシア語版。
- 方式C（リアルタイム為替換算）への拡張。

---

## 8. 確定事項（承認済み）

1. 決済方式 = **A（EUR/USD固定リンク併用）**、基準 = EUR
2. 土台 = **今のFR版から作り直す**
3. 公開先 = **ru.japon.progic.jp（新規Netlifyサイト）**
4. 範囲 = **中核4ページ先行**
5. USD金額 = **$11 / $165 / $550**（後調整可）
6. 通貨トグル既定 = **EUR**

---

## 9. 受け入れ基準（このフェーズの完成条件）

- 中核4ページがロシア語で表示され、`ru.japon.progic.jp` で公開されている。
- AIプラン作成フォームがロシア語で旅程を生成し、顧客にロシア語メールが届く。
- お問い合わせがロシア語→日本語翻訳で sato@ + info@ に届く。
- コンシェルジュ決済で EUR/USD トグルが機能し、対応する Payment Link（HTTP 200）に遷移する。
- 機密ファイルが公開物に混入していない（`/CLAUDE.md` 等が 404）。
- FR ⇄ RU 言語切替が中核ページ間で機能する。
