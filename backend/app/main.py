from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, projects, agents, prompts, chat, files

app = FastAPI(title="Chatbot Platform API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local dev
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",

        # Production frontend
        "https://chatbot-pied-ten-29.vercel.app",
    ],
    # Allow all Vercel preview deployments
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# API ROUTERS (WITH PREFIX)
# =========================
API_PREFIX = "/api"

app.include_router(auth.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(prompts.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(files.router, prefix="/api")



@app.get("/health")
def health():
    return {"ok": True}
