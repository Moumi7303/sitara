# Sitara AI Decision Engine Backend

A production-ready Laravel 11 REST API that acts as an intelligent AI proxy, using Groq LLMs to provide structured decision analysis. Developed with SSE streaming, encrypted API key management, Redis caching, and historical context retrieval.

---

## 🛠 Tech Stack

| Layer        | Technology                               |
|-------------|------------------------------------------|
| **Framework**| Laravel 11 + PHP 8.3                    |
| **Database** | MySQL (optimized with composite indexes) |
| **Caching**  | **Redis** (Session & Result Caching)     |
| **Queues**   | **Redis** (Async AI Processing)          |
| **Auth**     | Laravel Sanctum (Bearer Tokens)          |
| **Provider** | Groq API (`mixtral-8x7b-32768`)         |
| **Protocol** | SSE (Server-Sent Events)                 |

---

## 🚀 Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure your database, Redis, and Groq connection details:
   ```env
   DB_DATABASE=sitara
   DB_USERNAME=root
   DB_PASSWORD=

   # Redis Configuration
   REDIS_HOST=127.0.0.1
   CACHE_STORE=redis
   QUEUE_CONNECTION=redis

   # Groq API
   GROQ_API_BASE_URL=https://api.groq.com/openai/v1
   GROQ_API_KEY=           # Optional: system-level master key
   GROQ_DEFAULT_MODEL=mixtral-8x7b-32768
   ```

---

## 📦 Installation

```bash
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

---

## 🚦 API Reference

All protected routes require an `Authorization: Bearer {token}` header.

### 🔑 Authentication

#### `POST /api/auth/register`
- Parameters: `name`, `email`, `password`

#### `POST /api/auth/login`
- Parameters: `email`, `password`

#### `GET /api/user/profile`
- Returns the current authenticated user profile.

---

### 🔑 API Key Management
Users store their own Groq API keys, which are stored encrypted at rest using AES-256.

- `POST /api/api-key`: Store a new key (automatically validated against Groq before saving).
- `GET /api/api-key`: List your stored keys (active/inactive).
- `DELETE /api/api-key/{id}`: Securely remove a key from the database.

---

### 🧠 AI Decisions

#### `POST /api/decision` — Process a new decision
Submits a challenge to the AI.

**Parameters:**
- `query` (required): The decision context to analyze (min 10 chars).
- `domain` (optional): `career`, `tech`, `business`, `personal`. (Automatically detected if omitted).
- `async` (optional): `true/false`. If true, returns immediately with a `decision_id`.

#### `POST /api/decisions/{id}/rerun` — Re-run a decision
Re-processes an existing decision through the AI engine, refreshing its output.

#### `GET /api/decisions` — List decision history
Returns a paginated list of your previous decisions and results.

#### `GET /api/decisions/{id}` — Get single decision
Returns a single decision with its full structured output.

---

### 📡 Real-time Streaming (SSE)

#### `GET /api/decisions/{id}/stream`
Connect via `EventSource` to receive live processing updates.

**SSE Events:**
- `processing`: Analysis has started.
- `streaming`: Incremental JSON chunks (contains `chunk` field).
- `completed`: Final validated JSON output.
- `error`: Error details if something goes wrong.

---

## 🧪 Quality Assurance

We maintain a comprehensive test suite to ensure the stability and reliability of the AI engine.

### 🔬 Running Tests
```bash
php artisan test
```
**Test Coverage:**
- **Feature Tests**: Authentication, API Key Management, Synchronous/Asynchronous Decisions.
- **Unit Tests**: Encryption, Prompt Building, Response Parsing, and Model Relationships.
- **Total**: 64 tests, 132 assertions (100% Pass).

---

## 🔍 Monitoring & Diagnostics

### 📊 Audit Logging
Significant system actions (e.g., API key validation, decision completion) are recorded in the `audit_logs` table.

### 🩺 Data Integrity Check
Run the custom diagnostic command to verify the current state of the database:
```bash
php artisan tinker backend/check_db.php
```

---

## 🛡 License

**Proprietary License**

Copyright (c) 2026 Moumi7303. All rights reserved.

No part of this software may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the copyright holder.

For permissions, please contact the repository owner at https://github.com/Moumi7303.
