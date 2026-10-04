import os

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./trustfam.db")
    HELP_REQUEST_EXPIRY_DAYS: int = 7
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "tesseract")

settings = Settings()