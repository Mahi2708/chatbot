🤖 Chatbot Platform

A full-stack Chatbot Platform that allows users to create projects, configure AI agents, and interact with them through a modern ChatGPT-style interface.
The platform supports authentication, project-based organization, agent configuration, and real-time AI chat using OpenAI models.

✨ Key Features

User authentication (Register / Login)

Project-based organization

Multiple AI agents per project

ChatGPT-style dashboard with sidebar

Agent chat with message history

Secure JWT-based authentication

PostgreSQL database with migrations

Modern dark UI built using Tailwind CSS

🧱 Tech Stack
Frontend

Next.js (App Router)

React

TypeScript

Tailwind CSS

Backend

FastAPI

SQLAlchemy

Alembic

PostgreSQL

JWT Authentication

OpenAI API

✅ Requirements
System Requirements

Node.js ≥ 18

npm ≥ 9

Python 3.11 / 3.12 (recommended)

PostgreSQL ≥ 14

Git

Docker is not required for running the project locally.

🏗️ Architecture & Design Overview

The Chatbot Platform follows a modular, layered architecture that cleanly separates concerns between the frontend, backend, and database. This design improves scalability, maintainability, and developer productivity.

1️⃣ High-Level Architecture
┌──────────────┐        HTTP / JSON        ┌──────────────┐
│  Frontend    │  ─────────────────────▶  │   Backend    │
│  (Next.js)   │                          │  (FastAPI)   │
└──────────────┘                          └──────────────┘
                                                 │
                                                 │ SQLAlchemy ORM
                                                 ▼
                                         ┌────────────────┐
                                         │  PostgreSQL DB │
                                         └────────────────┘
                                                 │
                                                 │ API Calls
                                                 ▼
                                          ┌─────────────┐
                                          │ OpenAI API  │
                                          └─────────────┘
🚀 Running the Project Locally
1️⃣ Clone the Repository
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

🗄️ Backend Setup (FastAPI)
2️⃣ Create PostgreSQL Database (One-time)

Ensure PostgreSQL is running locally.

psql -U <POSTGRES_USER>

CREATE DATABASE chatbot;
\q

3️⃣ Configure Backend Environment Variables

Navigate to backend directory:

cd backend


Copy the environment template:

cp .env.example .env


Edit backend/.env and provide actual values:

DATABASE_URL=postgresql+psycopg://<DB_USER>:<DB_PASSWORD>@localhost:5432/chatbot
JWT_SECRET=<YOUR_JWT_SECRET>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
OPENAI_MODEL=gpt-4o-mini

Notes

Generate a secure JWT secret:

python -c "import secrets; print(secrets.token_hex(32))"


If your database password contains special characters (@, :, /, etc.), URL-encode it
Example:
@ → %40

4️⃣ Create Python Virtual Environment

Windows (PowerShell)

py -m venv .venv
.venv\Scripts\activate


macOS / Linux

python3 -m venv .venv
source .venv/bin/activate

5️⃣ Install Backend Dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

6️⃣ Run Database Migrations
python -m alembic upgrade head

7️⃣ Start Backend Server
uvicorn app.main:app --reload --port 8000


Backend will be available at:

http://127.0.0.1:8000


Useful endpoints:

Health check: http://127.0.0.1:8000/health

API documentation: http://127.0.0.1:8000/docs

✅ Keep the backend running and open a new terminal for the frontend.

🌐 Frontend Setup (Next.js)
8️⃣ Navigate to Frontend Directory
cd ../frontend

9️⃣ Install Frontend Dependencies
npm install

🔟 Configure Frontend Environment Variables

Copy the environment template:

cp .env.example .env


Update frontend/.env:

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

1️⃣1️⃣ Start Frontend Development Server

Default port (3000):

npm run dev


If port 3000 is busy:

npm run dev -- -p 3001


Frontend will be available at:

http://localhost:3000
or
http://localhost:3001

🧪 Application Usage Flow

Open the frontend in a browser

Register a new user

Login with credentials

Create a project

Create one or more agents

Open an agent chat

Start interacting with the AI

⚠️ Important Notes

Always copy .env.example → .env before running

Restart servers after updating .env files

Backend must be running before frontend

Ensure PostgreSQL service is running locally

Make sure CORS allows frontend ports (3000 / 3001)

📄 License

This project is intended for educational and development purposes.
