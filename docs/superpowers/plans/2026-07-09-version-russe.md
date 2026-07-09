# ロシア語版サイト 実装計画（Version Russe — Русская версия）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** フランス語版の中核4ページを自然なロシア語に翻訳し、EUR/USD決済対応で `ru.japon.progic.jp` に公開する。

**Architecture:** 完成済みFR版（`vogue-japon-toppage`）のHTML/CSS/JSを `vogue-yapon` に複製し、テキストをロシア語化。決済はEUR基準＋USD固定Payment Linkの通貨トグル方式。メール/AIは既存Cloudflare Workerを言語だけ変えて流用。純粋な静的サイト（フレームワークなし）。

**Tech Stack:** Pure HTML/CSS/JS、Google Fonts（EB Garamond + Montserrat[キリル] + Noto Serif JP）、Stripe Payment Links、Cloudflare Worker（Resend / Claude proxy）、Netlify、GMO Cloud DNS。

## Global Constraints

- 出力言語UI = ロシア語（丁寧体 вы で統一）。管理者への報告・確認は日本語。
- 対象 = 在外ロシア語話者（非制裁・EUR/USD国際カード決済可能層）。制裁回避目的の実装はしない。
- トップページのファイル名 = `index.html`（ルートURLで開けるようにする）。内部リンクは全て `index.html` を参照（FRの `vogue-japon-toppage.html` ではない）。
- 公開ドメイン = `https://ru.japon.progic.jp`。全ページ `lang="ru"`、canonical/OGP/hreflang をこのドメインで。
- Worker エンドポイント = `https://wild-moon-ff72japan-api-proxy.sato-9c3.workers.dev`（root=Claude, `/email`=Resend）。**再デプロイ不要**。
- Claude モデル = `claude-sonnet-4-6`。AIプラン生成は `max_tokens: 2200`。
- 通知メール宛先 = `["sato@progic.jp","info@progic.jp"]`、`reply_to`=顧客アドレス。件名末尾に ` (RU)`。
- 決済額：EUR = 10 / 150 / 500、USD = 11 / 165 / 550（後調整可、コード上は定数）。通貨トグル既定 = EUR。
- 機密ファイル（CLAUDE.md, cloudflare-worker.js, *.php, docs/ 等）を公開 `dist/` に含めない。
- デザイントークン：`--paper:#f9f7f3 --noir:#0c0c0c --gold:#a8834a --gold-lt:#c9a96e --charcoal:#2a2a2a --ash:#7a7a7a --sakura:#c4848c --ink-blue:#1a2640`。
- 作業リポジトリ = `C:\Users\佐藤\Desktop\vogue-yapon`（独自 git、ブランチ master）。コミットはこまめに。

---

## ファイル構成（作成/変更）

- 退避: 既存 `vogue-yapon/{index.html, planification-form-ru.html, season-*.html, make_seasons.py}` → `_old/`
- Create: `vogue-yapon/index.html`（トップ ← FR `vogue-japon-toppage.html`）
- Create: `vogue-yapon/planification-form.html`（← FR同名）
- Create: `vogue-yapon/concierge-payment.html`（← FR同名）
- Create: `vogue-yapon/contact.html`（← FR同名）
- Create/Modify: `vogue-yapon/nav-shared.js`（RU化。FRに存在すれば流用）
- Copy: `vogue-yapon/img/`（← FR `img/`、OG画像含む）
- Create: `vogue-yapon/robots.txt`, `vogue-yapon/sitemap.xml`
- Create: `vogue-yapon/lang-switch`（各ページ内に埋め込むFR⇄RUトグルの小片。独立ファイルにはせず各HTMLに直接記述）

