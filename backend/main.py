from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from dotenv import load_dotenv

# Load environment variables from .env file — override=True ensures
# .env always wins over shell-level env vars (e.g. AWS_DEFAULT_REGION)
load_dotenv(override=True)

from api.routes_auth import router as auth_router
from api.routes_chat import router as chat_router
from api.routes_vision import router as vision_router
from api.routes_rag import router as rag_router
from api.routes_recommendations import router as recommendations_router
from api.routes_users import router as users_router

app = FastAPI(
    title="Swavalambi AI Gateway Backend",
    description="Backend for conversational intent extraction, skill assessment, and dynamic routing.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/api/chat", tags=["AI Gateway Chat"])
app.include_router(vision_router, prefix="/api/vision", tags=["Vision Assessment"])
app.include_router(rag_router, prefix="/api/rag", tags=["RAG Personalization"])
app.include_router(recommendations_router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(users_router, prefix="/api/users", tags=["User Profiles"])

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Handler for AWS Lambda (Mangum wrapper)
handler = Mangum(app)
