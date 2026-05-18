# 台球对战记录 App

手机优先的 Next.js + Supabase 免费网页 App，用来记录陈振明和何烈的台球战绩、台费和统计分析。

## 功能

- 用户名 + 密码登录，界面不显示邮箱
- 支持安卓 Chrome、iPhone Safari 打开，也可以添加到手机桌面
- 仅允许陈振明、何烈两个账号使用
- 两人共享同一份比赛数据
- 新增、编辑、删除比赛记录
- 自动计算星期、胜者、净胜局
- 倒序卡片列表，支持日期、支付人、胜者、轮次查询
- 总战绩、每 10 轮统计、最近 10/30 轮趋势、胜率、连胜、最大分差、台费统计

## 本地启动

```bash
npm install
cp .env.example .env.local
npm run dev
```

访问 `http://localhost:3000`。

## Supabase 配置

1. 新建 Supabase 项目。
2. 打开 `SQL Editor`，复制并执行 `supabase/schema.sql`。
3. 执行 SQL 前，可以保留默认的隐藏账号：
   - `chen-zhenming@billiards.local` 对应陈振明
   - `he-lie@billiards.local` 对应何烈
4. 进入 `Authentication -> Users`，手动创建两个用户，并设置密码。邮箱填上面两个隐藏账号即可。
5. 进入 `Project Settings -> API`，复制：
   - `Project URL`
   - `anon public key`
6. 在 `.env.local` 填入：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的 Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 anon key
NEXT_PUBLIC_PLAYER_A_EMAIL=chen-zhenming@billiards.local
NEXT_PUBLIC_PLAYER_B_EMAIL=he-lie@billiards.local
```

建议在 `Authentication -> Providers -> Email` 里关闭公开注册，只保留你手动创建的两个账号。登录页只显示“陈振明 / 何烈”和密码输入框，不需要用户输入邮箱。

## Vercel 免费部署

1. 把 `billiards-score-app` 上传到 GitHub。
2. Vercel 导入该仓库。
3. Framework 选择 `Next.js`。
4. 在 Vercel `Environment Variables` 添加与 `.env.local` 相同的 4 个变量。
5. 部署完成后，在 Supabase `Authentication -> URL Configuration` 设置：
   - `Site URL`：你的 Vercel 域名
   - `Redirect URLs`：你的 Vercel 域名

## 数据表

核心表是 `public.matches`：

- `id`
- `date`
- `weekday`
- `round_no`
- `player_a_name`
- `player_b_name`
- `player_a_score`
- `player_b_score`
- `winner`
- `score_diff`
- `table_fee`
- `payer`
- `note`
- `created_by`
- `created_at`
- `updated_at`

`weekday`、`winner`、`score_diff`、`updated_at` 在前端会计算一次，数据库触发器也会再次计算，防止手动写错。

deploy retry