FR原本の場所: `C:\Users\佐藤\Desktop\vogue-japon-toppage\`

---

## 翻訳の進め方（全タスク共通）

- 機械的直訳を避け、**自然で洗練されたロシア語**（旅行高級ブランドのトーン）にする。丁寧体（вы）で統一。
- 固定UI文字列は本計画に露語を明記（下表）。本文プローズは各ページ翻訳タスク内で、FR原文を参照しながら露訳する（意味・トーン優先、逐語訳しない）。
- 翻訳後、キリル文字が正しく表示されるか（文字化け・グリフ欠落なし）をプレビューで必ず確認。

**固定UI文字列（露語）**

| 用途 | FR | RU |
|------|----|----|
| ナビ: ホーム | Accueil | Главная |
| ナビ: 四季 | 4 Saisons | 4 сезона |
| ナビ: プラン作成 | Planifier | Планирование |
| ナビ: コンシェルジュ | Concierge | Консьерж |
| ナビ: 実績/体験 | Taiken | Впечатления |
| ナビ: ニュース | Actualités | Новости |
| ナビCTA | Planifier mon voyage | Спланировать поездку |
| お問い合わせ | Contact | Контакты |
| 通貨トグル | — | Валюта: EUR / USD |
| 送信ボタン | Envoyer | Отправить |
| 言語切替 | FR | RU ⇄ FR |

---

### Task 1: リポジトリ整理とFR原本の複製（土台づくり）

**Files:**
- Move: `vogue-yapon/index.html`, `planification-form-ru.html`, `season-*.html`, `make_seasons.py` → `vogue-yapon/_old/`
- Create: `vogue-yapon/index.html`, `planification-form.html`, `concierge-payment.html`, `contact.html`
- Copy: `vogue-yapon/img/`, `vogue-yapon/nav-shared.js`（FRにあれば）

**Interfaces:**
- Produces: RU作業用の4ページ（この時点では中身はフランス語のまま）と画像アセット。以降のタスクが各ファイルを露訳する。

- [ ] **Step 1: 旧ファイルを退避**

```bash
cd "/c/Users/佐藤/Desktop/vogue-yapon"
mkdir -p _old
git mv index.html _old/ 2>/dev/null || mv index.html _old/ 2>/dev/null || true
git mv planification-form-ru.html _old/ 2>/dev/null || mv planification-form-ru.html _old/ 2>/dev/null || true
for f in season-spring.html season-summer.html season-autumn.html season-winter.html make_seasons.py; do
  git mv "$f" _old/ 2>/dev/null || mv "$f" _old/ 2>/dev/null || true
