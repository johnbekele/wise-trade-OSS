from fastapi import HTTPException, BackgroundTasks
from app.repositories.auth_repository import AuthRepository
from app.schemas.auth_schema import AuthTokenRead, TokenPayload, LoginResponse
from app.core.security import security_manager
from typing import Optional
from app.repositories.users_repository import UsersRepository
from app.services.email_service import EmailService
from app.core.config import settings
from app.schemas.user_schema import UserRead


class AuthService:
    def __init__(self):
        self.auth_repository = AuthRepository()
        self.security_manager = security_manager
        self.users_repository = UsersRepository()
        self.email_service = EmailService()

    async def create_token(self, token: str, payload: dict, token_type: str):
        if token_type == "email_verification":
            token = self.security_manager.create_verification_token(payload["sub"])
        elif token_type == "password_reset":
            token = self.security_manager.create_reset_token(payload["sub"])
        elif token_type == "refresh":
            token = self.security_manager.create_refresh_token(payload)
        elif token_type == "access":
            token = self.security_manager.create_access_token(payload)
        else:
            raise ValueError("Invalid token type")
        await self.auth_repository.create_token(token, payload["sub"], token_type)
        return token
