# 连接 Gmail 与 DeepSeek

## Gmail

只需一组应用专用密码，不需要 Google Cloud 项目。

1. 在 Google 账号开启两步验证：myaccount.google.com → 安全性 → 两步验证。
2. 打开应用专用密码页面 https://myaccount.google.com/apppasswords ，创建一个应用（名称随意，例如 workstation），得到 16 位应用专用密码。
3. 在 Workstation“设置 → Gmail 连接”填写 Gmail 地址和应用专用密码（4×4 分组的空格可忽略）并保存，点击“测试并连接”。

连接走 IMAP（imap.gmail.com:993，TLS），只读取收件箱；读取邮件使用 PEEK 模式，不改变已读状态、星标、归档或内容。凭据用系统 safeStorage 加密后只保存在本机 `secrets.bin`，不会进入用户档案导出，也不要提交到 GitHub。应用专用密码可随时在上述 Google 页面撤销；撤销后在应用内断开并重新保存即可。

官方参考：[Google 应用专用密码](https://myaccount.google.com/apppasswords)

## DeepSeek

1. 在 DeepSeek 控制台创建 API key，并确认可用额度。
2. 在“设置 → DeepSeek 助手”保存 key，点击“测试连接”。
3. 默认模型名为 `deepseek-flash`；可按你的账号支持的模型修改（如 `deepseek-v4-pro`）。
4. 连接 Gmail 后，阅读启用说明并勾选每日总结，设置执行时间（默认应用时区 20:00）。

API 请求固定发送到 `https://api.deepseek.com/chat/completions`。Key 只在主进程使用，界面只获得“已保存”状态。自动总结在每天设定时间覆盖过去 24 小时（昨日设定时间到今日设定时间）的收件箱邮件；手动触发则总结今天 00:00 至今的邮件，均包括已读。单封翻译按按钮触发。正文发送到 DeepSeek，附件不发送。

网络失败、额度不足或部分邮件失败时，成功片段保存在本机。重新生成会继续失败部分。邮件总结内容仅供辅助阅读，不自动创建任务或执行邮件内容里的要求。

官方参考：[DeepSeek API](https://api-docs.deepseek.com/)
