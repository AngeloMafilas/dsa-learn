# dsa-learn

## Overview

This repository is an engineering playground for orchestrating LLM-driven agentic workflows across multiple language runtimes (*Dart, Go, JavaScript, Python*) using **Google Genkit**. It pairs experimental agent code with a production-grade **Firebase** backend—**Firestore**, **Data Connect**, **Auth**, and **App Hosting**—so that prototypes can graduate to deployable services without re-platforming. The intent is to validate *SDK parity*, agent performance, and orchestration patterns under realistic infrastructure constraints rather than in isolated notebooks.

---

## Project Architecture

```text
dsa-learn/
├── .agents/
│   └── skills/                 # Reusable agent capabilities (tools, prompts, flow definitions)
├── firebase-dart/              # Genkit agent runtime — Dart/Flutter surface
├── firebase-go/                # Genkit agent runtime — Go services
├── firebase-js/                # Genkit agent runtime — Node/TypeScript flows
├── firebase-python/            # Genkit agent runtime — Python flows
├── src/                        # Shared application source, client integrations, DSA modules
├── dataconnect/                # Data Connect schema, connectors, generated SDKs
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Composite index definitions
├── firebase.json               # Emulator + hosting + service configuration
└── README.md
```

The deliberate split into `firebase-<language>` directories is the core architectural decision. Genkit exposes conceptually identical primitives—**flows**, **tools**, **prompts**, and **model references**—across all four SDKs, but the ergonomics, type guarantees, streaming semantics, and tracing fidelity differ per runtime. Maintaining the *same agent contract* in parallel implementations lets us:

- **Benchmark SDK parity** — confirm a flow behaves identically whether invoked from Go or Python.
- **Profile runtime cost** — compare cold-start, latency, and memory footprint per language for the same orchestration graph.
- **Isolate failure domains** — a regression in the Dart SDK never blocks experimentation in the JS or Go tracks.

The `.agents/skills` directory centralizes language-agnostic *intent*: tool descriptions, prompt templates, and flow specifications that each runtime implementation is expected to honor. This keeps the multi-language matrix from drifting into four divergent codebases.

---

## Core Technologies

| Layer | Technology | Role |
|-------|------------|------|
| **Agent Orchestration** | Google Genkit (Dart, Go, JS, Python) | Defines flows, tools, and prompts; manages model calls, tracing, and structured I/O across runtimes |
| **Persistence** | Cloud Firestore | Document store for agent state, conversation history, and experiment metadata |
| **Relational Data** | Firebase Data Connect | Schema-first, GraphQL-backed Postgres layer with generated type-safe SDKs |
| **Identity** | Firebase Auth | User and service-account authentication boundary for protected flows |
| **Runtime Hosting** | Firebase App Hosting | Deploy target for JS/Node agent endpoints and front-end surfaces |
| **Local Development** | Firebase Emulator Suite | Local Firestore, Auth, Data Connect, and Hosting emulation |
| **Agent Dev Loop** | Genkit CLI + Developer UI | Local flow execution, trace inspection, and prompt iteration |

---

## Development & Deployment

### 1. Environment Initialization

Install the toolchains required by the runtimes you intend to exercise. You only need the SDKs for the `firebase-<language>` directories you plan to run.

| Runtime | Minimum Version | Verify |
|---------|-----------------|--------|
| Node.js | `20 LTS+` | `node --version` |
| Go | `1.22+` | `go version` |
| Python | `3.11+` | `python3 --version` |
| Flutter / Dart | `3.x+` | `flutter --version` |

Install the global CLIs:

```bash
# Firebase CLI (emulators, deploy, Data Connect)
npm install -g firebase-tools

# Genkit CLI (local flow runner + Developer UI)
npm install -g genkit-cli

# Authenticate against the project
firebase login
```

Confirm the active project is bound:

```bash
firebase use --add
```

### 2. Bootstrapping the Firebase Emulators

The emulator suite is the source of truth for local development. **Do not point agents at production Firestore or Data Connect during experimentation.**

Install per-runtime dependencies first:

```bash
# JS / Node runtime
cd firebase-js && npm install && cd ..

# Python runtime
cd firebase-python && python3 -m venv .venv && source .venv/bin/activate \
  && pip install -r requirements.txt && cd ..

# Go runtime
cd firebase-go && go mod download && cd ..
```

Start the full emulator suite (Firestore, Auth, Data Connect, Hosting):

```bash
firebase emulators:start
```

The **Emulator UI** is served at `http://localhost:4000` and provides live inspection of Firestore documents, Auth users, and Data Connect queries. Genkit flows should resolve emulator endpoints via the standard `FIRESTORE_EMULATOR_HOST` and `FIREBASE_AUTH_EMULATOR_HOST` environment variables, which the emulator process exports automatically when started in the same shell.

To run the emulators with a clean, repeatable dataset, export and re-import state:

```bash
# Persist current emulator state on exit
firebase emulators:start --export-on-exit=./.emulator-data

# Reload a known-good fixture set
firebase emulators:start --import=./.emulator-data
```

### 3. Running Genkit Agent Experiments Locally

With emulators running in one terminal, start a Genkit runtime in a second. The CLI wraps your flow entrypoint and launches the **Genkit Developer UI** for invoking flows, inspecting traces, and iterating on prompts.

```bash
# JS / TypeScript flows
cd firebase-js
genkit start -- npm run dev

# Python flows
cd firebase-python
source .venv/bin/activate
genkit start -- python main.py

# Go flows
cd firebase-go
genkit start -- go run .
```

The Developer UI is exposed at `http://localhost:4000/genkit` (or the port reported by the CLI). Use it to:

- Trigger individual **flows** with structured input and observe streamed output.
- Drill into **traces** to see model calls, tool invocations, and latency per span.
- Hot-reload **prompts** defined under `.agents/skills` without restarting the runtime.

To run the *same* logical flow across runtimes for parity validation, repeat the above per directory and compare trace output side by side.

### 4. Deployment

Data Connect schema and Firestore rules are deployed independently of agent runtimes:

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Data Connect schema + connectors
firebase deploy --only dataconnect

# Deploy the hosted runtime (App Hosting)
firebase deploy --only apphosting
```

Always validate against the emulator suite before deploying. Rules and indexes are the most common source of runtime divergence between local and hosted environments.

---

## Engineering Philosophy

This repository exists to operate at the intersection of two disciplines that are usually studied in isolation: classical **Data Structures & Algorithms** and **LLM-powered application architecture**.

Agentic systems are, fundamentally, orchestration problems—*graphs of tools, state machines over conversation history, ranking and retrieval pipelines, and resource-bounded search*. The same rigor that makes a good DSA solution (clear invariants, predictable complexity, deterministic state transitions) is exactly what separates a reliable agent from a non-deterministic demo. By forcing every agent pattern through four runtimes and a real Firebase backend, this project treats LLM orchestration as a serious engineering domain rather than prompt tinkering. The goal is fluency: understanding *why* a flow behaves the way it does at the SDK, runtime, and data-layer level—not just *that* it produces an answer.
