# 八大山人数字小展 · 优化 Todo List 与修改记录

按 **影响程度 × 性价比** 分为三个优先级，底部附完整迭代记录。

---

## P0｜优先修复（明确瑕疵，改完立竿见影）

- [x] **P0-1 对齐正文与导航顺序**
  - **涉及**：[dist/index.html](dist/index.html)、[dist/site.css](dist/site.css)
  - **内容**：保持导航栏不变，将正文顺序调整为 `大音希声 → 其人 → 书画作品 → 怎么看 → 书画史地位 → 款识与印章`，并同步调整底色交替（`#works` 使用暖底 `#eee8dc`，`#person` 使用宣纸底 `--paper`）保持相邻区块的明暗节奏。

- [x] **P0-2 作品详情弹窗增加“放大看图”能力（含 6 张 PDF 高清图版升级）**
  - **涉及**：[dist/index.html](dist/index.html)、[dist/site.css](dist/site.css)、[dist/site.js](dist/site.js)、`dist/assets/`（6 张 `.webp`）
  - **内容**：新增深色全屏看图层（原生嵌套 `<dialog>`），支持点击图版或「放大细看」进入、适应屏幕与 `原寸 1:1` 切换、鼠标拖拽/移动端滑动细看、长卷默认由右向左定位、放大态直接切图及 `←`/`→`/`Esc` 快捷键，并对低清图（如 `letter-1~6`、`calligraphy-full`、`fishing-figure`）自动限幅防拉糊；同步从 PDF 重抽 6 张更高清图版。

- [x] **P0-3 修复切图/换作品时旧图残留**
  - **涉及**：[dist/site.js](dist/site.js)、[dist/site.css](dist/site.css)
  - **内容**：为作品弹窗、全屏放大层及「怎么看」三处切图统一引入 `swapImage` 异步令牌 + `.is-loading` 加载态（未命中缓存时隐藏旧图并显示「图版加载中…」，解码后 160ms 淡入，遵循 `prefers-reduced-motion`），并静默预加载相邻图版与「怎么看」5 张局部图。

- [x] **P0-4 弹窗顶栏移动端吸顶**
  - **涉及**：[dist/site.css](dist/site.css)
  - **内容**：将 `.dialog-bar` 设为 `position: sticky; top: 0` 并用 `--dialog-pad` 铺满左右边距加底部分隔线，在平板与手机端滚动到弹窗底部时「关闭」按钮始终触手可及且无内容透出。

- [x] **P0-5 提前中屏（541px–760px）单列断点**
  - **涉及**：[dist/site.css](dist/site.css)
  - **内容**：新增 `max-width: 820px` 断点将 `.dialog-layout` 切为单列，并将 `.looking-layout`、`.biography-layout`、`.seal-pair`、`.cipher` 的单列切换提前至 `max-width: 760px`。

---

## P1｜体验增强（明显提升逛展手感与加载速度）

- [x] **P1-1 弹窗键盘翻页** *（数字页码直达条已按方案 A 撤回，保持画册留白感）*
  - **涉及**：[dist/site.js](dist/site.js)
  - **内容**：作品详情弹窗与全屏放大层均支持键盘 `←` / `→` 翻页；界面保持简洁的「上一图 / 下一图」。

- [x] **P1-2 列表封面缩略图分离与图片加载优化**
  - **涉及**：`dist/assets/thumbs/`（12 张 `.webp`）、[dist/works.js](dist/works.js)、[dist/site.js](dist/site.js)、[dist/index.html](dist/index.html)
  - **内容**：为 12 张大体积作品封面生成 2× 高清轻量缩略图（14 张列表封面总流量由 `3,184 KB` 降至 `277 KB`，降幅 `91.3%`），弹窗与放大层仍加载完整高清原图；全站首屏以下图片补齐 `decoding="async"`。

- [ ] ~~**P1-3 筛选按钮标注作品数量**~~ *（已跳过，保留简洁纯文字按钮）*
  - **涉及**：无（已撤回）

