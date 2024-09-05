---
title: My LLM Toolbox
date: 2024-04-06
description: My LLM Toolbox
tags: [llm, genai, ai, tools]
draft: false
---

<div style="display: flex;">
  <img src=/imgs/llm-toolbox.jpg" style="width: 100%; object-fit: contain;" />
</div>



This a dump of tools, libraries, and other LLM-related things I have collected.

> Note: I probably haven't actually used 75% of the stuff, so I am not endorsing anything in particular

## Models

### Function Calling

  - [Gorilla](https://github.com/ShishirPatil/gorilla?tab=readme-ov-file)
  - [Functionary](https://github.com/MeetKai/functionary)

### Voice

#### Text-to-Speech

  - [Piper](https://github.com/rhasspy/piper): Fast!
  - [Coqui TTS](https://github.com/coqui-ai/TTS)
  - [OpenVoice](https://github.com/myshell-ai/OpenVoice)
  - [MetaVoice](https://github.com/metavoiceio/metavoice-src)
  - [Bark](https://github.com/suno-ai/bark): Generates any sound, not just voice!
  - [WhisperSpeech](https://github.com/collabora/WhisperSpeech)
  - [Amphion](https://github.com/open-mmlab/Amphion)
  - [MeloTTS](https://github.com/myshell-ai/MeloTTS)
  - [VoiceCraft](https://github.com/jasonppy/VoiceCraft): Speech editing

#### Voice-to-Text

  - [Whisper](https://github.com/openai/whisper)

### Leaderboards

  - [Chatbot](https://chat.lmsys.org/?arena)
  - [Function Calling](https://gorilla.cs.berkeley.edu/leaderboard)


---


## Application

  - [AutoGPT](https://github.com/Significant-Gravitas/AutoGPT) (never actually even tried it lol)
  - [01](https://github.com/OpenInterpreter/01): Language Model Computer
  - [podgenai](https://github.com/impredicative/podgenai?tab=readme-ov-file): AI generated podcasts (both content and voice)

### CLI

  - [`gorilla-cli`](https://github.com/gorilla-llm/gorilla-cli)
  - [`aiac`](https://github.com/gofireflyio/aiac): Generate IaC files from Terraform to CI config files
  - [llm](https://github.com/simonw/llm?tab=readme-ov-file): Prompt models from the CLI
  - [Open Interpreter](https://github.com/OpenInterpreter/open-interpreter)

### NeoVim

  - [llm.nvim](https://github.com/huggingface/llm.nvim)

### Local

  - [Ollama](https://github.com/ollama/ollama): Run models locally and easily
  - [Web LLM](https://github.com/mlc-ai/web-llm): Run models in the browser!
  - [LocalAI](https://github.com/mudler/LocalAI)
  - [OpenDevin](https://github.com/OpenDevin/OpenDevin)
  - [GPT4All](https://github.com/nomic-ai/gpt4all): Local ChatGPT
  - [Llama](https://github.com/meta-llama/llama)
  - [Llama.cpp](https://github.com/ggerganov/llama.cpp)
  - [BionicGPT](https://github.com/bionic-gpt/bionic-gpt)
  - [Jan](https://github.com/janhq/jan)
  - [Open WebUI](https://github.com/open-webui/open-webui)

### Desktop Integration

  - [ChatGPT Gnome Extension](https://github.com/HorrorPills/ChatGPT-Gnome-Desktop-Extension)
  - [ChatGPT Desktop Client](https://github.com/lencx/ChatGPT)


---


## Developer Tools

### Example Apps

  - [Production RAG](https://github.com/ray-project/llm-applications)
  - [SEC Insights](https://github.com/run-llama/sec-insights)
  - [Chat LangChain](https://github.com/langchain-ai/chat-langchain)
  - [DocsGPT](https://github.com/arc53/DocsGPT)

### Frameworks

  - [LangChain](https://github.com/langchain-ai/langchain/)
  - [LlamaIndex](https://github.com/run-llama/llama_index)
  - [AutoGen](https://github.com/microsoft/autogen)
  - [fastRAG](https://github.com/IntelLabs/fastRAG?tab=readme-ov-file)

### Data Loaders

  - [Unstructured](https://github.com/Unstructured-IO/unstructured)

### Structured Output

  - [Instructor](https://github.com/jxnl/instructor)
  - [SGLang](https://github.com/sgl-project/sglang)
  - [LMQL](https://github.com/eth-sri/lmql)
  - [guidance](https://github.com/guidance-ai/guidance)
  - [GPTScript](https://github.com/gptscript-ai/gptscript)
  - [Fructose](https://github.com/bananaml/fructose): Strongly-typed LLM calls
  - [DSPy](https://github.com/stanfordnlp/dspy): Programming, not prompting, models

### Embeddings

  - [`sentence-tranfomers`](https://github.com/UKPLab/sentence-transformers)

### Vector Databases

  - [Qdrant](https://github.com/qdrant/qdrant)
  - [RediSearch](https://github.com/RediSearch/RediSearch)
  - [Weaviate](https://github.com/weaviate/weaviate)
  - [Milvus](https://github.com/milvus-io/milvus)
  - [pgvector](https://github.com/pgvector/pgvector)

### Observability

  - [Langfuse](https://github.com/langfuse/langfuse)
  - [Openllmetry](https://github.com/traceloop/openllmetry)

### Evaluations (Evals)

  - [Ragas](https://github.com/explodinggradients/ragas)

### Security

  - [Rebuff](https://github.com/protectai/rebuff): Self-hardening prompt injection detector
  - [E2B](https://github.com/e2b-dev/E2B): Sandboxed Python enviroment for AI agents

### Packaging

  - [Llamafile](https://github.com/Mozilla-Ocho/llamafile)
  - [Cog](https://github.com/replicate/cog): Containers for ML models

### Low/No Code

  - [Flowise](https://github.com/FlowiseAI/Flowise)
  - [Langflow](https://github.com/logspace-ai/langflow)
  - [OpenCopilot](https://github.com/openchatai/OpenCopilot)


---


## Go

  I made the dumb mistake of trying to make a RAG app in Go. The ecosystem is way behind Python and JavaScript, but still found some promising projects.

  - [LangChain Go](https://github.com/tmc/langchaingo)
  - [Cybertron](https://github.com/nlpodyssey/cybertron): Use pre-trained transfomers from HuggingFace for tasks like vector embedding, etc.
  - [RediSearch Client](https://github.com/redis/rueidis)