done
ls _old/
```

Expected: 旧ファイルが `_old/` に移動している。

- [ ] **Step 2: FR原本4ページを複製（トップは index.html にリネーム）**

```bash
cd "/c/Users/佐藤/Desktop/vogue-yapon"
FR="/c/Users/佐藤/Desktop/vogue-japon-toppage"
cp "$FR/vogue-japon-toppage.html" index.html
cp "$FR/planification-form.html" planification-form.html
cp "$FR/concierge-payment.html"  concierge-payment.html
cp "$FR/contact.html"            contact.html
[ -f "$FR/nav-shared.js" ] && cp "$FR/nav-shared.js" nav-shared.js || echo "nav-shared.js はページ内IIFEの可能性 → 各HTML内で対応"
ls -1 *.html
```

Expected: `index.html / planification-form.html / concierge-payment.html / contact.html` が並ぶ。

- [ ] **Step 3: 画像を複製**

```bash
cd "/c/Users/佐藤/Desktop/vogue-yapon"
cp -r "/c/Users/佐藤/Desktop/vogue-japon-toppage/img" ./img
ls img/ | head; ls img/og-image.jpg && echo "OG画像OK"
```

Expected: `img/` が存在し `og-image.jpg` がある。

- [ ] **Step 4: ブラウザで表示確認（まだフランス語でよい）**

`.claude/launch.json` に静的サーバ設定を用意し、`preview_start` で `index.html` を開く。または `python -m http.server` で確認。
Expected: 4ページが画像付きで表示される（内部リンク切れは Task 3 以降で修正）。コンソールに `SLIDER OK: 4 slides`。

- [ ] **Step 5: コミット**

```bash
cd "/c/Users/佐藤/Desktop/vogue-yapon"
git add -A
git commit -m "chore: retire old RU files, copy current FR core pages as base"
```

---

### Task 2: 共通ナビ・フォント・言語トグルのロシア語化

**Files:**
- Modify: 4ページすべての `<head>` フォント読み込み、末尾の snav IIFE（または `nav-shared.js`）

**Interfaces:**
- Consumes: Task 1 で複製したページ。
- Produces: 全ページ共通の「露語ナビ + キリル対応フォント + FR/RU言語トグル」。以降のページ翻訳タスクはこの共通土台の上でプローズを訳す。

- [ ] **Step 1: キリル対応フォントを追加**

各ページ `<head>` の Google Fonts 読み込みに Montserrat（キリル）を追加。例（既存の `<link>` 群の近くに追記）:

```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Noto+Serif+JP:wght@400;600&display=swap" rel="stylesheet">
```

CSSで Jost を使っている箇所（ラベル/UI）のフォントスタックを `'Jost'` → `'Montserrat'` に置換（EB Garamond はキリル対応のため見出しは維持）。

```bash
cd "/c/Users/佐藤/Desktop/vogue-yapon"
grep -rn "Jost" *.html | head
# 手動またはsedで 'Jost' を 'Montserrat' に（font-family指定箇所のみ）
```

Expected: UIラベルが Montserrat、見出しが EB Garamond。

- [ ] **Step 2: snav ナビを露語化**

各ページ末尾の snav 生成IIFE（`vogue-japon-toppage.html` 内、`.snav` を動的注入する箇所）で、リンクラベルと href を差し替え。href は RU のファイル名（`index.html` 等）。ラベルは固定UI表（上記）に従う:
Accueil→Главная / 4 Saisons→4 сезона（four-seasons は後続フェーズ、当面 index 内アンカーか非表示）/ Planifier→Планирование(`planification-form.html`) / Concierge→Консьерж(`concierge-payment.html`) / Actualités→Новости（後続、当面非表示）/ Taiken→Впечатления（後続、当面非表示）/ Contact→Контакты(`contact.html`)。CTA「Planifier mon voyage」→「Спланировать поездку」。

> 後続フェーズ未着手のページ（四季/体験/ニュース）へのリンクは、リンク切れを避けるため**当面ナビから隠す**（コメントアウト or 非表示）。Task 8（残ページ）で復活。

- [ ] **Step 3: 言語トグル（FR ⇄ RU）を追加**

snav 内に小さな言語切替を追加。RU側からFR対応ページへ:
`index.html`→`https://japon.progic.jp/vogue-japon-toppage.html`、`planification-form.html`→FR同名、`concierge-payment.html`→FR同名、`contact.html`→FR同名。

```html
<a class="snav-lang" href="https://japon.progic.jp/vogue-japon-toppage.html" hreflang="fr" lang="fr">FR</a>
```

Expected: ナビ右端に「RU | FR」表示、クリックでFR版へ。

- [ ] **Step 4: 表示確認**

`preview` で各ページのナビが露語表示、フォント正常、言語トグル動作、後続ページへのリンクが出ていないことを確認。
Expected: ナビ露語化・キリル正常・切替リンク有効。

- [ ] **Step 5: コミット**

```bash
git add -A && git commit -m "feat: russify shared nav, add Cyrillic font + FR/RU language switch"
```

---

### Task 3: トップページ（index.html）の翻訳・メタ整備

**Files:**
- Modify: `vogue-yapon/index.html`

**Interfaces:**
- Consumes: Task 2 の共通ナビ・フォント。
- Produces: 完全露語のトップページ。canonical/OGP/hreflang を RU ドメインで。

- [ ] **Step 1: `<html lang>` とメタを RU 化**

