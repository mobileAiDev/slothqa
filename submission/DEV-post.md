---
title: "SlothQA: let an open model do the tapping, make evidence decide the result"
published: true
tags: devchallenge, hf26challenge, android, opensource
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady](https://dev.to/challenges/hacktoberfest-week3-2026-10-19).*

## What I Built

I am an Android developer. The tedious part of a small change is often the last
few minutes: open the app, find the right screen, type test data, save, and check
whether the result actually appeared. Writing the code is only part of the job.

SlothQA is a new local-model regression agent that takes a goal instead of a
recorded sequence of taps. Its first mission is deliberately small: create a task
called “Slow and Steady,” save it, and verify the task appears in the list.

At each step, a local Qwen model sees the current UI and chooses its next action.
An independent checker decides whether the outcome is proven. The model does not
get to award itself a pass.

I started SlothQA on October 22, during this challenge window. My older project,
[AI App Bridge](https://github.com/mobileAiDev/ai-app-bridge), is a credited
execution dependency. It is not the new contest entry. SlothQA adds the local
model policy, mission constraints, outcome verification, simulator, Android test
target and evidence reports.

## Demo

[Watch the 75-second demonstration](https://mobileaidev.github.io/slothqa/)

The included video is a replay reconstructed from actual execution traces:
**real local Qwen inference, real AI App Bridge Intent orchestration, simulated
device observations and actions**. It is not a recording of a physical phone.

| Scenario | Observed result | Model calls | Model inference time |
| --- | --- | --- | --- |
| Normal task creation | Independent assertion passed | 3 | 12.65 s |
| Controls reordered and renamed; extra confirmation | Independent assertion passed | 4 | 26.09 s |
| Saving deliberately broken | Inconclusive; stopped without claiming success | 5 | 34.82 s |

Those are individual demonstration runs, not a statistical benchmark. The timings
cover model calls, not a measured comparison against human testing.

The changed scenario is useful because the same goal leads to an extra action
when a confirmation dialog appears. The broken scenario is equally important:
Qwen repeated the save action, and the no-progress guard stopped the run. I do not
claim the model understood the storage failure. I claim the system did not turn
that uncertainty into a green checkmark.

## Code

[Source code](https://github.com/mobileAiDev/slothqa)

The code is MIT licensed. The repository contains the source, synthetic test
target, raw JSONL traces, Bridge receipts and readable HTML reports. Existing
dependencies retain their own licenses and are credited in THIRD_PARTY.md.

## How I Built It

The decision model is Qwen2.5-1.5B-Instruct, using its official Apache-2.0 GGUF
weights in Q4_K_M form, served locally by llama.cpp. A small model makes the
experiment easier to reproduce on CPU, although it also exposes the limits of
its planning and explanations.

The loop is observe → propose → validate → act → observe. The model chooses from
a menu compiled from unique, visible, enabled controls. Text-entry options use
approved synthetic test values. Its response cannot contain a new selector or
an arbitrary command. Structured JSON output prevents malformed decisions from
becoming device operations.

AI App Bridge 0.4.19 owns the Intent lifecycle, observation revisions and action
receipts. SlothQA's agent module supplies decisions. The success checker demands
a specific result row with the expected text and complete observation coverage;
an editor containing that same title is insufficient evidence of saving.

The first attempt was worse. A loose JSON response allowed missing fields and
incorrect text values. I retained those failed traces and changed the model
interface to a constrained action menu. The model still chooses the action order;
the executor controls which actions are legal. There is no fixed scripted fallback.

Fifteen automated tests passed, including a test against the actual Bridge Intent
implementation. Separate recorded runs used real Qwen inference. Physical Android
acceptance remains unverified in this environment. The Android debug APK was
successfully built and its signature verified. Testing it with the public CLI
on a device is the next acceptance step; this MVP does not claim
support for arbitrary third-party apps, iOS or Flutter.

I used AI assistance to implement and review this new code. The execution traces
come from running the resulting program, not from an assistant inventing a demo.

## Why Does Open Innovation Matter?

Open weights let me run the decision loop on my own CPU and inspect its actual
behavior without sending a debug screen to a hosted model service. Once the model
is downloaded, the demonstrated setup does not need a remote inference service.

The open execution layer matters just as much. I could inspect the exact Intent
contract, discover that native text input and UIA text input were not interchangeable,
and test the integration against the implementation. Replacing either the model
or the execution adapter does not require a proprietary agent service.

A closed API could also plan UI actions. My reason for this open approach is
control over deployment, model choice and evidence—not a claim that closed models
cannot do the task.

The “lazy” goal is to spend less attention on repetitive tapping and more on
reviewing meaningful failures. This first version demonstrates that loop on a
small controlled app. It also makes the remaining work visible instead of
calling every completed click a successful test.

<!-- No partner prize category is claimed: the demonstrated stack is Qwen + llama.cpp + AI App Bridge. -->
