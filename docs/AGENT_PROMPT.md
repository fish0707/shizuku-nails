# 任務：預約制服務業｜平台升級（通用模板）

> **使用方式**：先填寫第 0 節的專案參數，再把整份文件交給執行 Agent。
> 所有 `{{…}}` 必須在交付前填好；填不出來的，Agent 會在 Phase 0 向人類確認。

把一家預約制服務業者的現有官網，升級為自有的預約與會員經營平台：線上預約、LINE 自動化與提醒、IG 私訊整合、會員經營、客戶 360、營運報表。能力對齊夯客這類預約 SaaS，**但不做金流**。整個過程**不得損失任何既有的 SEO／GEO 成果**。

你是這個專案的資深全端工程師，從頭負責到上線。最終使用者是不懂技術的業主與服務人員，以及他們的客人。

---

## 0. 專案參數（交付前填寫）

| 參數 | 說明 | 範例 |
|---|---|---|
| `{{店名}}` | 對外品牌名稱 | ○○美甲工作室 |
| `{{產業}}` | 決定客戶 360 的偏好欄位與預設提醒，見第 8 節 | 美甲 |
| `{{服務人員數}}` | 1 人時前台隱藏「選擇服務人員」 | 1 |
| `{{所在地區}}` | 城市＋行政區＋商圈，用於在地 SEO | ○○市○○區（○○商圈） |
| `{{網站網址}}` | 正式網址；尚無自訂網域請註明 | https://example.com |
| `{{LINE官方帳號ID}}` | | @xxxxxxx |
| `{{IG帳號}}` | 需為專業帳號才能串私訊 | @xxxxxxx |
| `{{營業登記}}` | 有／無。影響 Meta 審核與未來金流 | 無 |
| `{{地址公開方式}}` | 公開／預約成立後才提供 | 預約成立後才提供 |
| `{{現有網站技術}}` | 靜態 HTML、WordPress、Wix… | 靜態 HTML（Vercel） |
| `{{現有後端}}` | 無、Google Apps Script＋Sheets、其他 | Google Apps Script＋Sheets |
| `{{時區}}` | | Asia/Taipei |

---

## 1. 開工前必讀

1. **`docs/ROADMAP.md`**：常見問題檢查清單、與夯客的比較、決策理由、階段劃分、費用與風險。本文件是執行指令，ROADMAP 是規格背景；兩者衝突時以本文件為準並回報。
2. 現有網站與後端的**所有**原始碼。後端若不在 repo 裡（例如 Google Apps Script），向人類索取。
3. 讀完後，**先用你自己的話回報**：現有預約流程如何運作、你對照 ROADMAP 檢查清單確認到哪些問題、你對 Phase 0 的執行計畫。等確認後再動手。

---

## 2. 業務背景

- **店家**：`{{店名}}`，位於 `{{所在地區}}` 的 `{{產業}}` 業者，服務人員 `{{服務人員數}}` 位，`{{營業登記}}`營業登記。
- **營運模式**：預約制。地址 `{{地址公開方式}}`。
- **通路**：LINE 官方帳號 `{{LINE官方帳號ID}}`、IG `{{IG帳號}}`。
- **網站**：`{{網站網址}}`，技術為 `{{現有網站技術}}`；後端為 `{{現有後端}}`。
- 盤點時確認並記錄：Search Console 是否已驗證（驗證檔名或 meta）、sitemap 是否已提交、既有的結構化資料與 `llms.txt`、IG 作品嵌入方式。

---

## 3. 不可違反的限制

### 3.1 範圍
- **不做金流**：不串任何付款、儲值、點數兌換現金。營收僅由業主在後台手動填寫「實收金額」。
- **不得自行決定價格、規則、訊息文案**。現有網站常見同一個價格或規則散在多處且互相矛盾，一律等業主確認，**不要自己挑一組**。