- [x] **P1-4 单件作品链接直达（URL Hash）与社交分享卡片**
  - **涉及**：[dist/index.html](dist/index.html)、[dist/site.js](dist/site.js)
  - **内容**：打开/关闭弹窗自动同步 `#work=<id>`，支持直达某件作品与刷新保留（兼容本地 `file://`）；补齐 `og:*` 与 `twitter:card` 社交分享元信息。

- [x] **P1-5 长页吸顶导航、当前栏目高亮与轻量回顶入口**
  - **涉及**：[dist/index.html](dist/index.html)、[dist/site.css](dist/site.css)、[dist/site.js](dist/site.js)
  - **内容**：PC 与平板端启用半透明吸顶导航并调大 `.section { scroll-margin-top: 5.75rem }`、滚动自动高亮当前展厅栏目（不显示多余浮动回顶按钮）；手机端（`≤540px`）保持顶栏不吸顶节省阅读空间，滚过首屏后显示右下角轻量「顶部」按钮，滚入页脚时自动隐藏避免与页脚「回到顶部」重复。

---

## P2｜发布收口与代码细节

- [x] **P2-1 删除页脚「本地预览」文案**
  - **涉及**：[dist/index.html](dist/index.html)
  - **内容**：删除页脚中的「本地版图版用于预览，出处见作品页与项目说明。」，仅保留来源说明。

- [x] **P2-2 文案与排版微调**
  - **涉及**：[dist/index.html](dist/index.html)、[dist/works.js](dist/works.js)
  - **内容**：统一「诞辰 400 周年」空格；《河上花图》与《鱼鸭图卷》导览补入“由右向左展开”；两处台北故宫直接下载外链标注「（PDF）」。

- [x] **P2-3 代码健壮性小修**
  - **涉及**：[dist/site.js](dist/site.js)
  - **内容**：`lookButtons` 已改用 `Number(button.dataset.look)` 读取对应帧；`new URL(work.source)` 已加 `try/catch` 容错防止单条外链异常阻断弹窗。

---

## 修改记录

