# 75 秒演示材料说明

`demo/slothqa-demo.mp4` 来自本次真实保存的 JSONL 回放。始终标注 REAL LOCAL
MODEL / SIMULATED DEVICE。不是手机录屏，不能以真机演示名义发布。

画面顺序：

1. 输入目标：创建名为 Slow and Steady 的任务，验证列表结果。
2. 正常流程：Qwen 逐步决定新建、输入、保存；独立断言通过。
3. 界面变化：调整按钮文字、顺序，增加确认弹窗；同一个任务定义下模型额外选择确认。
4. 保存故障：模型出现无进展重复动作，保护逻辑终止；最终是 inconclusive，不是 pass，也不是已诊断的产品缺陷。
5. 验证边界：15 项测试通过；Android 示例已提供，真机还未验收。

英文旁白建议：

“I want to spend less time repeating the same taps after every Android change.
SlothQA gives a local open model the current screen and a goal. The model chooses
one action at a time. The executor checks its choice, and a separate verifier
checks the result. This replay uses real Qwen inference and the real Bridge
Intent loop with a simulated device. When the UI changes, the model chooses the
new confirmation step. When saving breaks, it does not earn a pass. The small
model still makes mistakes; the evidence makes those mistakes visible. Android
device acceptance is the next step.”

真机补录：在一个干净的测试设备上安装 debug 示例，启动本地模型及桥接，
录制手机屏幕和终端。先拍正常流程，再拍 changed 场景，最后拍 broken-save。
公开前仅保留合成测试数据，不录个人账号或通知。用真正的录屏替换视频中的
模拟界面后才修改相应声明。
