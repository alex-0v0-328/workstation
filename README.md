# Workstation

Windows 个人工作台，将 TODO、学习和 Gmail 阅读整合到一个本地应用中。

## 功能

- 学期、课程、自定义考核、日期精度、成绩及人工确认 hurdle。
- 学业考核直接出现在 TODO 中，完成进度与学习区同步，无重复任务。
- ICS 文件 / HTTPS 订阅、周课表、单次调课与取消、手动周次安排。
- Windows Fluent 浅色 / 深色 / 跟随系统主题，独立的主题布局接口。
- Gmail 只读列表、搜索、正文和本地缓存；DeepSeek 单封翻译及每日增量总结。
- SQLite 本地持久化、JSON 备份恢复、托盘、桌面提醒与可选开机启动。

## 开发

需要 Windows 11 x64、Node.js 24 LTS、npm，以及可访问 npm/GitHub 的网络。首次安装会下载 Electron 并为其重建 SQLite 原生模块。

```powershell
npm.cmd ci
npm.cmd run dev
```

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run smoke
npm.cmd run package
node scripts/packaged-check.cjs
```

`smoke` 使用独立 `.local/` 测试数据目录运行真实 Electron UI，并验证重启后的持久化，不读写个人正式数据。生产安装包生成到 `release/`。初次构建的安装包未做商业代码签名。

## 录入学业

1. 在“学习”中新建学期，填写起止日期、时区与课程数量。草稿自动保存在本机。
2. 填写课程详情，再为每门课程添加考核、成绩和 hurdle。未知项可以留待补充。
3. 在向导中导入 ICS、添加订阅链接或手动安排课表；预览后统一创建学期。
4. 考核自动出现在 TODO。之后可在“学习”和“周课表”继续修改。未公布日期可留空；仅有日期不会自动变为 23:59。

向助手提供信息时使用 [中文填写模板](docs/academic-template.md)。[结构化示例](examples/academic-example.json) 使用虚构课程，可通过“导入学业 JSON”预览后导入。

## Gmail 和 DeepSeek

详见 [连接配置](docs/setup.md)。两个服务分别配置：Google Desktop OAuth 用于读取 Gmail，DeepSeek API key 用于翻译和总结。没有配置服务时，学习与 TODO 仍可完整离线使用。

## 数据

正式数据存放在 Electron 的 Windows 用户应用数据目录（通常为 `%APPDATA%/workstation`）：

- `workspace.db`：学业、TODO、课表、设置、邮件缓存及处理进度。
- `secrets.bin`：通过 Windows 支持的 `safeStorage` 加密的 OAuth 凭据与 API key。
- `before-restore-*.json`：恢复备份前自动保存的当前数据副本。
- 学期向导草稿由本机 Chromium profile 保存；不包含在 JSON 备份中。

JSON 备份不包含凭据、邮件和 AI 缓存，包含日历订阅链接，因此请把它当作个人数据保管。跨电脑恢复后需重新连接服务。卸载默认保留用户数据。

## 已知边界

- 一个本地用户、一个 Gmail 账号，无云同步、发信或远程主题包。
- 课表普通网页作为课程主页入口，不自动登录学校系统。假期说明供查看，排除停课日需填写手动课表例外日期。
- 成绩是已获总评分的基础计算；不自动解释复杂 hurdle 或推断是否通过课程。
- 邮件 HTML 清理为安全阅读内容，不加载远程图片；完整链接、原版排版和附件在 Gmail 查看。
- 应用退出、电脑关机或休眠时不运行任务。应用恢复后补做；系统通知最终展示由 Windows 通知权限和专注设置控制。
- 真实 Gmail 授权、真实 DeepSeek 请求、实际学校订阅及安装后通知需要对应配置与设备验收。自动化通过不等于这些连接已经验证。

产品规格见 [product.md](docs/product.md)，验证记录见 [acceptance.md](docs/acceptance.md)。
