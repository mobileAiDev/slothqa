# SlothQA

**Give a local open model a test goal. Get observed actions and an independently
checked result.** Built from scratch on October 22, 2026 for Hacktoberfest Week 3.

SlothQA is a small Android regression agent. Qwen chooses the next action from
the current screen through a constrained menu; AI App Bridge performs native
actions and binds them to an observation revision. A separate verifier decides
whether authored outcome assertions are satisfied. There is no fixed action
sequence in the runtime planner and no scripted fallback when the model fails.

## Status and evidence

| Check | Result |
| --- | --- |
| Real local Qwen2.5 1.5B + real Bridge 0.4.19 Intent, simulated device | Executed |
| Normal task creation | Pass; 3 model calls, 12.65 seconds of model time |
| Reordered/renamed controls plus confirmation dialog | Pass; 4 calls, 26.09 seconds of model time |
| Broken save | Inconclusive; 5 calls, 34.82 seconds; repeated-action guard stopped it |
| Automated tests | 15 passed, including the real Bridge Intent contract test |
| Android debug APK | Built successfully with AGP 8.6.1, Gradle 8.7, JDK 17 and SDK 35; signature verified |
| Physical Android device | Not executed in this environment |
| Public source repository | [mobileAiDev/slothqa](https://github.com/mobileAiDev/slothqa) |
| DEV publication | Draft; awaiting account login |

These are three small demonstrations, not a benchmark. The model's explanations
can be wrong even when the selected action is correct. The broken-save run
repeated Save before the guard stopped it: this MVP does **not** reliably diagnose
the underlying fault. `inconclusive` is distinct from a confirmed product defect.
Early failed experiments are retained in `evidence/experiments`.

[Watch the 75-second trace replay](https://github.com/mobileAiDev/slothqa/blob/main/demo/slothqa-demo.mp4).

Open `evidence/bridge-normal/report.html` or `evidence/bridge-changed/report.html`.
Every run includes `trace.jsonl` with the actual model response, model name,
token usage, latency, observation, action and verification results, plus a
Bridge execution receipt. `demo/slothqa-demo.mp4` is a visual replay reconstructed
from those traces, **not an Android screen recording**.

## Quick start: no phone needed

Requirements: Node 20+ and a local model server. SlothQA itself has no npm runtime
dependencies. Download models before going offline. The evidence was produced
with llama.cpp b11803 and the official Qwen Q4_K_M weights:

```bash
llama-server -hf Qwen/Qwen2.5-1.5B-Instruct-GGUF:Q4_K_M --host 127.0.0.1 --port 8088
node bin/slothqa.cjs simulate --scenario normal --endpoint http://127.0.0.1:8088/v1 --model qwen2.5-1.5b-instruct-q4_k_m
node bin/slothqa.cjs simulate --scenario changed --endpoint http://127.0.0.1:8088/v1 --model qwen2.5-1.5b-instruct-q4_k_m
node bin/slothqa.cjs simulate --scenario broken-save --endpoint http://127.0.0.1:8088/v1 --model qwen2.5-1.5b-instruct-q4_k_m
```

Alternative local server (not used in the recorded runs):

```bash
ollama pull qwen2.5:1.5b
ollama serve
node bin/slothqa.cjs simulate --scenario changed
```

Use a local model, not an Ollama cloud-tagged model. Loopback-only HTTP routing
does not prove that a server itself never forwards requests. SlothQA has no cloud
API keys and will not silently substitute a hosted model.

Exit codes: 0 = independently verified outcome, 2 = incomplete/inconclusive,
1 = setup or execution error. Each command creates a new run directory. Existing
traces are never overwritten. An initial already-satisfied assertion is marked
inconclusive so pre-existing data is not credited to the agent.

## Android integration

The current MVP supports **Android native SDK observations**. The exact Bridge
0.4.19 Intent `inputText` contract does not support the UIA provider, so this
project does not claim arbitrary no-SDK Android app support. iOS, Flutter and
WebView support in the underlying Bridge is not inherited automatically.

1. Use Node `>=26.3.0 <27` for the Bridge CLI. Install version 0.4.19. Its install
   can configure AI clients; set `AI_APP_BRIDGE_SKIP_SETUP=1` if you want only the CLI.
2. Install the included `dist/sloth-tasks-debug.apk` on a disposable emulator/test
   phone, or open `android-demo` in Android Studio. Use JDK 17 and Android SDK 35,
   then run `./gradlew :app:assembleDebug` (Windows: `gradlew.bat`). The Gradle 8.7
   wrapper includes a pinned distribution checksum.
   The debug dependency uses the existing Apache-2.0 Bridge SDK. Never ship that
   runtime in production builds.
3. Open Sloth Tasks to its empty list, then run:

```bash
node bin/slothqa.cjs android --serial YOUR_SERIAL --package io.slothqa.demo --out runs/android-01
```

The model server must be available to the Bridge host. The CLI creates a unique
agent module and mission for each run, avoiding cached module state leaking into
another test. The public Bridge Intent call uses `native`, an explicit device and
package, bounded duration/calls/actions, and only `tap`/`inputText` actions.

To launch the changed or broken-save debug scenario, use Bridge's wrapped ADB:

```bash
ai-app-bridge adb-exec --serial YOUR_SERIAL --argv '["shell","am","start","-S","-n","io.slothqa.demo/.MainActivity","--es","scenario","changed"]' --extract null
```

The example persists its task. For a new run, choose a fresh title and update
`allowedText`, `goal` and the expected assertion in a copy of the mission.
Alternatively clear **only this disposable sample app's** data yourself. SlothQA
does not clear data, install apps, grant permissions or launch apps implicitly.

If a Bridge command times out, keep its operation ID and inspect/resume/cancel
that operation. Do not start another run to retry unknown physical actions.
`bridge-result.json` is the raw envelope; incomplete runs can be rendered later
with `node bin/slothqa.cjs report --trace runs/android-01/trace.jsonl --out report.html`.

## Mission design

`missions/create-task.json` contains a natural-language goal, approved test strings,
allowed native selectors and independent success assertions. It does not specify
an action order. Input candidates combine the current editable controls with
approved strings; the model chooses which action to take. Adding a mission means
authoring its intended outcome, not recording a click sequence.

Assertions demand one visible matching control and complete reported tree
coverage. Checking a result row avoids mistaking an editor containing the same
text for a saved task. This only proves the configured UI property. It does not
prove durable storage, backend delivery or behavior that is not asserted.

The small default model and supplied prompt are tuned to the task-editor demo.
Other workflows need tested missions, possibly a larger local model, and may
need more supported actions. This is not a universal test agent.

## Tests and reproduction

```bash
npm test
# Optional contract test; points at an unpacked/installed Bridge 0.4.19 package:
AAB_PACKAGE_ROOT=/absolute/path/to/bridge/package npm test
# Run the real model through the same Bridge Intent implementation with a fake device:
node bin/slothqa.cjs simulate --scenario changed --bridge-package /absolute/path/to/bridge/package --endpoint http://127.0.0.1:8088/v1
```

Without `AAB_PACKAGE_ROOT`, one Bridge integration test is explicitly skipped.
Unit tests use a declared model test double; recorded `bridge-*` runs use actual
Qwen inference. The simulator is stateful and responds to the chosen actions.
Its snapshots are synthesized; the production native SDK adapter remains a
separate acceptance gate. Version/hash information is in `evidence/environment.json`.

## Privacy and boundaries

Use dedicated debug apps and synthetic test data. Traces intentionally contain
UI text and model output; inspect them before sharing. The Android runner requires
an action selector allowlist and only sends approved input strings. The model
cannot supply shell commands, arbitrary selectors, URLs, or a successful verdict.
These constraints reduce the exposed surface; they are not a general security
sandbox or a proof of immunity to prompt injection.

## Contest and attribution

See `THIRD_PARTY.md`, `submission/rules-check.md` and `submission/DEV-post.md`.
The new work is SlothQA; AI App Bridge and Qwen existed earlier and are credited.
No partner prize category is claimed without a meaningful implemented use.
The submission draft links to this new public repository and its demonstration video.
DEV publication is still pending.
Any post-deadline changes must be recorded here. No post-deadline changes yet.