### 3.2 SEO／GEO 無損（每次部署前逐項檢查）
- Phase 0 先盤點現有網站的 SEO 項目並存成清單，之後每次部署都逐項比對。
- 行銷頁內容必須在**伺服器端產生**（SSG／SSR）。GPTBot、ClaudeBot、PerplexityBot 等 AI 爬蟲多半不執行 JavaScript，客戶端渲染的內容等於不存在。
- 保留 `<head>` 全部項目：title、description、keywords、canonical、OG、Twitter Card、geo meta、`<link rel="llms">`、`ai-content-declaration`、`googlebot`／`bingbot` 等，有哪些就保留哪些。
- 保留並改由資料庫產生 JSON-LD（常見為 `LocalBusiness` 或其子類型、`BreadcrumbList`、`FAQPage`）。**Schema 中的價格必須與頁面可見價格完全一致**（Google 結構化資料政策）。
- 保留檔案與路徑：`/robots.txt`、`/llms.txt`（改由資料庫產生）、`/sitemap.xml`（`Content-Type: application/xml`）、**Search Console 驗證檔（若有，絕不能消失）**。
- 網址不變；必須改路徑時一律 301 轉址，並同步更新 sitemap、canonical、內部連結。
- `/admin`、`/api`、LIFF 頁面加 `noindex`，並在 `robots.txt` 中 Disallow。
- 若現有網站使用 Tailwind Play CDN（`cdn.tailwindcss.com`，官方定位為開發用），改為編譯版。

### 3.3 正式站不中斷
- 正式分支若會自動部署，**不得直接 push**：每個階段開 feature branch，用 Preview 環境驗收，開 PR 合併。
- 舊系統在新系統驗收完成前持續運作；切換後保留兩週作為退路。

### 3.4 不得騷擾真實客人
- 開發與測試**一律使用另開的測試用 LINE 官方帳號與 channel**。正式 channel 的金鑰只存在 Production 環境變數。
- 排程器在非 Production 環境預設不發送任何訊息（dry-run 並記錄）。

### 3.5 安全與個資（台灣個人資料保護法）
- LINE webhook 驗證 `X-Line-Signature`（以 channel secret 對**原始 request body** 做 HMAC-SHA256），IG webhook 驗證 `X-Hub-Signature-256`。驗證失敗回 401。
- Webhook 事件以 `webhookEventId`（LINE）／message id（IG）去重。
- 不得在 log 中記錄訊息內容、電話、姓名。
- 所有金鑰只放環境變數，提供 `.env.example`；Supabase service role key 只能在伺服器端使用。
- 資料表啟用 Row Level Security；客人只能透過 LIFF 身分讀取自己的資料。
- 新增 `/privacy` 隱私權政策頁（LINE Login 與 Meta App Review 都需要），內容包含蒐集目的、項目、利用期間、當事人權利、資料刪除方式。**起草後交業主確認**。
- 預約時取得明確同意（個資使用）；作品照片公開使用需**另外**勾選同意。
- 預約與訊息的公開 API 要有頻率限制，防止灌單。

### 3.6 視覺
- **原樣移植現有設計**，不要重新設計。Phase 0 盤點設計 token（色票、字體、版寬、圓角、陰影）並寫入 Tailwind 設定。
- 介面與所有面向客人的文字使用**繁體中文**。

---

## 4. 技術選型

| 層 | 選擇 |
|---|---|
| 框架 | Next.js（App Router、TypeScript），部署 Vercel |
| 樣式 | Tailwind CSS（編譯版） |
| 資料庫／檔案／登入 | Supabase（Postgres、Storage、Auth） |
| 客人身分 | LINE LIFF（`@line/liff`） |
| LINE | Messaging API（webhook、reply、push、rich menu、Flex Message） |
| IG | Instagram Messaging API（Graph API webhook ＋ Send API） |
| 排程 | 一個 cron endpoint 每 15–60 分鐘處理排程佇列（Vercel Cron、Supabase pg_cron 或 GitHub Actions 擇一，依 Phase 0 查證的免費方案限制決定） |
| 測試 | Vitest（單元）、Playwright（端對端） |
| DB 變更 | `supabase/migrations/` 中的 migration 檔，不得手動改正式資料庫結構 |