| 日期 | 对应编号 | 修改内容 | 涉及文件 | 状态 |
| --- | --- | --- | --- | --- |
| 2026-11-27 | **P0-1** | 保持导航不变，将正文顺序调整为 `大音希声 → 其人 → 书画作品 → 怎么看 → 书画史地位 → 款识与印章`；同步将暖底 `#eee8dc` 从 `.biography` 移到 `.works` 维持相邻区块底色交替。 | `dist/index.html`、`dist/site.css` | 已推送（`main`: `c610f97`，`gh-pages`: `4df641d`） |
| 2026-11-28 | **P0-2** | 1）从 `大音希声八大山人详解.pdf` 升级 6 张高清图版：`lanting.webp` (`790×2200`→`1250×3482`)、`fishing.webp` (`728×2200`→`900×2718`)、`lotus-bird.webp` (`805×2200`→`900×2461`)、`reeds-geese.webp` (`1112×2200`→`1250×2474`)、`crows.webp` (`1182×2200`→`1250×2326`)、`lotus-signature.webp` (`258×572`→`432×958`，已裁去装裱边保持原比例)，6 张合计体积由 `824.4 KB` 降至 `784.6 KB`。<br>2）作品详情弹窗新增全屏「放大细看」层：支持适应屏幕 / `原寸 1:1` 切换、点击定位放大与鼠标拖拽平移、手卷默认由右向左展卷、放大态切换上下图与 `←`/`→`/`Esc` 快捷键，低清图自动隐藏放大防拉糊。<br>3）已在本地 `http://127.0.0.1:4177/` 完成 PC（`1280×800`）与手机（`390×844`）双端验证，无溢出及排版异常。 | `dist/index.html`、`dist/site.css`、`dist/site.js`、`dist/assets/{lanting,fishing,lotus-bird,reeds-geese,crows,lotus-signature}.webp` | 已推送并线上验收（`main`: `429bd6d`，`gh-pages`: `372bee3`） |
| 2026-11-28 | **P0-3 / P0-4 / P0-5** | 1）**P0-3**：为详情弹窗、全屏放大层与「怎么看」三处切图加入 `swapImage` 令牌防乱序与 `.is-loading` 加载态（未命中缓存时先隐旧图并显示「图版加载中…」，解码后 160ms 淡入），并静默预加载相邻图版与「怎么看」5 帧（顺手将 `lookButtons` 改为读取 `dataset.look`）。<br>2）**P0-4**：将弹窗顶栏 `.dialog-bar` 设为 `position: sticky; top: 0` 并加实色宣纸底与分隔线，滚到底部可随时关闭。<br>3）**P0-5**：新增 `max-width: 820px` 断点使 `.dialog-layout` 单列展示，并将 `.looking-layout`、`.biography-layout`、`.seal-pair`、`.cipher` 提前在 `max-width: 760px` 切为单列。<br>4）已在本地 `http://127.0.0.1:4177/` 完成 PC（`1280×800`）、中屏平板（`680×900`）与手机（`390×844`）三端验证。 | `dist/site.css`、`dist/site.js` | 已推送并线上验收（`main`: `c53422c`，`gh-pages`: `d871721`） |
| 2026-11-28 | **P1-1 / P1-2 / P1-4 / P1-5** | 1）**P1-1**：作品详情弹窗支持 `←`/`→` 键盘切图；3 图及以上作品新增数字页码直达条（含悬停图注提示）。<br>2）**P1-2**：为 12 张大封面生成 2× 轻量缩略图存入 `dist/assets/thumbs/`，14 张列表封面总流量由 `3,184 KB` 降至 `277 KB`（-91.3%），详情弹窗与放大层保持高清原图；全站懒加载图补齐 `decoding="async"`。<br>3）**P1-3**：按需求撤回，筛选栏保持纯文字不显示数字。<br>4）**P1-4**：支持 `#work=<id>` URL Hash 直达与关闭清理，并在 `<head>` 补齐 Open Graph / Twitter Card 社交分享标签。<br>5）**P1-5**：PC/平板启用半透明吸顶导航 + 滚动高亮当前栏目 + `scroll-margin-top: 5.75rem`；手机端保持顶栏非吸顶并配右下角轻量「顶部」浮标。<br>6）已在本地 `http://127.0.0.1:4177/` 完成 PC（`1280×800`）、平板（`680×900`）、手机（`390×844`）验证。 | `dist/index.html`、`dist/site.css`、`dist/site.js`、`dist/works.js`、`dist/assets/thumbs/*.webp`（12 张） | 已推送并线上验收（`main`: `20d7dfd`，`gh-pages`: `190ee8d`） |
| 2026-11-28 | **P2-1 / P2-2 / P2-3 + P1-1 精简** | 1）**P1-1 精简（方案 A）**：移除弹窗内数字页码直达条，仅保留「上一图 / 下一图」与键盘 `←`/`→` 切图。<br>2）**P2-1**：删除页脚中的「本地版图版用于预览，出处见作品页与项目说明。」。<br>3）**P2-2**：统一「诞辰 400 周年」空格；《河上花图》与《鱼鸭图卷》简介补入“由右向左”展卷提示；两处台北故宫直接下载外链标注「（PDF）」。<br>4）**P2-3**：为 `new URL(work.source)` 增加 `try/catch` 容错。 | `dist/index.html`、`dist/site.css`、`dist/site.js`、`dist/works.js` | 已推送并线上验收（`main`: `aa4e017`，`gh-pages`: `b2e89d7`） |
| 2026-11-28 | **P1-5 精简（方案 B）** | 浮动「顶部」按钮改为仅在手机端（`≤540px`）显示，PC/平板依靠吸顶导航不再显示浮标；同时通过 `IntersectionObserver` 监听 `.site-footer`，页脚进入视口时自动隐藏浮标，避免与页脚「回到顶部」重复。 | `dist/site.css`、`dist/site.js`、`CHANGELOG.md` | 已推送至 `main` 与 `gh-pages` |
