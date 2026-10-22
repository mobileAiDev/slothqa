# 继续完成正式投稿

截至 2026-10-22，已完成新项目源码、debug APK 构建与签名验证、本地 Qwen
推理、真实 Bridge Intent 配合模拟设备的三组验证、15 项自动测试和演示回放。
未进行 Android 真机验收；公开仓库已创建；未发布 DEV 文章。

## 最短发布路径

1. 在 GitHub mobileAiDev 下新建空公开仓库 `slothqa`。不要在旧 Bridge 仓库中
   提交本作品。上传此目录，保留 LICENSE、THIRD_PARTY.md 和 evidence。
2. 将 `demo/slothqa-demo.mp4` 上传到公开可播放地址。标题注明是模拟设备回放。
3. 执行下面命令替换稿件的两个占位链接，参数必须是实际公开地址：

   `node tools/prepare-submission.cjs https://github.com/mobileAiDev/slothqa https://YOUR-PUBLIC-VIDEO-URL`

4. 登录 DEV，打开活动页的 Submission Template。粘贴生成的
   `submission/DEV-ready-draft.md`，检查两个链接及 devchallenge、hf26challenge
   标签，预览后发布。只投稿一次。截止为北京时间 2026-10-26 14:59。
5. 重新打开公开文章，记录文章 URL 和发布时间，确认代码与演示均可匿名访问。

## 推荐在截止前补齐的真机验收

在专用 Android 测试设备上安装 `dist/sloth-tasks-debug.apk`，连接 Bridge
0.4.19 和本地模型。按 README 依次跑正常、changed、broken-save 场景。
每次使用新的测试标题，保留 trace、Bridge 回执和屏幕录像。成功后才能把
“真机未验证”改为实际结果。若未完成，仍按当前诚实的模拟器边界投稿，不把
模拟执行说成手机实测。

## 当前工具限制

GitHub 网页已创建公开仓库 https://github.com/mobileAiDev/slothqa ，
连接器确认新仓库具备管理员及推送权限。DEV 页面目前要求登录。
源码、演示和证据均上传到新仓库，不修改旧 Bridge 项目。