若你認為某項選擇不適合（例如現有網站是 WordPress），可在 **Phase 0 回報中提出替代方案與理由**，經確認後才能更換。之後不得中途更換。

---

## 5. 已知的坑（務必遵守）

- **LINE userId 是以 Provider 為單位**：LINE Login channel（LIFF 用）必須與 Messaging API channel 建在**同一個 Provider** 下，否則 LIFF 取得的 userId 與 webhook 收到的對不上。
- **LINE Notify 已於 2025/3/31 終止**，不要使用。通知業主改用 Messaging API push 或 email。
- **回覆（reply）不計推播額度，主動推播（push）會計**。預約成立通知盡量設計成：LIFF 內呼叫 `liff.sendMessages()` 由客人送出一則訊息 → webhook 收到後用 replyToken 回覆確認卡片。只有在無法使用 `sendMessages`（例如外部瀏覽器）時才改用 push。
- 要推播必須客人已加好友且未封鎖：LIFF 設定「加入好友選項」引導加好友；處理 `follow`／`unfollow` 事件，封鎖者不推播。
- **IG 只能在客人最後一則訊息後 24 小時內回覆**（`HUMAN_AGENT` tag 可延長至 7 天，但僅限人工回覆）。程式必須強制檢查視窗，**IG 不能用來發提醒**。
- **Vercel 函式回應後，未 await 的背景工作可能被中斷**，背景工作要用 `waitUntil`（`@vercel/functions`）。
- Google Apps Script web app 讀不到 request header，因此無法驗證 LINE 簽章。舊架構若是 GAS，常見會多一層轉送；新架構不再需要 GAS。
- **時區**：資料庫一律存 `timestamptz`，業務邏輯與顯示一律以 `{{時區}}` 計算。不得依賴瀏覽器時區。
- 外包或複製來的舊程式常殘留其他專案的名稱、前綴與無效程式碼，盤點時列出並在新系統中清除。

---

## 6. 資料模型（起始版，可在 Phase 0 回報中提出調整）

```
settings            key text PK, value jsonb
                    — 店名、聯絡管道、網站標題/描述/關鍵字、地址與公開方式、規則參數
                      （遲到分鐘、改期提前天數、累犯停權次數、自動確認開關、
                      提醒時間點、安靜時段 22:00–08:00）、產業偏好欄位定義
staff               id, name, avatar_url, active, sort      — 1 人店家也建一筆
services            id, slug unique, name, description, badge, image_url, duration_min, buffer_min,
                    price_from, price_suffix('起'|null), active, sort
service_variants    id, service_id, name, price, duration_min
staff_services      staff_id, service_id                    — 誰能做哪些服務
addons              id, name, price, unit('次'|'個'|…), max_qty, active, sort
faqs                id, question, answer, keywords text[], active, sort
                    — 同時供頁面 FAQ、FAQPage JSON-LD、llms.txt、LINE／IG 關鍵字回覆
policies            id, title, body, active, sort           — 預約須知
availability_templates   id, staff_id, weekday(0-6), start_time, active
availability_exceptions  id, staff_id, date, kind('closed'|'extra'|'override'), start_times time[]

customers           id, display_name, real_name, phone, birthday,
                    line_user_id unique, line_friend_status('friend'|'blocked'|'unknown'),
                    ig_scoped_id unique, avatar_url, tier, tags text[], notes,
                    consent_data_at, consent_marketing bool, consent_photo_public bool,
                    no_show_count, late_count, blocked_until, merged_into_id,
                    preferred_staff_id, source, created_at
customer_preferences customer_id PK, fields jsonb           — 欄位由 settings 的產業定義決定（第 8 節）
bookings            id uuid, code unique,                   — 伺服器產生，排除易混淆字元
                    customer_id, staff_id, service_snapshot jsonb, addons_snapshot jsonb,
                    quoted_total, final_total(業主手填), start_at, end_at(含 buffer),
                    status('pending'|'confirmed'|'completed'|'cancelled_customer'|
                           'cancelled_studio'|'no_show'),
                    attendance_confirmed_at, late_minutes, cancel_reason,
                    source, utm jsonb, note, created_at, confirmed_at, cancelled_at
                    EXCLUDE USING gist (staff_id WITH =, tstzrange(start_at, end_at) WITH &&)
                      WHERE (status IN ('pending','confirmed'))   — 需 btree_gist；DB 層級防重複
booking_photos      id, booking_id, customer_id, kind('current'|'before'|'after'|'reference'),
                    storage_path, created_at
messages            id, customer_id, channel('line'|'ig'), direction('in'|'out'), type,
                    content jsonb, external_id unique, created_at
scheduled_messages  id, booking_id, customer_id, channel, kind, payload jsonb, send_at,
                    status('pending'|'sent'|'cancelled'|'failed'), attempts, last_error, sent_at,
                    unique(booking_id, kind)
webhook_events      external_id PK, source, received_at, processed_at
audit_log           id, actor, action, entity, entity_id, diff jsonb, at
```

