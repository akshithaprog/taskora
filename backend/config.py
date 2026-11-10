"""App configuration. Override values with environment variables in production."""
import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
is_vercel = bool(os.environ.get("VERCEL"))

# Try creating instance directory; on read-only environments (e.g. Vercel), fall back to /tmp
instance_dir = os.path.join(BASE_DIR, "instance")
try:
    os.makedirs(instance_dir, exist_ok=True)
    db_path = os.path.join(instance_dir, "taskora.db")
except OSError:
    db_path = "/tmp/taskora.db"

if is_vercel and not os.environ.get("DATABASE_URL"):
    db_path = "/tmp/taskora.db"

database_url = os.environ.get("DATABASE_URL")
if database_url:
    # Some providers like Neon / Heroku / Supabase supply postgres://, which SQLAlchemy deprecated in favor of postgresql://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
else:
    database_url = f"sqlite:///{db_path}"

# Determine CORS origins
cors_env = os.environ.get("CORS_ORIGINS")
if cors_env:
    cors_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
elif is_vercel:
    cors_origins = ["*"]
else:
    cors_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]


class Config:
    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # IMPORTANT: set a long random JWT_SECRET_KEY before deploying anywhere public.
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-only-secret-change-me-please-0123456789")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    CORS_ORIGINS = cors_origins
