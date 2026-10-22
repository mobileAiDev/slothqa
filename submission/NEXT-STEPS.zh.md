# 继续完成正式投稿

截至 2026-10-22，已完成新项目源码、debug APK 构建与签名验证、本地 Qwen
推理、真实 Bridge Intent 配合模拟设备的三组验证、15 项自动测试和演示回放。

## 已公开

- 新仓库：https://github.com/mobileAiDev/slothqa
- 演示播放器与三组报告：https://mobileaidev.github.io/slothqa/
- 源码中的 submission/DEV-post.md 已填写实际公开链接。
- 旧的 ai-app-bridge 仓库没有被修改或冒充新项目。

## 仍需完成

1. 在已连接的 Chrome 中登录 DEV。当前页面显示登录表单。
2. 使用活动页的 Submission Template 创建文章，把 DEV-post.md 中的标题、
   标签和正文填入编辑器，预览并核验链接后发布。确保本周只提交这一份。
3. 记录公开文章 URL 和发布时间，确认匿名访问。截止为北京时间
   2026-10-26 14:59。只有公开文章发布后才算完成这一步。

## 真机验收

在专用 Android 测试设备上安装 dist/sloth-tasks-debug.apk，连接 Bridge
0.4.19 和本地模型。按 README 跑正常、changed、broken-save 场景。
每次使用新的测试标题，保留 trace、Bridge 回执和屏幕录像。成功后才能把
“真机未验证”改为实际结果；当前演示明确为模拟设备数据的执行回放。

GitHub 的授权已验证，仓库创建和文件提交均已成功，不需要重复授权。