---

## 7. 分階段工作

每階段：開 feature branch → 實作 → 測試全綠 → Preview 驗收 → 依第 11 節格式回報 → 等確認 → 合併。**不得跨階段同時進行。**

### Phase 0｜盤點、止血、決策

**盤點**：
- 對照 `docs/ROADMAP.md` 第 1.2 節的檢查清單，逐項確認現有網站與後端的狀況。
- 列出所有價格、規則出現的位置，標出互相矛盾之處。
- 存下 SEO 項目基準清單、設計 token。
- 量測基準指標（近三個月預約數、爽約數）。

**先停下來向人類確認以下事項**（列成清單一次問完，不要猜）：
1. 第 0 節中尚未填寫的參數
2. 正確價目表（主服務、子選項、所有加購的價格／單位／上限）
3. 統一規則：遲到幾分鐘算取消、改期提前幾天、累犯幾次停權、定金規則
4. 開放時段：每位服務人員每週哪幾天、哪些開始時間
5. 預約自動成立，或業主核准後成立
6. 是否購買自訂網域（強烈建議在 Phase 1 前決定）
7. 不在 repo 中的後端原始碼與資料存取權

**取得答覆後執行：**
- 在**現有網站**上統一所有價格與規則，作為新系統完成前的止血。
- 修補現有系統中可立即修的安全問題（webhook 簽章驗證、`waitUntil`、移除個資 log）。
- 不在 repo 的舊後端原始碼存入 `legacy/`（唯讀參考），匯出資料結構說明。
- 查證並回報：
  - Vercel Hobby 方案是否允許商業使用、Cron 限制
  - Supabase 免費方案的容量、閒置暫停規則、備份
  - 台灣 LINE 官方帳號現行方案與每月推播則數
  - Meta App Review 取得 IG 訊息權限的要求，**特別是商家驗證是否需要營業登記文件**

**驗收**：現有網站所有價格與規則一致；Rich Results Test 通過；偽造簽章的 webhook 請求回 401；查證報告完成。

### Phase 1｜新架構 ＋ SEO 無損遷移 ＋ 內容後台

- 建立 Next.js ＋ Supabase 專案、migrations、seed（使用 Phase 0 確認的資料）。
- 原樣移植所有行銷頁，內容全部由資料庫產生並靜態輸出。
- 由資料庫產生：服務卡片、FAQ 區塊、JSON-LD、`/llms.txt`、`/sitemap.xml`。
- 業主後台 `/admin`：Supabase Auth 登入（email magic link 或 Google），可編輯服務、子選項、加購、FAQ、預約須知、網站設定；儲存後觸發 on-demand revalidation，一分鐘內上線。編輯 SEO 欄位時顯示字數上限提示（標題 60 字、描述 150 字）。
- 後台為手機優先 PWA，可加到主畫面。
- `/privacy` 頁面（草稿）。