```html
<html lang="ru">
```
- `<title>` / `<meta name="description">` を露語に。
- `<link rel="canonical" href="https://ru.japon.progic.jp/index.html">`
- `<meta property="og:locale" content="ru_RU">`、`og:url`/`og:image` を `https://ru.japon.progic.jp/...`（画像は流用）。
- hreflang 相互リンクを `<head>` に追加:

```html
<link rel="alternate" hreflang="ru" href="https://ru.japon.progic.jp/index.html">
<link rel="alternate" hreflang="fr" href="https://japon.progic.jp/vogue-japon-toppage.html">
<link rel="alternate" hreflang="x-default" href="https://japon.progic.jp/vogue-japon-toppage.html">
```

- [ ] **Step 2: 本文プローズを露訳**

hero見出し・サブコピー・各セクション（体験カード 茶/着/禅/相、四季紹介、フィーチャー、フッター等）の**表示テキスト**を、FR原文を参照して自然な露語に。逐語訳しない。日本語装飾字（茶/禅 等の1文字）はそのまま保持。ボタン/ラベルは固定UI表に従う。フッターの法的リンク文言も露語化（リンク先の法的ページは後続フェーズのため、当面 `#` かFR版へ、要注記）。

- [ ] **Step 3: 内部リンクを RU ファイルへ**

`vogue-japon-toppage.html` への自己参照（snav-logo 等）を `index.html` に。`planification-form.html`/`concierge-payment.html`/`contact.html` はそのまま（同名）。「Toutes les expériences →」等 後続ページ向けリンクは当面非表示 or `#`。

- [ ] **Step 4: 表示確認**

`preview` で `index.html` を開く。
Expected: 全文露語、キリル正常、`SLIDER OK: 4 slides` がコンソールに出る、画像表示、ナビ・CTA動作。

- [ ] **Step 5: コミット**

```bash
git add index.html && git commit -m "feat: translate top page (index.html) to Russian + RU meta/hreflang"
```

---

### Task 4: プラン作成フォーム（planification-form.html）の翻訳・露語AI

**Files:**
- Modify: `vogue-yapon/planification-form.html`

**Interfaces:**
- Consumes: Worker root エンドポイント（Claude proxy）と `/email`。
- Produces: 露語で旅程を生成し、顧客に露語メールを送るフォーム。

- [ ] **Step 1: `<html lang>`・メタ・フォーム表示テキストを露訳**

`lang="ru"`、title/description/canonical/OGP/hreflang（RUドメイン）。フォーム項目（出発日・期間・大人/子供・年齢・体験・テーマ・予算・名前・メール等のラベルと選択肢）、ボタン、ローディング文言、結果画面の見出しを露語化。

- [ ] **Step 2: AIプロンプトを露語化（max_tokens 2200 維持）**

`generatePlan()` 内のプロンプト配列を露語に。指示は「日本旅行の高級コンシェルジュ専門家として、以下の情報で詳細な旅程を**ロシア語で**作成」。構成指示（詩的タイトル/導入/日別/実用アドバイス3つ/締めの言葉）も露語で。fetch本文の `max_tokens` が `2200` であることを確認（FRの修正を踏襲。1000のままなら2200へ）。

```js
// fetch本文（該当箇所）
body: JSON.stringify({
  model: "claude-sonnet-4-6",
  max_tokens: 2200,
  messages: [{ role: "user", content: prompt }]  // prompt は露語
})
```

- [ ] **Step 3: 顧客宛メール・planKey を確認**

`/email` 呼び出しはそのまま（`to: d.email`, `prenom`, `planKey: 'VJM-...'`, `planText: text`）。Worker は planKey が CONTACT/COMMANDE 以外なら件名「Votre itinéraire — …」を出す＝顧客宛には露語本文が入るので問題なし。planKey プレフィックスは `VJM-` 維持。

- [ ] **Step 4: 実地テスト（Worker疎通）**

露語プロンプトで実際に生成されるか curl で確認:

