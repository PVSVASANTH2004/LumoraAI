from dataclasses import dataclass

from firebase_admin import auth

from app.core.exceptions import AuthenticationError
from app.core.logging import get_logger
from app.firebase.client import get_firebase_app

logger = get_logger(__name__)


@dataclass
class FirebaseUser:
    uid: str
    email: str
    name: str | None
    email_verified: bool


_DEV_TOKEN = "lumora-dev-token"


def verify_firebase_token(id_token: str) -> FirebaseUser:
    """
    Verify a Firebase ID token and return the decoded user.
    In dev mode, accepts the hardcoded lumora-dev-token bypass.
    Raises AuthenticationError on failure.
    """
    from app.core.config import get_settings
    settings = get_settings()

    if settings.dev_mode and id_token == _DEV_TOKEN:
        return FirebaseUser(
            uid=settings.dev_user_id,
            email="dev@lumora.ai",
            name="Dev User",
            email_verified=True,
        )

    try:
        get_firebase_app()
        decoded = auth.verify_id_token(id_token)
        return FirebaseUser(
            uid=decoded["uid"],
            email=decoded.get("email", ""),
            name=decoded.get("name"),
            email_verified=decoded.get("email_verified", False),
        )
    except auth.ExpiredIdTokenError:
        raise AuthenticationError("Token has expired")
    except auth.InvalidIdTokenError as e:
        raise AuthenticationError(f"Invalid token: {e}")
    except Exception as e:
        logger.warning("token_verification_failed", error=str(e))
        raise AuthenticationError("Authentication failed")