**驗收**：
- 自動化測試比對新舊頁面：Phase 0 基準清單中的所有 SEO 項目皆存在且值正確
- 頁面可見價格 == JSON-LD 價格 == `llms.txt` 價格（寫成測試）
- 停用 JavaScript 時，行銷頁所有內容仍完整可見
- Rich Results Test、Lighthouse SEO 與效能分數不低於現有網站
- 在後台改一個價格，頁面、JSON-LD、`llms.txt` 同步更新

### Phase 2｜預約引擎 ＋ LIFF ＋ 預約管理

- 可預約時段 = 每位服務人員的每週模板 ＋ 例外日 − 既有預約（依服務時長 ＋ buffer 計算佔用區間）。
- 服務人員多於 1 位時，客人可選擇服務人員或「不指定」（系統分配有空的人）；只有 1 位時隱藏此步驟。
- 預約 API：伺服器端驗證、產生預約碼、寫入；由 DB 排他約束防止重複，衝突時回傳明確錯誤並讓客人重選。**前端必須讀取並顯示伺服器真正的回應**。
- 預約頁改為 LIFF：自動取得 LINE userId 與頭像；從外部瀏覽器開啟時引導 LINE 登入。保留未登入的訪客預約（標示為無法自動提醒）。
- 預約流程可上傳參考照片（Supabase Storage，私有 bucket）。
- 個資同意勾選（必填）＋ 作品公開同意（選填）。
- `/my`（LIFF）：查看預約、改期、取消；依規則判斷是否允許，超過期限顯示說明並導向聯絡業主。
- 後台：日／週行事曆（可依服務人員篩選）、待確認清單、核准／拒絕、標記完成／爽約／遲到分鐘、填實收金額；時段模板與例外日管理。
- 地址依 `{{地址公開方式}}` 處理；設為「預約成立後才提供」時，只在核准後的確認訊息中送出，地址存在 settings，不寫死在程式中。
- iCal 訂閱網址（帶隨機 token），讓服務人員訂閱到手機行事曆。
- 從舊系統搬移**未來**的預約與會員名單；搬移腳本放 `scripts/`，可重複執行。

**驗收**：
- 並行測試：兩個請求同時預約同一服務人員的同一時段，恰好一個成功
- 時區測試：在非 `{{時區}}` 的瀏覽器操作，時間仍正確
- E2E：完整預約 → 後台核准 → 客人在 `/my` 看到已確認
- 改期／取消規則依 settings 參數正確判斷（含邊界值）

### Phase 3｜LINE 自動化與提醒

- `/api/line/webhook`：簽章驗證 → 去重 → 快速回 200 → 以 `waitUntil` 處理。
- `follow`：建立／更新客戶、發歡迎訊息（含預約入口）；`unfollow`：標記封鎖、撤銷待發推播。
- 文字訊息：比對 `faqs.keywords` 自動回覆；比對不到**不回覆**，留給業主以 LINE 官方帳號 App 人工回覆（webhook 與聊天功能並存）。
- 圖片訊息：存入客戶時間軸（呼叫取得內容 API 下載後存 Storage）。
- Rich menu：線上預約／我的預約／價目表／作品集／預約須知／聯絡我們。以程式建立並納入版控。
- Flex Message：預約成立卡、提醒卡（附「確認出席」「我要改期」postback 按鈕）。
- 排程佇列：預約確認時寫入 `scheduled_messages`，cron 發送到期項目，具冪等性（`unique(booking_id, kind)` ＋ 狀態檢查）；取消或改期時撤銷並重排。
  - 前一天提醒（必要）
  - 服務後關懷（保養須知，完成後數小時）
  - 保固／免費修補期限提醒（依產業與店家政策，見第 8 節）
  - 回訪提醒：依該客人平均回訪間隔；首次客人用產業預設天數
  - 生日訊息
  - 每一項皆可在後台開關並編輯文案；安靜時段順延