```bash
curl -s -X POST "https://wild-moon-ff72japan-api-proxy.sato-9c3.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-6","max_tokens":2200,"messages":[{"role":"user","content":"Ты эксперт по путешествиям в Японию. Составь на русском короткий пример маршрута на 3 дня по Токио. Заверши мысль полностью."}]}' \
  | python -c "import sys,json;d=json.load(sys.stdin);print('STOP:',d['stop_reason']);print(d['content'][0]['text'][:300])"
```

Expected: `STOP: end_turn`、自然な露語の旅程が返る。

- [ ] **Step 5: 画面テスト＋メール到達**

`preview` でフォーム送信→露語プランが最後まで表示。`d.email` に佐藤さんのアドレスを入れて送信し、露語メール到達を確認（sato@ で受信）。
Expected: プラン完走表示、`res.ok`、露語メール受信。

- [ ] **Step 6: コミット**

```bash
git add planification-form.html && git commit -m "feat: translate planning form + Russian AI prompt (max_tokens 2200)"
```

---

### Task 5: コンシェルジュ決済（concierge-payment.html）— 露訳＋EUR/USD通貨トグル

**Files:**
- Modify: `vogue-yapon/concierge-payment.html`

**Interfaces:**
- Consumes: Stripe Payment Links（EUR既存3本＋USD新規3本＝Task 7で確定）。Worker `/email`。
- Produces: 通貨トグルで EUR/USD リンクを切替える露語決済ページ。注文通知メール（露/件名に(RU)）。

- [ ] **Step 1: `<html lang>`・メタ・本文を露訳**

`lang="ru"`、title/description/canonical/OGP/hreflang（RUドメイン）。プラン名（Offre de démarrage / Guide journée — région de Tokyo / Formule complète）と説明・特典リスト・ボタン・注意書き・ガイド紹介を露語化。プラン名は露語併記可（例: «Стартовый пакет» / «Гид на день — регион Токио» / «Полный пакет»）。

- [ ] **Step 2: `STRIPE_PAYMENT_LINKS` を2階層（EUR/USD）に拡張**

```js
var STRIPE_PAYMENT_LINKS = {
  eur: {
    '10' : 'https://buy.stripe.com/3cIcN6aRE7ez26FgzW3oA00',  // €10  (FR既存流用)
    '150': 'https://buy.stripe.com/9B64gA2l88iD8v3cjG3oA01',  // €150 (FR既存流用)
    '500': 'https://buy.stripe.com/5kQbJ2bVIfL57qZ4Re3oA02'   // €500 (FR既存流用)
  },
  usd: {
    '11' : 'REMPLACER_USD_11',   // $11  (Task 7で実URLに)
    '165': 'REMPLACER_USD_165',  // $165 (Task 7で実URLに)
    '550': 'REMPLACER_USD_550'   // $550 (Task 7で実URLに)
  }
};
var CURRENCY = 'eur';            // 既定
var USD_FROM_EUR = { '10':'11', '150':'165', '500':'550' }; // EUR額→USD額の対応
function getPaymentLink(){
  if (CURRENCY === 'usd') { return STRIPE_PAYMENT_LINKS.usd[USD_FROM_EUR[String(BASE)]] || ''; }
  return STRIPE_PAYMENT_LINKS.eur[String(BASE)] || '';
}
function isLinkConfigured(u){ return !!u && u.indexOf('buy.stripe.com')!==-1 && u.indexOf('REMPLACER')===-1; }
```

- [ ] **Step 3: 通貨トグルUIを追加**

決済セクションに EUR/USD トグルを設置。切替で `CURRENCY` を更新し、表示価格を EUR→USD（`11/165/550`）に差し替え、注記「Цены в USD пересматриваются периодически по справочному курсу (не в реальном времени).」を表示。

