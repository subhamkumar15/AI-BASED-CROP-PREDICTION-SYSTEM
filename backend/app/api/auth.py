"""
Authentication and User Account Endpoints
AGRISENSE Platform
"""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_current_user
from backend.app.core.security import create_access_token, hash_password, verify_password
from backend.app.database.connection import get_db
from backend.app.models.models import AuditLog, User
from backend.app.schemas.schemas import PlanUpgrade, TokenResponse, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """Registers a new user account."""
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = User(
        email=user_in.email.lower(),
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role if user_in.role in ["farmer", "researcher", "admin"] else "farmer",
        region=user_in.region or "North India",
        phone=user_in.phone,
        subscription="free"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log action
    audit = AuditLog(user_id=user.id, action="USER_REGISTERED", details=f"New user registered: {user.email}")
    db.add(audit)
    db.commit()

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)) -> Any:
    """Authenticates user with email and password."""
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive."
        )

    # Log action
    audit = AuditLog(user_id=user.id, action="USER_LOGIN", details=f"User logged in: {user.email}")
    db.add(audit)
    db.commit()

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)) -> Any:
    """Retrieves authenticated user profile."""
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    full_name: str,
    phone: str = None,
    region: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Updates user profile information."""
    current_user.full_name = full_name
    if phone is not None:
        current_user.phone = phone
    if region is not None:
        current_user.region = region
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/upgrade-plan", response_model=UserResponse)
def upgrade_plan(
    upgrade_in: PlanUpgrade,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Upgrades subscription tier ('free', 'pro', 'enterprise')."""
    if upgrade_in.plan_id not in ["free", "pro", "enterprise"]:
        raise HTTPException(status_code=400, detail="Invalid plan identifier.")
    
    current_user.subscription = upgrade_in.plan_id
    audit = AuditLog(
        user_id=current_user.id,
        action="PLAN_UPGRADED",
        details=f"User {current_user.email} switched to {upgrade_in.plan_id.upper()} plan"
    )
    db.add(audit)
    db.commit()
    db.refresh(current_user)
    return current_user