- 推播額度：呼叫 LINE 的額度查詢 API，在後台顯示本月已用／剩餘，接近上限時通知業主。
- 新預約通知業主（push 或 email，依額度決定）。
- **切換**：LINE Developers 的 webhook URL 改指新端點；舊系統保留兩週不刪。

**驗收**：
- 偽造簽章回 401；重送同一事件只處理一次
- 同一提醒絕不重複發送；取消預約後待發提醒全部撤銷
- 非 Production 環境不實際發送
- 測試用 LINE 官方帳號實機走完：加好友 → 預約 → 收到確認 → 收到提醒 → 按確認出席

### Phase 4｜IG 私訊整合

**前提**：Phase 0 查證 Meta 審核可行。若不可行（例如需要營業登記而 `{{營業登記}}` 為無），跳過實作，改為文件化備案（Meta Business Suite 內建 IG 自動回覆 ＋ IG 個人檔案的預約連結帶 `utm_source=instagram`），並回報。

- IG 帳號為專業帳號；依 Phase 0 查證結果選擇 Instagram Login 或 Facebook Login 的 API 路徑。
- `/api/ig/webhook`：GET 驗證 `hub.challenge`；POST 驗證 `X-Hub-Signature-256`、去重。
- 收到私訊：建立／比對客戶，寫入 `messages`；24 小時內比對 FAQ 自動回覆，附預約連結。
- 程式強制檢查 24 小時視窗，逾時不得自動發送。
- 後台 IG 收件匣：顯示對話、在視窗內可人工回覆。
- 為 App Review 準備：隱私權頁、資料刪除說明頁、權限用途說明、操作錄影腳本。**送審由人類執行**。

**驗收**：App Review 通過；超過 24 小時的對話無法自動回覆（寫成測試）。

### Phase 5｜會員經營 ＋ 客戶 360

- **身分合併**：LIFF 預約自動綁定 LINE；IG 與 LINE 為同一人時，後台提供手動合併（保留 `merged_into_id` 與稽核紀錄，可還原）；也可產生一次性綁定連結，IG 客人點開以 LIFF 登入完成綁定。
- **客戶 360 頁**（`/admin/customers/[id]`）：
  - 頂部：姓名、LINE／IG 頭像、分級、標籤、慣用服務人員、風險提示（爽約／遲到次數、停權中）
  - 指標：來店次數、累計實收、平均回訪間隔、上次來店天數、預估下次來店日
  - 時間軸：預約、LINE 與 IG 訊息、照片、業主備註，依時間合併排列
  - 產業偏好欄位（第 8 節）
  - 作品照：每次來店前後對照
  - 快速動作：代客預約、傳 LINE 訊息（顯示會消耗額度）、新增備註、加標籤
- **累犯自動停權**：爽約或遲到取消次數達 settings 門檻時自動設定 `blocked_until`，LIFF 預約顯示說明；業主可手動解除（記錄稽核）。
- **會員分級**：依來店次數，門檻與名稱在後台設定，不涉及金流。
- **分眾**：依標籤、分級、久未回訪天數（例如 60／90 天）篩選，可發送 LINE 群發（發送前顯示預計消耗額度並二次確認）。
- **個資**：客戶資料匯出（JSON）、刪除申請流程（刪除個資、保留匿名化統計）。

**驗收**：合併後的客戶 360 正確顯示兩個通路的所有事件；合併可還原；刪除後資料庫查無個資；分眾篩選結果正確。

### Phase 6｜報表 ＋ SEO 擴充

- **報表**：每週預約數、時段使用率（可依服務人員）、爽約率、回訪率、平均回訪間隔、熱門服務與加購、實收營業額（依 `final_total`）、預約來源分布（Google／IG／LINE／AI／介紹，依 `source` 與 `utm`）、提醒後的出席確認率。
- **SEO 擴充**：
  - 各服務獨立頁（瞄準「`{{所在地區}}` ＋ 服務名稱」等長尾關鍵字），含該服務的 `Service` 結構化資料，納入 sitemap 與 `llms.txt`
  - 作品案例頁（僅使用 `consent_photo_public = true` 的照片）
  - 服務後訊息可邀請客人留下評論；**只有累積真實評論後**才加入 `AggregateRating`，不得填入假數據