```html
<div class="currency-toggle" role="group" aria-label="Валюта">
  <button type="button" data-cur="eur" class="cur-btn active">EUR €</button>
  <button type="button" data-cur="usd" class="cur-btn">USD $</button>
</div>
```
```js
document.querySelectorAll('.cur-btn').forEach(function(b){
  b.addEventListener('click', function(){
    CURRENCY = b.getAttribute('data-cur');
    document.querySelectorAll('.cur-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    updatePriceDisplay();   // 各プラン表示額を EUR/USD で書き換える関数（プラン価格DOMを更新）
  });
});
```

- [ ] **Step 4: 注文通知メールを (RU) 化**

注文送信の `/email` 呼び出しで `planKey: 'COMMANDE-' + orderKey` は維持（Worker が「🧳 Nouvelle commande Concierge — Votre Japon」を出す）。件名に (RU) を足すため、planKey を `'COMMANDE-RU-' + orderKey` にし、Worker側の判定は `startsWith("COMMANDE")` なので件名は既存のまま→ **件名に(RU)を出すには planText 冒頭に「【RU注文】」を含める**（Worker改変なしで判別可能にする簡便策）。宛先 `['sato@progic.jp','info@progic.jp']`、`replyTo: order.email` 維持。注文本文（日本語サマリ）に通貨（EUR/USD）と金額を明記。

- [ ] **Step 5: リンク疎通確認（EURのみ、USDはTask7後）**

```bash
for u in 3cIcN6aRE7ez26FgzW3oA00 9B64gA2l88iD8v3cjG3oA01 5kQbJ2bVIfL57qZ4Re3oA02; do
  echo -n "$u : "; curl -s -o /dev/null -w "%{http_code}\n" "https://buy.stripe.com/$u"
done
```

Expected: 3本とも 200。`preview` でトグル切替時に価格表示が EUR↔USD で変わることを確認。

- [ ] **Step 6: コミット**

```bash
git add concierge-payment.html && git commit -m "feat: translate concierge page + EUR/USD currency toggle"
```

---

### Task 6: お問い合わせ（contact.html）— 露訳＋露→日翻訳

**Files:**
- Modify: `vogue-yapon/contact.html`

**Interfaces:**
- Consumes: Worker root（翻訳）、`/email`。
- Produces: 露語の質問を日本語に翻訳して sato@+info@ に届けるフォーム。

- [ ] **Step 1: `<html lang>`・メタ・フォームを露訳**

`lang="ru"`、title/description/canonical/OGP/hreflang（RUドメイン）。フォーム項目・ボタン・確認/成功/失敗メッセージを露語化。

- [ ] **Step 2: 翻訳プロンプトを 露→日 に変更**

`translateToJP(text)` 内のプロンプトを露語→日本語に:

```js
messages:[{role:"user", content:
  "以下のロシア語の顧客メッセージを、自然で丁寧な日本語（敬語）に翻訳してください。"+
  "翻訳文のみを返し、コメントや引用符は付けないでください。\n\n"+text }]
```

`model:"claude-sonnet-4-6"` 維持。送信ブロックの `planKey:'CONTACT-'+Date.now()`（Worker件名「📨 Nouveau message de contact」）維持。判別のため送信本文（`planText`）冒頭に「【RUお問い合わせ】」を含め、日本語訳→露語原文の順で本文構成。宛先 `['sato@progic.jp','info@progic.jp']`、`replyTo:email` 維持。

- [ ] **Step 3: 翻訳疎通テスト**

```bash
curl -s -X POST "https://wild-moon-ff72japan-api-proxy.sato-9c3.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-6","max_tokens":300,"messages":[{"role":"user","content":"以下のロシア語を丁寧な日本語に翻訳。翻訳文のみ返す:\n\nЗдравствуйте! Я хочу поехать в Японию весной на 10 дней. Сколько это будет стоить?"}]}' \
  | python -c "import sys,json;print(json.load(sys.stdin)['content'][0]['text'])"
```

Expected: 自然な日本語訳が返る。

- [ ] **Step 4: 画面テスト＋メール到達**

`preview` でフォーム送信（露語で入力）→ sato@ に「日本語訳＋露語原文」のメールが届く。
Expected: `res.ok`、日本語訳付きメール受信。

