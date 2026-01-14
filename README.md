# Chatbot Platform MVP

A minimal multi-tenant Chatbot Platform that supports authentication, project/agent creation, prompt management, and a chat interface connected to an LLM provider (OpenAI Responses API).

---

## About the Project

This project is a minimal version of a chatbot platform with:
- User Registration & Login (JWT Authentication)
- Projects under each user
- Agents inside projects
- Prompts stored per agent
- Chat UI to interact with an agent
- Conversations and messages stored in PostgreSQL

---

## Project Structure

chatbot-platform/
backend/ # FastAPI backend
app/
core/ # config, security, dependencies
db/ # db session/base
models/ # SQLAlchemy models
routers/ # API routes (auth/projects/agents/prompts/chat)
schemas/ # request/response validation
services/ # LLM integration (OpenAI)
main.py # FastAPI app entry
alembic/ # migrations
requirements.txt
.env.example

frontend/ # Next.js frontend
app/ # pages (register/login/dashboard/chat)
lib/ # api helpers
package.json
.env.example

README.md
.gitignore

yaml
Copy code

---

## Fork & Clone

### 1) Fork the repository
1. Open the GitHub repository page
2. Click **Fork**
3. Select your GitHub account

### 2) Clone your fork
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
Requirements
Install the following on your system:

Backend Requirements
Python 3.11 / 3.12 recommended

PostgreSQL 14+

Frontend Requirements
Node.js 18+

npm 9+

Tools
Git

Docker is NOT required if PostgreSQL is already installed locally.

Local Setup & Run (Proper Order)
Step 1: Create PostgreSQL Database (One time)
Make sure PostgreSQL is running.

Create the database:

bash
Copy code
psql -U <POSTGRES_USER>
sql
Copy code
CREATE DATABASE chatbot;
\q
Step 2: Run Backend Locally (FastAPI)
2.1 Go to backend folder
bash
Copy code
cd backend
2.2 Create .env
bash
Copy code
cp .env.example .env
Update backend/.env with your values:

env
Copy code
DATABASE_URL=postgresql+psycopg://<POSTGRES_USER>:<POSTGRES_PASSWORD>@localhost:5432/chatbot
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
OPENAI_MODEL=gpt-4o-mini
JWT_SECRET=<YOUR_JWT_SECRET>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
Note: If your password contains special characters (e.g. @, #, /, :), URL-encode them.
Example: @ → %40

2.3 Create virtual environment
Windows PowerShell
powershell
Copy code
py -m venv .venv
.venv\Scripts\activate
macOS/Linux
bash
Copy code
python3 -m venv .venv
source .venv/bin/activate
2.4 Install dependencies
bash
Copy code
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
2.5 Run migrations
bash
Copy code
python -m alembic upgrade head
(First-time only if migrations are not created)

bash
Copy code
python -m alembic init alembic
python -m alembic revision --autogenerate -m "init"
python -m alembic upgrade head
2.6 Start backend server
bash
Copy code
uvicorn app.main:app --reload --port 8000
Backend will run at:

http://127.0.0.1:8000

Useful endpoints:

Health: http://127.0.0.1:8000/health

API Docs: http://127.0.0.1:8000/docs

✅ Keep backend running and open a new terminal for frontend.

Step 3: Run Frontend Locally (Next.js)
3.1 Go to frontend folder
bash
Copy code
cd ../frontend
3.2 Install dependencies
bash
Copy code
npm install
3.3 Create .env
bash
Copy code
cp .env.example .env
Update frontend/.env:

env
Copy code
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
3.4 Run frontend
Default port (3000):

bash
Copy code
npm run dev
If port 3000 is busy, run on 3001:

bash
Copy code
npm run dev -- -p 3001
Frontend will run at:

http://localhost:3000
or

http://localhost:3001

Application Usage (Quick Flow)
Open frontend in browser

Register a new user

Login

Create Project

Create Agent

Open Agent chat and send messages

Notes
If you change .env files, restart the corresponding server.

Make sure backend CORS allows the frontend port (3000/3001) if needed.

makefile
Copy code
::contentReference[oaicite:0]{index=0}