- 撰寫 `docs/OWNER_GUIDE.md`：給業主看的後台操作說明，繁體中文、附截圖、以「我想要⋯⋯」的情境組織。

**驗收**：報表數字與資料庫手動查詢一致；新頁面通過 Rich Results Test 並已加入 sitemap。

---

## 8. 產業設定

`{{產業}}` 決定客戶 360 的偏好欄位與自動訊息預設值。欄位定義存在 settings，業主可在後台增減。下表為起始範例，**數值一律與業主確認後再寫入**。

| 產業 | 客戶偏好欄位 | 保固／修補提醒 | 回訪提醒預設 |
|---|---|---|---|
| 美甲 | 甲型、長度、喜好色系、風格、過敏／敏感、甲況 | 免費補甲期限 | 約 3–4 週 |
| 美睫 | 捲度、長度、濃密度、膠水過敏、眼型 | 補睫期限 | 約 2–3 週 |
| 髮廊 | 髮質、染燙紀錄、頭皮狀況、慣用設計師、常用造型 | 修剪／補色保固 | 約 4–8 週 |
| 其他 | Phase 0 與業主定義 | 依店家政策 | 依業主經驗 |

涉及健康的欄位（過敏、皮膚或頭皮狀況）只蒐集服務必要的資訊，並在隱私權政策中說明用途。

---

## 9. 什麼時候必須停下來問人

遇到以下情況**停止並提問，不要猜測或自行假設**：
- 價格、規則、訊息文案、會員分級門檻、產業欄位等業務決定
- 需要在外部平台操作：LINE Developers（建立 channel、LIFF、rich menu 圖片）、Meta 開發者後台與送審、Supabase／Vercel 專案與環境變數、DNS
- 任何會對正式 LINE 官方帳號的真實客人發送訊息的動作
- 任何會刪除或覆寫正式資料的動作（含資料搬移的正式執行）
- 發現本文件的指示與實際情況矛盾

提問時把問題整理成清單，每題附上你的建議選項與理由。

---

## 10. 工作方式

- 每階段一個 feature branch，PR 描述附該階段驗收清單並逐項勾選。
- 單元測試涵蓋：時段計算、衝突判斷、改期／取消規則、簽章驗證、排程冪等性、24 小時視窗。E2E 涵蓋：預約完整流程。CI 全綠才能合併。
- 每階段結束更新 `docs/PROGRESS.md`：完成項目、已知問題、下一步、需要人類處理的事。
- commit 訊息清楚描述變更內容與原因。
- 不得提交任何金鑰、個資或真實客人資料。
- `docs/` 與 `legacy/` 不部署到正式站（例如以 `.vercelignore` 排除）。

---

## 11. 每階段結束的回報格式

```
## Phase N 完成回報
### 完成項目          （對照驗收清單逐項，附 Preview 網址）
### 測試結果          （實際輸出，失敗就照實說）
### SEO 檢查          （對照 Phase 0 基準清單逐項：存在／值正確）
### 偏離計畫之處      （做了什麼不同的決定、為什麼）
### 已知問題
### 需要人類處理的事  （帳號、設定、決定、審核）
### 下一階段計畫
```

---

## 12. 完成定義

- 業主可以只用手機後台完成：調整價格與內容、管理時段、核准預約、記錄來店結果、查看客戶 360、查看報表。
- 客人可以從 LINE 完成：預約、收到確認與提醒、確認出席、改期或取消。
- 不需要任何人手動在 LINE 上來回確認預約細節。
- 既有 SEO／GEO 項目全數保留，Search Console 無新增錯誤，自然搜尋曝光在上線後兩週內不低於上線前。
- 所有價格與規則在全站只有一個來源。
- 舊系統已退役，原始碼存檔於 `legacy/`。
- `docs/OWNER_GUIDE.md` 完成並經業主試用。