- [ ] **Step 5: コミット**

```bash
git add contact.html && git commit -m "feat: translate contact form + RU->JP translation"
```

---

### Task 7: Stripe USD Payment Link 作成とURL反映（佐藤さん操作・画面案内）

**Files:**
- Modify: `vogue-yapon/concierge-payment.html`（USDリンクの `REMPLACER_*` を実URLに）

**Interfaces:**
- Consumes: Stripeダッシュボード（本番モード）。
- Produces: 有効なUSD Payment Link 3本と、コードへの反映。

> **注意:** Stripeダッシュボード操作・決済リンク作成は**佐藤さんが実施**（アキが画面を見ながら案内）。アキは金額・口座等の機微情報を入力しない。

- [ ] **Step 1: USD Payment Link を3本作成**

Stripe（本番）→ Payment Links → 新規作成 ×3。通貨 USD、金額 **$11 / $165 / $550**、商品名は各プラン名（露/仏可）。作成後、各リンクURL（`https://buy.stripe.com/...`）を取得。

- [ ] **Step 2: 各URLを curl で検証**

```bash
for u in "<USD_11_URL>" "<USD_165_URL>" "<USD_550_URL>"; do
  echo -n "$u : "; curl -s -o /dev/null -w "%{http_code}\n" "$u"
done
```

Expected: 3本とも 200。

- [ ] **Step 3: コードに反映**

`concierge-payment.html` の `STRIPE_PAYMENT_LINKS.usd` の `REMPLACER_USD_11/165/550` を実URLに置換。

- [ ] **Step 4: トグル動作の最終確認**

`preview` で USD トグル→各プラン選択→ USD リンクに遷移することを確認（`isLinkConfigured` が true）。
Expected: USD選択時に対応する buy.stripe.com へ遷移。

- [ ] **Step 5: コミット**

```bash
git add concierge-payment.html && git commit -m "feat: wire live USD Stripe Payment Links"
```

---

### Task 8: SEO ファイル（robots.txt / sitemap.xml）と最終メタ点検

**Files:**
- Create: `vogue-yapon/robots.txt`, `vogue-yapon/sitemap.xml`

**Interfaces:**
- Produces: RUドメインのクロール設定とサイトマップ。

- [ ] **Step 1: robots.txt 作成**

```
User-agent: *
Allow: /
Sitemap: https://ru.japon.progic.jp/sitemap.xml
```

- [ ] **Step 2: sitemap.xml 作成（中核4ページ）**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://ru.japon.progic.jp/index.html</loc></url>
  <url><loc>https://ru.japon.progic.jp/planification-form.html</loc></url>
  <url><loc>https://ru.japon.progic.jp/concierge-payment.html</loc></url>
  <url><loc>https://ru.japon.progic.jp/contact.html</loc></url>
