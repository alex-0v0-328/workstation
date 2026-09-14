# 连接 Gmail 与 DeepSeek

## Gmail

1. 在 Google Cloud 创建或选择自己的项目，并启用 Gmail API。
2. 配置 OAuth 同意屏幕。个人测试时将自己加入测试用户。
3. 创建 OAuth 客户端，应用类型选择 **Desktop app**，记录客户端 ID 和客户端密钥。
4. 在 Workstation“设置 → Gmail 连接”填写这两项并保存。
5. 点击“在浏览器中授权”，选择 Gmail 账号并允许只读邮件访问。完成后返回应用。

授权使用系统浏览器、PKCE 和临时本机回调端口。只申请 `https://www.googleapis.com/auth/gmail.readonly`；不修改邮件已读状态、星标、归档或内容。

Google 的测试模式、组织策略及授权状态可能要求重新授权。若 Google 拒绝连接，先核对 Gmail API 是否启用、客户端是否为 Desktop app、当前账号是否为测试用户。不要将 OAuth JSON 或密钥提交到 GitHub。

官方参考：

- [Desktop OAuth](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Gmail API scopes](https://developers.google.com/workspace/gmail/api/auth/scopes)

## DeepSeek

1. 在 DeepSeek 控制台创建 API key，并确认可用额度。
2. 在“设置 → DeepSeek 助手”保存 key，点击“测试连接”。
3. 默认模型名为 `deepseek-chat`；可按你的账号支持的模型修改。
4. 连接 Gmail 后，阅读启用说明并勾选每日总结，设置执行时间（默认应用时区 20:00）。

API 请求固定发送到 `https://api.deepseek.com/chat/completions`。Key 只在主进程使用，界面只获得“已保存”状态。首次总结从启用时开始，不扫描全部历史邮件。摘要覆盖新增且仍在收件箱中的邮件，包括已读；单封翻译按按钮触发。正文发送到 DeepSeek，附件不发送。

网络失败、额度不足或部分邮件失败时，成功片段保存在本机。重新生成会继续失败部分。邮件总结内容仅供辅助阅读，不自动创建任务或执行邮件内容里的要求。

官方参考：[DeepSeek API](https://api-docs.deepseek.com/)
