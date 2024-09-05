---
title: "LLMSecOps: Early Thoughts on LLM Security"
date: 2024-03-12
description: "LLMSecOps: Early Thoughts on LLM Security"
tags: [technology, AI, llm, genai, security]
draft: true
---

![LLM Viruses](/imgs/llm-viruses.jpg)

We have all seen simple, sometimes clever, but always funny "prompt injection" attacks done on ChatGPT and other state-of-the-art Large Language Models (LLM) through standard chat interfaces.

The field is moving fast, but today this is a noob mistake to deploy an LLM application without some sort of "guardrails" or ways to check if the user input is malicious. Validating user input should be done regardless and is not special to LLM applications.

However, after watching [Two Minute Papers](https://www.youtube.com/channel/UCbfYPyITQ-7l4upoX8nvctg) video ["The First AI Virus Is Here!"](https://youtu.be/4NZc0rH9gco) , it became clear that as LLM application complexity and techniques have grown, so did the surface of attack vectors.

