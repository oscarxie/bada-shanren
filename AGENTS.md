# 项目同步约定

每次完成并验证本项目的本地修改，提交本次任务涉及的文件，并将 `main` 推送到 `origin`（`oscarxie/bada-shanren`）。

如果 `dist/` 有改动，用 `git subtree split --prefix=dist HEAD` 生成发布提交，再将该提交推送到 `origin` 的 `gh-pages` 分支。采用普通推送，遇到远端有新提交时先检查差异。

同步完成后确认远端分支已更新。涉及网站改动时，再从公开网址验证实际变更，等 GitHub Pages 发布生效后汇报。

- [GitHub 仓库](https://github.com/oscarxie/bada-shanren)
- [GitHub Pages 网站](https://oscarxie.github.io/bada-shanren/)
