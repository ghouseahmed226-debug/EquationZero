"""Health check endpoint"""
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/health")
def health():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "product": "EquationZero",
    }
