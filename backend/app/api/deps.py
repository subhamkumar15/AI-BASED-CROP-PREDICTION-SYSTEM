"""
API Authentication and Authorization Dependencies
AGRISENSE Platform
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from backend.app.core.security import decode_access_token
from backend.app.database.connection import get_db
from backend.app.models.models import User

security = HTTPBearer(auto_error=False)

def get_current_user_optional(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Returns the authenticated user if valid token is provided, else None."""
    if not auth_header:
        return None
    token = auth_header.credentials
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user

def get_current_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Requires a valid JWT Bearer token."""
    user = get_current_user_optional(auth_header, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or have expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account."
        )
    return user

def get_current_active_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Enforces administrator role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to authorized platform administrators."
        )
    return current_user
