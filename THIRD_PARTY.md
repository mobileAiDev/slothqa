# Prior work and new work

SlothQA was started on 2026-10-22 for Hacktoberfest Week 3. It is a separate
project, not a rename, fork submission, or PR to AI App Bridge.

## Existing dependencies, not claimed as new

- **AI App Bridge 0.4.19**, by mobileAiDev, Apache-2.0:
  https://github.com/mobileAiDev/ai-app-bridge
  Source inspected at `8cd3467e51bea503a5761fffba36454d82f5bb70`.
  Used as the native Android execution and evidence substrate. No Bridge source
  is vendored in this repository. The simulator integration uses its internal
  test adapter seam; production Android execution uses the public CLI.
- **Qwen2.5-1.5B-Instruct-GGUF**, Qwen team, Apache-2.0:
  https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
  Model revision `91cad51170dc346986eccefdc2dd33a9da36ead9`, Q4_K_M.
  Model weights are downloaded separately and are not included in this archive.
- **llama.cpp**, MIT: https://github.com/ggml-org/llama.cpp
  The included evidence used build b11803 / commit a37cc4610 on CPU.
  Binaries are not included. Ollama is an alternative local serving option;
  its path is implemented through the OpenAI-compatible endpoint but was not
  the server used in the evidence runs.
- Android Gradle Plugin and Android platform: build dependencies, not vendored.
- Gradle 8.7 Wrapper, Apache-2.0: https://github.com/gradle/gradle
  Generated wrapper scripts/JAR are included; their source notices are retained.
  The full Gradle distribution is not included. The Apache license is provided
  in `third_party/ai-app-bridge/LICENSE`.

The debug APK includes the unmodified AI App Bridge Android SDK. Its Apache-2.0
license and NOTICE are retained in `third_party/ai-app-bridge/`.

## New contribution

The mission format, bounded model-driven policy, observed-control menu,
per-run agent binding, independent outcome verifier, stateful simulator,
Android Sloth Tasks example, HTML evidence renderer, tests, and submission
materials were created for this project. Existing AI App Bridge docs informed
the integration. AI assistance was used to write and review this new code.

Do not submit AI App Bridge's old repository as the contest project. Create a
new SlothQA repository within the contest window and retain this attribution.
If changes are made after the deadline, label them in README as required by
the contest. Do not backdate commits or repository creation.
