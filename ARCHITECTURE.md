# Architecture / Design Overview

This project is a minimal **Chatbot Platform** that supports:
- User authentication (JWT)
- Multi-user project & agent management
- Prompt storage per agent
- Chat interface backed by an LLM provider (OpenAI Responses API)
- (Optional) File upload support per agent/project (OpenAI Files API)

The system is designed to be minimal, scalable, and extensible for future enhancements like analytics, integrations, and advanced retrieval (RAG).

---

## High-Level Architecture

The platform is split into two services:

1. **Frontend (Next.js App Router)**
   - UI for authentication, dashboard, agent management, and chat experience.
   - Stores JWT in browser `localStorage`.
   - Calls backend APIs via REST + streaming responses.

2. **Backend (FastAPI)**
   - Exposes REST APIs for authentication and CRUD operations (projects/agents/prompts).
   - Provides streaming chat endpoint using Server-Sent Events (SSE).
   - Stores persistent data in PostgreSQL.
   - Integrates with OpenAI Responses API for LLM inference.
   - Optional: supports file upload endpoint using OpenAI Files API.

---

## Technology Stack

### Frontend
- **Next.js** (React, App Router)
- **Tailwind CSS** (UI styling)
- Fetch-based API client (`apiFetch`) for backend communication

### Backend
- **FastAPI** (REST APIs + SSE streaming)
- **SQLAlchemy ORM**
- **Alembic** for database migrations
- **JWT Auth** (access tokens)
- **PostgreSQL** database

### External Services
- **OpenAI Responses API**
- Optional: **OpenAI Files API**

---

## Core Domain Model

### Entities (PostgreSQL)
- **User**
  - `id`, `email`, `password_hash`, timestamps
- **Project**
  - `id`, `user_id`, `name`, `description`, timestamps
- **Agent**
  - `id`, `project_id`, `name`, `system_prompt`, `model_provider`, `model_name`, timestamps
- **Prompt** (optional separate prompt storage)
  - `id`, `agent_id`, `title`, `content`, timestamps
- **Conversation / Message** (optional persistence)
  - Used for storing chat history per agent

---

## Backend API Design

### Authentication
- `POST /auth/register`
- `POST /auth/login`
- Uses JWT tokens (`Authorization: Bearer <token>`)

### Projects
- `GET /projects`
- `POST /projects`

### Agents
- `GET /projects/{project_id}/agents`
- `POST /projects/{project_id}/agents`

### Prompts
- `GET /agents/{agent_id}/prompts`
- `POST /agents/{agent_id}/prompts`

### Chat (Streaming)
- `POST /chat/agents/{agent_id}`
- Returns streamed events (SSE)
- Each response chunk is written as:
  - `data: { "text": "...", "conversation_id": "..." }`

### Files (Optional)
- `POST /files/upload`
- Accepts multipart upload → uploads to OpenAI Files API
- Returns OpenAI `file_id`

---

## Chat Flow

1. User selects an agent from the sidebar (dashboard).
2. UI opens `/chat/[agentId]`.
3. User sends a message (and optional file attachments).
4. Frontend calls backend streaming endpoint:
   - `POST /chat/agents/{agentId}`
5. Backend builds context:
   - system prompt + user messages + agent config
6. Backend calls OpenAI Responses API to generate response.
7. Tokens are streamed back to frontend as SSE events.
8. UI renders messages in ChatGPT-style interface.

---

## Authentication & Security

### Implemented Protections
- Password hashing via `bcrypt/passlib`
- JWT authentication middleware in backend
- Protected endpoints require valid token
- Frontend route guard blocks dashboard/chat if token missing

### Security Considerations
- JWT secret stored in `.env` (not committed)
- CORS configured for local frontend origins
- Input validation via Pydantic schemas
- Database access via scoped SQLAlchemy sessions

---

## Scalability & Extensibility Notes

### Scalability
- Multi-user and multi-project support via relational DB schema
- Stateless backend endpoints (JWT auth)
- Streaming responses reduce latency perception
- Can horizontally scale backend with shared database

### Extensibility
Planned/possible upgrades:
- Conversation/message persistence
- Analytics dashboards
- RAG / file search with vector storage
- Workspace / team management
- Multi-provider LLM routing (OpenAI, OpenRouter, etc.)

---

## Reliability & Error Handling

- Backend returns meaningful HTTP errors (400/401/500)
- LLM failures handled gracefully (rate limits, auth issues)
- Frontend displays fallback messages on chat errors
- Explicit env validation prevents silent failures

---

## Summary

This system provides a minimal but production-aligned structure for a multi-user chatbot platform. The architecture supports clean separation of concerns between UI, API, database, and LLM integration while being extensible for future enhancements such as retrieval, analytics, and integrations.
