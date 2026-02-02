# `buquet`: Bucket Queue and Workflow Orchestrator
2026-02-02

`buquet` is a Rust and Python library for building durable queues and workflows with the only infrastructure dependency of S3-compatible object storage.

The motivation behind this project was from experience of using Temporal and related projects for production workflows. This project doesn't aim to replace these tools, as they still have their place, but aims to provide a simpler alternative that hopefully aligns with more use cases of different scales.

I have to credit the idea to the [turbopuffer](https://turbopuffer.com/) team and their transparency of the tech that enabled them to build an exceptional and fast database for the AI era on S3 (and compatible object storage).

Essentially, in the past five years, the following S3 features made such applications possible:

* Read-after-write consistency (December 2020)
    * After writing data, it is immediately available for reads.
* Write-Once Semantic (August 2024)
    * `If-None-Match: *` conditional writes allow writing data only if it doesn't exist: required for preventing duplicate data.
* Compare-and-Swap (CAS) (November 2024)
    * `If-Match` conditional writes enable writing data if the previous version is expected and was not updated: enabling optimistic locking.

Each of these features enabled the creation of `buquet`, offloading a lot of the complexity distributed systems to S3 - essentially making S3 the "control plane".

## How These Features Enable `buquet`

**Atomic task claiming**: when multiple workers try to claim the same task, they each capture the task object's ETag (Entity Tag), a unique identifier tied to a specific version of an object, then attempt a conditional PUT with `If-Match`. One will successfully claim the task and start its execution - the other will receive a 412 and continue looking for other available tasks. This is all without the workers coordinating or being aware of each other.

**State transitions**: using the same pattern, workers update the status of tasks from pending, running, completed. If a worker crashes and the lease expires, a new worker will be able to pick up the task and continue. If the worker recovers, it's not possible for it to corrupt the task state due to its ETag being stale.

**Duplication prevention**: Task submission uses `If-None-Match: *` ensuring each task is only submitted exactly once.

**Audit trails**: S3 versioning allows built-in state management logging: no need to review logs to understand what happened when - the task object is the only source of truth.

All without any additional databases, brokers, or ops headaches.

## Why This Matters

**Simpler infrastructure and ops**: one bucket vs database + broker + cache + coordination service
**Cost**: Object storage is cheap. Rough estimations put it at about $100/month for 1 million tasks.
**Transparency**: no need to understand complex distributed systems managing your tasks - everything is just an object in S3 - inspection, debugging, and fixing is trivial: `aws s3 cp <task_path>`.

## `buquet` Workflows

Built on `buquet` primitives, `buquet` workflows adds workflow orchestration: DAGs with task dependencies, fan-out/fan-in patterns, conditional branching, and signaling.
Same architecture, more power, same S3-only simplicity.

---

First turbopuffer, now `buquet`. What else can we build on S3?

Source code available [here](https://github.com/h0rv/buquet).