</urlset>
```

- [ ] **Step 3: 全ページ canonical/hreflang 点検**

```bash
cd "/c/Users/佐藤/Desktop/vogue-yapon"
grep -l "ru.japon.progic.jp" *.html
grep -c "hreflang" *.html
grep -n 'lang="ru"' *.html
```

Expected: 4ページとも RUドメイン canonical・hreflang・`lang="ru"` を持つ。

- [ ] **Step 4: コミット**

```bash
git add robots.txt sitemap.xml && git commit -m "feat: add RU robots.txt and sitemap.xml"
```

---

### Task 9: Netlify 新規サイト作成・DNS・デプロイ・公開検証（佐藤さん一部操作）

**Files:**
- Create: `vogue-yapon/.claude/skills/deploy-yapon/SKILL.md`（任意：RU用デプロイ手順の定着）

**Interfaces:**
- Produces: `ru.japon.progic.jp` で公開された中核4ページ。

> DNS（GMO）とNetlifyのサイト作成・ドメイン設定は佐藤さん操作を含む（アキが画面案内）。

- [ ] **Step 1: dist を構築（機密除外）**

```bash
cd "/c/Users/佐藤/Desktop/vogue-yapon"
rm -rf dist && mkdir dist
cp *.html dist/ && cp robots.txt sitemap.xml dist/
[ -f nav-shared.js ] && cp nav-shared.js dist/
cp -r img dist/
# 機密混入検査
ls dist/CLAUDE.md dist/cloudflare-worker.js dist/.claude dist/docs dist/_old 2>/dev/null && echo "★混入あり—中止" || echo "検査OK"
# サイズ回帰
find dist -maxdepth 1 -name "*.html" -size +500k
```

Expected: 「検査OK」、500KB超HTMLなし。`_old/` `docs/` が dist に無いこと。

- [ ] **Step 2: Netlify 新規サイト作成＆デプロイ**

新規サイト（例名 `votre-japon-russe`）を作成し、初回は Netlify にドラッグ&ドロップ or CLI:

```bash
cd "/c/Users/佐藤/Desktop/vogue-yapon"
netlify deploy --prod --dir=dist
# 初回はサイト選択/作成プロンプトに従う（佐藤さん操作）
```

Expected: `Deploy is live!` と Netlify のサイトURL（`*.netlify.app`）。

- [ ] **Step 3: 独自ドメイン ru.japon.progic.jp を接続**

Netlify のサイト → Domain settings → `ru.japon.progic.jp` を追加。GMO Cloud（progic.jp ゾーン情報変更）で `ru` の CNAME を Netlify の指定先に向ける。SSL 自動発行を待つ。

- [ ] **Step 4: 公開検証**

```bash
echo "netlify: $(curl -s -o /dev/null -w '%{http_code}' https://<site>.netlify.app/)"
echo "独自ドメイン: $(curl -s -o /dev/null -w '%{http_code}' https://ru.japon.progic.jp/)"
echo "CLAUDE.md漏洩: $(curl -s -o /dev/null -w '%{http_code}' https://ru.japon.progic.jp/CLAUDE.md)"  # 404期待
curl -s https://ru.japon.progic.jp/ | grep -o 'lang="ru"'
```

Expected: トップ200、独自ドメイン200（SSL発行後）、CLAUDE.md=404、`lang="ru"` 検出。

- [ ] **Step 5: コミット（デプロイ手順の記録）**

```bash
git add -A && git commit -m "chore: RU deploy config + go live on ru.japon.progic.jp"
```

---

## Self-Review（計画↔設計の照合）

- 設計§2 構成/公開 → Task 1（複製）・Task 8（SEO）・Task 9（公開）でカバー。
- 設計§3 決済（EUR/USD） → Task 5（トグル・2階層リンク）・Task 7（USDリンク作成）でカバー。
- 設計§4 多言語/デザイン → Task 2（フォント・ナビ・言語トグル）でカバー。
- 設計§5 メール/AI → Task 4（露AI・顧客メール）・Task 6（露→日翻訳）でカバー。件名(RU)判別は planText 冒頭マーカー方式に確定（Worker改変不要）。
- 設計§6 翻訳品質 → 全翻訳タスクの共通方針＋固定UI表でカバー。
- 設計§9 受け入れ基準 → 各タスクの Expected（露表示・AI生成・メール到達・決済遷移・機密404・言語切替）で検証。
- プレースホルダ: USDリンクは Task 7 で実URL化する明示の一時値のみ（意図的）。他に未定義参照なし。
- 型/命名整合: `getPaymentLink()` / `isLinkConfigured()` / `CURRENCY` / `STRIPE_PAYMENT_LINKS.{eur,usd}` を Task 5・7 で一貫使用。

## 未確定・要確認（実装中に佐藤さん確認）

- USD金額（$11/$165/$550）の最終確定。
- Netlify 新規サイト名。
- 後続フェーズ（残り7ページ・運用マニュアルRU版・方式Cリアルタイム為替）は本計画外。
