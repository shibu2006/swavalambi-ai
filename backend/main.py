from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from dotenv import load_dotenv
import os
import json
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Load environment variables from .env file — override=True ensures
# .env always wins over shell-level env vars (e.g. AWS_DEFAULT_REGION)
load_dotenv(override=True)

# If running in Lambda with Secrets Manager, load credentials into env vars
# so agents can access them via os.getenv() as usual
def _load_secrets_to_env():
    secret_name = os.getenv("AI_SECRETS_NAME")
    use_local = os.getenv("USE_LOCAL_CREDENTIALS", "true").lower() == "true"
    if use_local or not secret_name:
        return
    try:
        import boto3
        client = boto3.client("secretsmanager", region_name=os.getenv("AWS_REGION", "us-east-1"))
        secret = client.get_secret_value(SecretId=secret_name)
        creds = json.loads(secret["SecretString"])
        # Populate env vars so agents can use them transparently
        if "anthropic" in creds and "api_key" in creds["anthropic"]:
            os.environ["ANTHROPIC_API_KEY"] = creds["anthropic"]["api_key"]
        if "openai" in creds and "api_key" in creds["openai"]:
            os.environ["OPENAI_API_KEY"] = creds["openai"]["api_key"]
    except Exception as e:
        print(f"[WARN] Failed to load secrets from Secrets Manager: {e}")

_load_secrets_to_env()

from api.routes_auth import router as auth_router
from api.routes_chat import router as chat_router
from api.routes_vision import router as vision_router
from api.routes_rag import router as rag_router
from api.routes_recommendations import router as recommendations_router
from api.routes_users import router as users_router
from api.routes_voice import router as voice_router
from api.routes_profile_picture import router as profile_picture_router

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
app.include_router(voice_router, prefix="/api/voice", tags=["Voice Services"])
app.include_router(rag_router, prefix="/api/rag", tags=["RAG Personalization"])
app.include_router(recommendations_router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(users_router, prefix="/api/users", tags=["User Profiles"])
app.include_router(profile_picture_router, prefix="/api", tags=["Profile Picture"])

@app.on_event("startup")
async def startup_event():
    """Initialize S3 bucket on startup."""
    try:
        from services.s3_service import S3Service
        s3_service = S3Service()
        s3_service.ensure_bucket_exists()
    except Exception as e:
        logging.error(f"Failed to initialize S3 bucket: {e}")

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Handler for AWS Lambda (Mangum wrapper)
# Configure Mangum to handle API Gateway v2 with stage prefix
handler = Mangum(app, lifespan="off", api_gateway_base_path="/prod")
